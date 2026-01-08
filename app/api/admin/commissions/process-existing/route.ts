import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, coupons, commissionRecords } from '@/lib/db/schema';
import { eq, and, inArray, notInArray, sql } from 'drizzle-orm';
import { calculateAndRecordCommissions } from '@/lib/services/commissions';

/**
 * API Route para processar comissões de pedidos pagos existentes
 * POST /api/admin/commissions/process-existing
 * 
 * Busca todos os pedidos pagos que:
 * - Estão com status PAID ou CONFIRMED
 * - Usaram um cupom
 * - Ainda não possuem registro de comissão
 * 
 * E cria os registros de comissão retroativamente
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    console.log('[Process Commissions] Iniciando processamento de pedidos existentes...');

    // Busca IDs de pedidos que JÁ possuem comissão registrada
    const ordersWithCommissions = await db
      .select({ orderId: commissionRecords.orderId })
      .from(commissionRecords);

    const processedOrderIds = ordersWithCommissions.map(r => r.orderId);

    // Busca pedidos pagos sem comissão registrada
    const paidOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.status, ['PAID', 'CONFIRMED']),
          processedOrderIds.length > 0 
            ? notInArray(orders.id, processedOrderIds)
            : sql`true`
        )
      );

    console.log(`[Process Commissions] Encontrados ${paidOrders.length} pedidos para processar`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;
    const results = [];

    for (const order of paidOrders) {
      try {
        // Extrai cupom do metadata
        const couponCode = order.metadata && typeof order.metadata === 'object' 
          ? (order.metadata as any).couponCode 
          : null;

        if (!couponCode) {
          skipped++;
          results.push({
            orderId: order.id,
            status: 'skipped',
            reason: 'Sem cupom'
          });
          continue;
        }

        // Busca cupom
        const coupon = await db.query.coupons.findFirst({
          where: eq(coupons.code, couponCode.toUpperCase())
        });

        if (!coupon) {
          skipped++;
          results.push({
            orderId: order.id,
            status: 'skipped',
            reason: `Cupom ${couponCode} não encontrado`
          });
          continue;
        }

        if (!coupon.prescriberId) {
          skipped++;
          results.push({
            orderId: order.id,
            status: 'skipped',
            reason: `Cupom ${couponCode} sem prescritor`
          });
          continue;
        }

        // Calcula e registra comissões
        const saleAmount = Number(order.total);
        const commissionRecord = await calculateAndRecordCommissions(
          order.id,
          coupon.id,
          saleAmount
        );

        if (commissionRecord) {
          processed++;
          results.push({
            orderId: order.id,
            status: 'processed',
            couponCode: couponCode,
            saleAmount: saleAmount,
            prescriberCommission: commissionRecord.prescriberCommissionAmount,
            representativeCommission: commissionRecord.representativeCommissionAmount
          });
        }
      } catch (error) {
        errors++;
        results.push({
          orderId: order.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        console.error(`[Process Commissions] Erro ao processar pedido ${order.id}:`, error);
      }
    }

    console.log(`[Process Commissions] Processamento concluído:`);
    console.log(`  - Processados: ${processed}`);
    console.log(`  - Ignorados: ${skipped}`);
    console.log(`  - Erros: ${errors}`);

    return NextResponse.json({
      success: true,
      summary: {
        total: paidOrders.length,
        processed,
        skipped,
        errors
      },
      details: results
    }, { status: 200 });

  } catch (error) {
    console.error('[Process Commissions] Erro fatal:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
