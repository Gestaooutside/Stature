import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import { eq, inArray, isNotNull, and } from 'drizzle-orm';
import { getAsaasPayment } from '@/lib/services/asaas';

/**
 * Mapeamento de status do Asaas para status local
 */
const ASAAS_STATUS_MAPPING: Record<string, { orderStatus: string; paymentStatus: string }> = {
  'PENDING': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'PENDING' },
  'AWAITING_RISK_ANALYSIS': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AWAITING_RISK_ANALYSIS' },
  'AUTHORIZED': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AUTHORIZED' },
  'RECEIVED': { orderStatus: 'PAID', paymentStatus: 'RECEIVED' },
  'CONFIRMED': { orderStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED' },
  'RECEIVED_IN_CASH': { orderStatus: 'PAID', paymentStatus: 'RECEIVED_IN_CASH' },
  'OVERDUE': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'OVERDUE' },
  'REFUNDED': { orderStatus: 'REFUNDED', paymentStatus: 'REFUNDED' },
  'REFUND_REQUESTED': { orderStatus: 'PAID', paymentStatus: 'REFUND_REQUESTED' },
  'CHARGEBACK_REQUESTED': { orderStatus: 'PAID', paymentStatus: 'CHARGEBACK_REQUESTED' },
  'CHARGEBACK_DISPUTE': { orderStatus: 'PAID', paymentStatus: 'CHARGEBACK_DISPUTE' },
  'AWAITING_CHARGEBACK_REVERSAL': { orderStatus: 'PAID', paymentStatus: 'AWAITING_CHARGEBACK_REVERSAL' },
  'DUNNING_REQUESTED': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'DUNNING_REQUESTED' },
  'DUNNING_RECEIVED': { orderStatus: 'PAID', paymentStatus: 'DUNNING_RECEIVED' },
  'CANCELLED': { orderStatus: 'CANCELLED', paymentStatus: 'CANCELLED' },
  'FAILED': { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
};

/**
 * POST /api/admin/orders/sync-pending
 * Sincroniza todos os pedidos pendentes com a API do Asaas
 * Respeita rate limiting: máximo 100 requisições por minuto (delay de 600ms entre cada)
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

    // Busca pedidos pendentes com asaasPaymentId
    const pendingOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        asaasPaymentId: orders.asaasPaymentId,
        paymentId: payments.id,
        paymentAsaasId: payments.asaasPaymentId,
        paymentStatus: payments.status,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(
        and(
          inArray(orders.status, ['AWAITING_PAYMENT', 'PENDING']),
          isNotNull(orders.asaasPaymentId)
        )
      )
      .limit(100); // Limite para não sobrecarregar

    if (pendingOrders.length === 0) {
      return NextResponse.json({
        message: 'Nenhum pedido pendente para sincronizar',
        synced: 0,
        failed: 0,
        results: []
      });
    }

    console.log(`[SyncBatch] Iniciando sincronização de ${pendingOrders.length} pedidos pendentes`);

    const results: Array<{
      orderId: string;
      success: boolean;
      previousStatus: string;
      newStatus?: string;
      error?: string;
    }> = [];

    let synced = 0;
    let failed = 0;

    // Processa cada pedido com delay para rate limiting
    for (const order of pendingOrders) {
      const asaasPaymentId = order.asaasPaymentId || order.paymentAsaasId;
      
      if (!asaasPaymentId) {
        results.push({
          orderId: order.id,
          success: false,
          previousStatus: order.status,
          error: 'Sem asaasPaymentId'
        });
        failed++;
        continue;
      }

      try {
        // Consulta Asaas
        const asaasPayment = await getAsaasPayment(asaasPaymentId);
        const mapping = ASAAS_STATUS_MAPPING[asaasPayment.status];

        if (!mapping) {
          results.push({
            orderId: order.id,
            success: false,
            previousStatus: order.status,
            error: `Status não mapeado: ${asaasPayment.status}`
          });
          failed++;
          continue;
        }

        // Atualiza pedido
        await db
          .update(orders)
          .set({
            status: mapping.orderStatus as typeof orders.$inferSelect.status,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        // Atualiza pagamento se existir
        if (order.paymentId) {
          const isPaid = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH', 'DUNNING_RECEIVED'].includes(asaasPayment.status);
          await db
            .update(payments)
            .set({
              status: mapping.paymentStatus as typeof payments.$inferSelect.status,
              paidAt: isPaid ? (asaasPayment.paymentDate ? new Date(asaasPayment.paymentDate) : new Date()) : null,
              updatedAt: new Date(),
            })
            .where(eq(payments.id, order.paymentId));
        }

        results.push({
          orderId: order.id,
          success: true,
          previousStatus: order.status,
          newStatus: mapping.orderStatus
        });
        synced++;

      } catch (error) {
        results.push({
          orderId: order.id,
          success: false,
          previousStatus: order.status,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        failed++;
      }

      // Rate limiting: 600ms entre requisições (100 por minuto)
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    console.log(`[SyncBatch] Concluído: ${synced} sincronizados, ${failed} falhas`);

    return NextResponse.json({
      message: `Sincronização concluída: ${synced} atualizados, ${failed} falhas`,
      synced,
      failed,
      total: pendingOrders.length,
      results
    });

  } catch (error) {
    console.error('[SyncBatch] Erro:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao sincronizar pedidos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
