import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAsaasPayment } from '@/lib/services/asaas';

/**
 * Mapeamento de status do Asaas para status local
 * Referência: https://docs.asaas.com/docs/status-do-pagamento
 */
const ASAAS_STATUS_MAPPING: Record<string, { orderStatus: string; paymentStatus: string }> = {
  // Pendentes
  'PENDING': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'PENDING' },
  'AWAITING_RISK_ANALYSIS': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AWAITING_RISK_ANALYSIS' },
  
  // Confirmados
  'AUTHORIZED': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'AUTHORIZED' },
  'RECEIVED': { orderStatus: 'PAID', paymentStatus: 'RECEIVED' },
  'CONFIRMED': { orderStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED' },
  'RECEIVED_IN_CASH': { orderStatus: 'PAID', paymentStatus: 'RECEIVED_IN_CASH' },
  
  // Vencidos
  'OVERDUE': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'OVERDUE' },
  
  // Reembolsados
  'REFUNDED': { orderStatus: 'REFUNDED', paymentStatus: 'REFUNDED' },
  'REFUND_REQUESTED': { orderStatus: 'PAID', paymentStatus: 'REFUND_REQUESTED' },
  
  // Chargebacks
  'CHARGEBACK_REQUESTED': { orderStatus: 'PAID', paymentStatus: 'CHARGEBACK_REQUESTED' },
  'CHARGEBACK_DISPUTE': { orderStatus: 'PAID', paymentStatus: 'CHARGEBACK_DISPUTE' },
  'AWAITING_CHARGEBACK_REVERSAL': { orderStatus: 'PAID', paymentStatus: 'AWAITING_CHARGEBACK_REVERSAL' },
  
  // Recuperação de crédito
  'DUNNING_REQUESTED': { orderStatus: 'AWAITING_PAYMENT', paymentStatus: 'DUNNING_REQUESTED' },
  'DUNNING_RECEIVED': { orderStatus: 'PAID', paymentStatus: 'DUNNING_RECEIVED' },
  
  // Cancelados/Falhas
  'CANCELLED': { orderStatus: 'CANCELLED', paymentStatus: 'CANCELLED' },
  'FAILED': { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
};

/**
 * POST /api/admin/orders/[id]/sync
 * Sincroniza o status de um pedido com a API do Asaas
 * Busca o pagamento pelo asaasPaymentId e atualiza o status local
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verifica autenticação
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

    // Busca o pedido com dados de pagamento
    const [order] = await db
      .select({
        id: orders.id,
        status: orders.status,
        asaasPaymentId: orders.asaasPaymentId,
        payment: {
          id: payments.id,
          asaasPaymentId: payments.asaasPaymentId,
          status: payments.status,
        }
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Determina qual ID do Asaas usar (pode estar no pedido ou no pagamento)
    const asaasPaymentId = order.asaasPaymentId || order.payment?.asaasPaymentId;

    if (!asaasPaymentId) {
      return NextResponse.json({ 
        error: 'Pedido não possui ID de pagamento Asaas vinculado',
        suggestion: 'Este pedido pode ter sido criado manualmente ou ter falha na integração'
      }, { status: 400 });
    }

    console.log(`[Sync] Sincronizando pedido ${id} com Asaas payment ${asaasPaymentId}`);

    // Busca o status atual no Asaas com retry
    let asaasPayment;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        asaasPayment = await getAsaasPayment(asaasPaymentId);
        break;
      } catch (error) {
        attempts++;
        console.error(`[Sync] Tentativa ${attempts}/${maxAttempts} falhou:`, error);
        
        if (attempts >= maxAttempts) {
          return NextResponse.json({ 
            error: 'Falha ao consultar API do Asaas após múltiplas tentativas',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
          }, { status: 503 });
        }
        
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
      }
    }

    if (!asaasPayment) {
      return NextResponse.json({ error: 'Pagamento não encontrado no Asaas' }, { status: 404 });
    }

    const asaasStatus = asaasPayment.status;
    const mapping = ASAAS_STATUS_MAPPING[asaasStatus];

    if (!mapping) {
      console.warn(`[Sync] Status desconhecido do Asaas: ${asaasStatus}`);
      return NextResponse.json({ 
        error: `Status não mapeado: ${asaasStatus}`,
        suggestion: 'Contate o suporte técnico para adicionar este status ao mapeamento'
      }, { status: 400 });
    }

    const previousStatus = order.status;
    const previousPaymentStatus = order.payment?.status;

    // Atualiza o pedido
    await db
      .update(orders)
      .set({
        status: mapping.orderStatus as typeof orders.$inferSelect.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    // Atualiza o pagamento se existir
    if (order.payment?.id) {
      await db
        .update(payments)
        .set({
          status: mapping.paymentStatus as typeof payments.$inferSelect.status,
          paidAt: ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH', 'DUNNING_RECEIVED'].includes(asaasStatus)
            ? asaasPayment.paymentDate ? new Date(asaasPayment.paymentDate) : new Date()
            : null,
          netValue: asaasPayment.netValue?.toString() || null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, order.payment.id));
    }

    // Log de auditoria
    console.log(`[Sync] Sincronização concluída:`, {
      orderId: id,
      asaasPaymentId,
      asaasStatus,
      previousOrderStatus: previousStatus,
      newOrderStatus: mapping.orderStatus,
      previousPaymentStatus,
      newPaymentStatus: mapping.paymentStatus,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Pedido sincronizado com sucesso',
      sync: {
        orderId: id,
        asaasPaymentId,
        asaasStatus,
        previousOrderStatus: previousStatus,
        newOrderStatus: mapping.orderStatus,
        previousPaymentStatus,
        newPaymentStatus: mapping.paymentStatus,
        paidAt: asaasPayment.paymentDate,
        netValue: asaasPayment.netValue,
      }
    });

  } catch (error) {
    console.error('[Sync] Erro ao sincronizar pedido:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao sincronizar pedido',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
