import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Constantes de validação de status
 */
const VALID_ORDER_STATUSES = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED'];
const VALID_DELIVERY_STATUSES = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED'];
const VALID_PAYMENT_STATUSES = [
  'PENDING', 'AUTHORIZED', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 
  'REFUNDED', 'RECEIVED_IN_CASH', 'REFUND_REQUESTED', 
  'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL',
  'DUNNING_REQUESTED', 'DUNNING_RECEIVED', 'AWAITING_RISK_ANALYSIS',
  'CANCELLED', 'FAILED'
];

/**
 * GET /api/admin/orders/[id]
 * Retorna detalhes completos de um pedido
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('duo_admin_session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [order] = await db
      .select({
        order: orders,
        payment: payments,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order.order,
        total: Number(order.order.total),
        subtotal: Number(order.order.subtotal),
        discount: Number(order.order.discount),
        shipping: Number(order.order.shipping),
      },
      payment: order.payment ? {
        ...order.payment,
        value: Number(order.payment.value),
        netValue: order.payment.netValue ? Number(order.payment.netValue) : null,
      } : null,
    });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Atualiza status de entrega, pagamento e/ou pedido
 * Body: { status?, deliveryStatus?, paymentStatus?, reason? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('duo_admin_session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { status, deliveryStatus, paymentStatus, reason } = body;

    // Busca pedido existente
    const [existingOrder] = await db
      .select({
        order: orders,
        payment: payments,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Valida status do pedido
    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status de pedido inválido' }, { status: 400 });
    }

    // Valida status de entrega
    if (deliveryStatus && !VALID_DELIVERY_STATUSES.includes(deliveryStatus)) {
      return NextResponse.json({ error: 'Status de entrega inválido' }, { status: 400 });
    }

    // Valida status de pagamento
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Status de pagamento inválido' }, { status: 400 });
    }

    // Prepara dados para atualização do pedido
    const orderUpdateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status) {
      orderUpdateData.status = status;
    }

    if (deliveryStatus) {
      orderUpdateData.deliveryStatus = deliveryStatus;
    }

    // Atualiza o pedido
    const [updatedOrder] = await db
      .update(orders)
      .set(orderUpdateData)
      .where(eq(orders.id, id))
      .returning();

    // Atualiza o pagamento se houver alteração de paymentStatus
    let updatedPayment = null;
    if (paymentStatus && existingOrder.payment) {
      const paymentUpdateData: Record<string, unknown> = {
        status: paymentStatus,
        updatedAt: new Date(),
      };

      // Se marcando como pago, registra a data
      if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH', 'DUNNING_RECEIVED'].includes(paymentStatus)) {
        if (!existingOrder.payment.paidAt) {
          paymentUpdateData.paidAt = new Date();
        }
      }

      [updatedPayment] = await db
        .update(payments)
        .set(paymentUpdateData)
        .where(eq(payments.id, existingOrder.payment.id))
        .returning();
    }

    // Log de auditoria
    console.log('[Orders] Atualização manual de pedido:', {
      orderId: id,
      previousStatus: existingOrder.order.status,
      newStatus: status || existingOrder.order.status,
      previousDeliveryStatus: existingOrder.order.deliveryStatus,
      newDeliveryStatus: deliveryStatus || existingOrder.order.deliveryStatus,
      previousPaymentStatus: existingOrder.payment?.status,
      newPaymentStatus: paymentStatus || existingOrder.payment?.status,
      reason: reason || 'Não informado',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      message: 'Pedido atualizado com sucesso',
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.total),
      },
      payment: updatedPayment ? {
        ...updatedPayment,
        value: Number(updatedPayment.value),
      } : existingOrder.payment,
    });

  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
