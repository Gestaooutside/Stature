import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, coupons, commissionRecords, prescribers } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Endpoint de debug para diagnóstico do sistema de comissões
 * GET /api/admin/commissions/debug
 */
export async function GET(request: NextRequest) {
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

    // 1. Conta total de pedidos pagos
    const paidOrders = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ['PAID', 'CONFIRMED']));

    // 2. Conta pedidos pagos COM cupom
    const ordersWithCoupon = paidOrders.filter(order => {
      const couponCode = order.metadata && typeof order.metadata === 'object' 
        ? (order.metadata as any).couponCode 
        : null;
      return !!couponCode;
    });

    // 3. Conta registros de comissão
    const commissions = await db.select().from(commissionRecords);

    // 4. Lista cupons com prescritores
    const couponsWithPrescribers = await db
      .select()
      .from(coupons)
      .where(eq(coupons.prescriberId, coupons.prescriberId));

    // 5. Lista todos os prescritores
    const allPrescribers = await db.select().from(prescribers);

    // 6. Amostras de dados
    const sampleOrder = paidOrders[0];
    const sampleCommission = commissions[0];

    // 7. Lista códigos de cupons usados
    const couponCodesUsed = ordersWithCoupon.map(order => {
      return (order.metadata as any)?.couponCode;
    }).filter(Boolean);

    // 8. Verifica quais cupons existem no banco
    const existingCoupons = await db
      .select()
      .from(coupons);

    return NextResponse.json({
      summary: {
        totalPaidOrders: paidOrders.length,
        ordersWithCoupon: ordersWithCoupon.length,
        ordersWithoutCoupon: paidOrders.length - ordersWithCoupon.length,
        totalCommissions: commissions.length,
        totalCoupons: existingCoupons.length,
        couponsWithPrescribers: existingCoupons.filter(c => c.prescriberId).length,
        totalPrescribers: allPrescribers.length
      },
      details: {
        couponCodesUsed: [...new Set(couponCodesUsed)],
        existingCouponCodes: existingCoupons.map(c => c.code),
        sampleOrder: sampleOrder ? {
          id: sampleOrder.id,
          status: sampleOrder.status,
          total: sampleOrder.total,
          metadata: sampleOrder.metadata,
          createdAt: sampleOrder.createdAt
        } : null,
        sampleCommission: sampleCommission ? {
          id: sampleCommission.id,
          orderId: sampleCommission.orderId,
          saleAmount: sampleCommission.saleAmount,
          prescriberCommission: sampleCommission.prescriberCommissionAmount,
          representativeCommission: sampleCommission.representativeCommissionAmount,
          createdAt: sampleCommission.createdAt
        } : null
      },
      diagnosis: {
        hasOrders: paidOrders.length > 0,
        hasCoupons: existingCoupons.length > 0,
        hasPrescribers: allPrescribers.length > 0,
        hasCommissions: commissions.length > 0,
        ordersHaveCoupons: ordersWithCoupon.length > 0,
        couponsHavePrescribers: existingCoupons.some(c => c.prescriberId),
        recommendation: getRecommendation(
          paidOrders.length,
          ordersWithCoupon.length,
          existingCoupons.length,
          allPrescribers.length,
          commissions.length
        )
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[Debug Commissions] Erro:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function getRecommendation(
  orders: number,
  ordersWithCoupon: number,
  coupons: number,
  prescribers: number,
  commissions: number
): string {
  if (orders === 0) {
    return '⚠️ Não há pedidos pagos no sistema';
  }
  if (ordersWithCoupon === 0) {
    return '⚠️ Nenhum pedido pago utilizou cupom';
  }
  if (coupons === 0) {
    return '⚠️ Não há cupons cadastrados';
  }
  if (prescribers === 0) {
    return '⚠️ Não há prescritores cadastrados';
  }
  if (commissions === 0) {
    return '❌ Há pedidos com cupons mas nenhuma comissão foi gerada. Execute o processamento.';
  }
  return '✅ Sistema configurado corretamente';
}
