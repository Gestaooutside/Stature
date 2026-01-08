import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, payments, paymentEvents, leads, coupons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateAndRecordCommissions } from '@/lib/services/commissions';

/**
 * Webhook handler para eventos do Asaas
 * Recebe notificações de pagamento e atualiza status no banco
 * 
 * Eventos suportados:
 * - PAYMENT_RECEIVED: Pagamento recebido (PIX/Boleto)
 * - PAYMENT_CONFIRMED: Pagamento confirmado (Cartão)
 * - PAYMENT_OVERDUE: Pagamento vencido
 * - PAYMENT_REFUNDED: Pagamento estornado
 * - PAYMENT_DELETED: Pagamento deletado
 * - PAYMENT_CHARGEBACK_*: Eventos de chargeback
 */

// Mapeamento de status Asaas para status local
const STATUS_MAPPING: Record<string, { 
  orderStatus: typeof orders.$inferSelect.status;
  paymentStatus: typeof payments.$inferSelect.status;
}> = {
  'PENDING': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'PENDING' },
  'AWAITING_RISK_ANALYSIS': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AWAITING_RISK_ANALYSIS' },
  'AUTHORIZED': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AUTHORIZED' },
  'RECEIVED': { orderStatus: 'PAID', paymentStatus: 'RECEIVED' },
  'CONFIRMED': { orderStatus: 'PAID', paymentStatus: 'CONFIRMED' },
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

// Eventos que indicam pagamento confirmado
const PAID_EVENTS = [
  'PAYMENT_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_DUNNING_RECEIVED',
];

/**
 * POST /api/webhooks/asaas
 * Recebe notificações de eventos do Asaas
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { event, payment: asaasPayment } = body;

    // Log do evento recebido
    console.log(`[Webhook Asaas] ====== EVENTO RECEBIDO ======`);
    console.log(`[Webhook Asaas] Evento: ${event}`);
    console.log(`[Webhook Asaas] Payment ID: ${asaasPayment?.id}`);
    console.log(`[Webhook Asaas] Status: ${asaasPayment?.status}`);
    console.log(`[Webhook Asaas] External Ref: ${asaasPayment?.externalReference}`);

    // Valida payload básico
    if (!event || !asaasPayment?.id) {
      console.error(`[Webhook Asaas] Payload inválido - evento ou payment ausente`);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Registra evento para auditoria
    await db.insert(paymentEvents).values({
      asaasPaymentId: asaasPayment.id,
      event,
      payload: body,
    });

    // Busca pedido pelo asaasPaymentId ou externalReference (orderId)
    let order = await db.query.orders.findFirst({
      where: eq(orders.asaasPaymentId, asaasPayment.id),
    });

    // Fallback: busca por externalReference (que é o orderId)
    if (!order && asaasPayment.externalReference) {
      order = await db.query.orders.findFirst({
        where: eq(orders.id, asaasPayment.externalReference),
      });
    }

    if (!order) {
      console.warn(`[Webhook Asaas] Pedido não encontrado para payment ${asaasPayment.id}`);
      // Retorna 200 para não reprocessar - pedido pode ter sido criado em outro sistema
      return NextResponse.json({ 
        received: true, 
        warning: 'Pedido não encontrado' 
      });
    }

    console.log(`[Webhook Asaas] Pedido encontrado: ${order.id}`);
    console.log(`[Webhook Asaas] Status atual: ${order.status}`);

    // Mapeia status do Asaas para status local
    const mapping = STATUS_MAPPING[asaasPayment.status];
    if (!mapping) {
      console.warn(`[Webhook Asaas] Status não mapeado: ${asaasPayment.status}`);
      return NextResponse.json({ 
        received: true, 
        warning: `Status não mapeado: ${asaasPayment.status}` 
      });
    }

    // Atualiza pedido
    await db
      .update(orders)
      .set({
        status: mapping.orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    console.log(`[Webhook Asaas] Pedido atualizado: ${order.status} → ${mapping.orderStatus}`);

    // Atualiza pagamento
    const isPaid = PAID_EVENTS.includes(event);
    const paymentUpdate = await db
      .update(payments)
      .set({
        status: mapping.paymentStatus,
        paidAt: isPaid ? (asaasPayment.paymentDate ? new Date(asaasPayment.paymentDate) : new Date()) : null,
        updatedAt: new Date(),
      })
      .where(eq(payments.asaasPaymentId, asaasPayment.id));

    console.log(`[Webhook Asaas] Pagamento atualizado para: ${mapping.paymentStatus}`);

    // Se pagamento confirmado, marca lead como convertido
    if (isPaid && order.leadId) {
      await db
        .update(leads)
        .set({
          convertedToSale: true,
          conversionDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(leads.id, order.leadId));

      console.log(`[Webhook Asaas] Lead ${order.leadId} marcado como convertido`);
    }

    // Se pagamento confirmado, registra comissões
    if (isPaid) {
      try {
        // Extrai cupom usado do metadata
        const couponCode = order.metadata && typeof order.metadata === 'object' 
          ? (order.metadata as any).couponCode 
          : null;

        if (couponCode) {
          // Busca cupom pelo código
          const coupon = await db.query.coupons.findFirst({
            where: eq(coupons.code, couponCode.toUpperCase())
          });

          if (coupon && coupon.prescriberId) {
            // Calcula e registra comissões
            const saleAmount = Number(order.total);
            await calculateAndRecordCommissions(order.id, coupon.id, saleAmount);
            console.log(`[Webhook Asaas] ✅ Comissões calculadas para pedido ${order.id}`);
          } else {
            console.log(`[Webhook Asaas] ⚠️ Cupom ${couponCode} não tem prescritor vinculado`);
          }
        } else {
          console.log(`[Webhook Asaas] ℹ️ Pedido ${order.id} não usou cupom`);
        }
      } catch (commissionError) {
        // Log erro mas não falha o webhook
        console.error(`[Webhook Asaas] ❌ Erro ao registrar comissões:`, commissionError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Webhook Asaas] ====== PROCESSADO EM ${duration}ms ======`);

    // Resposta rápida para não travar fila do Asaas
    return NextResponse.json({ 
      received: true,
      orderId: order.id,
      newStatus: mapping.orderStatus,
    });

  } catch (error) {
    console.error(`[Webhook Asaas] ERRO:`, error);
    
    // Retorna 500 para que o Asaas tente novamente
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/asaas
 * Health check para verificar se o endpoint está ativo
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook Asaas endpoint está ativo',
    timestamp: new Date().toISOString(),
  });
}
