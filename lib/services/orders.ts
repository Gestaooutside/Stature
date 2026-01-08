import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { orders, orderItems, payments, coupons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_PRICE_MAP, validateAndCalculateCart, getProductById, expandCartItems, calculateShipping } from '@/lib/config/products';
import {
  AsaasPaymentRequest,
  AsaasPaymentResponse,
  BillingType,
  CreditCardData,
  CreditCardHolderInfo,
  PaymentStatus,
} from '@/lib/types/payment';
import { createAsaasPayment } from './asaas';

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface CouponInput {
  code: string;
  discount?: number; // valor fixo
  discountPercent?: number; // percentual
  discountType: 'percentage' | 'fixed';
}

interface CreateOrderParams {
  asaasCustomerId: string;
  billingType: BillingType;
  items: CartItemInput[];
  leadId?: string;
  customerReference?: string;
  coupon?: CouponInput;
  description?: string;
  metadata?: Record<string, any>;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  remoteIp?: string;
  customerSnapshot?: Record<string, any>;
}

const DEFAULT_DESCRIPTION = 'Compra DUO - Suplemento Natural';

function formatCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function formatDateYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

function mapPaymentStatus(status: PaymentStatus): PaymentStatus {
  switch (status) {
    case 'RECEIVED_IN_CASH':
      return 'RECEIVED';
    case 'DUNNING_RECEIVED':
      return 'RECEIVED';
    case 'REFUND_REQUESTED':
    case 'CHARGEBACK_REQUESTED':
    case 'CHARGEBACK_DISPUTE':
    case 'AWAITING_CHARGEBACK_REVERSAL':
      return 'REFUNDED';
    case 'DUNNING_REQUESTED':
    case 'AWAITING_RISK_ANALYSIS':
      return 'PENDING';
    default:
      return status;
  }
}

function deriveOrderStatus(paymentStatus: PaymentStatus): typeof orders.$inferSelect.status {
  switch (paymentStatus) {
    case 'RECEIVED':
    case 'CONFIRMED':
      return 'PAID';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'CANCELLED':
    case 'FAILED':
      return 'CANCELLED';
    default:
      return 'AWAITING_PAYMENT';
  }
}

function buildAsaasPayload(
  orderId: string,
  params: CreateOrderParams,
  total: number
  // Removido discountValue pois o desconto já está aplicado no total
): AsaasPaymentRequest {
  const payload: AsaasPaymentRequest = {
    customer: params.asaasCustomerId,
    billingType: params.billingType,
    value: formatCurrency(total),
    dueDate: formatDateYMD(
      params.billingType === 'CREDIT_CARD' ? new Date() : defaultDueDate()
    ),
    description: params.description || DEFAULT_DESCRIPTION,
    externalReference: orderId,
    // IMPORTANTE: Não enviar campo 'discount' pois o desconto já foi aplicado no cálculo do total
    // O ASAAS aplicaria o desconto novamente se este campo fosse enviado
  };

  if (params.billingType === 'CREDIT_CARD' && params.creditCard && params.creditCardHolderInfo) {
    const cleanPhone = params.creditCardHolderInfo.phone.replace(/[^\d]/g, '');
    
    payload.creditCard = params.creditCard;
    payload.creditCardHolderInfo = {
      ...params.creditCardHolderInfo,
      cpfCnpj: params.creditCardHolderInfo.cpfCnpj.replace(/[^\d]/g, ''),
      postalCode: params.creditCardHolderInfo.postalCode.replace(/[^\d]/g, ''),
      phone: cleanPhone,
      // mobilePhone é obrigatório conforme ASAAS - usa phone como fallback se não fornecido
      mobilePhone: params.creditCardHolderInfo.mobilePhone?.replace(/[^\d]/g, '') || cleanPhone,
    };
    payload.remoteIp = params.remoteIp;
  }

  return payload;
}

function normalizeReferenceValue(value?: number): string {
  return formatCurrency(value ?? 0).toString();
}

/**
 * Cria pedido e pagamento no sistema
 * Inclui logs detalhados para debug do fluxo de pagamento
 */
export async function createOrderWithPayment(params: CreateOrderParams) {
  console.log(`[Orders] ====== INÍCIO CRIAÇÃO DE PEDIDO ======`);
  console.log(`[Orders] Cliente Asaas: ${params.asaasCustomerId}`);
  console.log(`[Orders] Tipo de pagamento: ${params.billingType}`);
  console.log(`[Orders] Itens:`, JSON.stringify(params.items, null, 2));
  
  if (!params.items || params.items.length === 0) {
    console.error(`[Orders] ERRO: Carrinho vazio`);
    throw new Error('Carrinho vazio');
  }

  // Valida que remoteIp é obrigatório para pagamentos de cartão conforme ASAAS
  if (params.billingType === 'CREDIT_CARD' && !params.remoteIp) {
    console.error(`[Orders] ERRO: remoteIp não fornecido para cartão de crédito`);
    throw new Error('IP do cliente é obrigatório para pagamentos com cartão de crédito');
  }

  const cartItems = params.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  // Valida carrinho e calcula total com preços oficiais
  const subtotal = formatCurrency(validateAndCalculateCart(cartItems));
  console.log(`[Orders] Subtotal calculado: R$ ${subtotal}`);

  // Calcula desconto baseado no tipo do cupom
  let discountValue = 0;
  if (params.coupon) {
    if (params.coupon.discountType === 'percentage' && params.coupon.discountPercent) {
      discountValue = formatCurrency((subtotal * params.coupon.discountPercent) / 100);
      console.log(`[Orders] Desconto: R$ ${discountValue} (${params.coupon.discountPercent}%)`);
    } else if (params.coupon.discountType === 'fixed' && params.coupon.discount) {
      discountValue = formatCurrency(Math.min(params.coupon.discount, subtotal));
      console.log(`[Orders] Desconto: R$ ${discountValue} (fixo)`);
    }
  } else {
    console.log(`[Orders] Desconto: R$ 0.00`);
  }

  const subtotalAfterDiscount = formatCurrency(subtotal - discountValue);
  const shipping = formatCurrency(calculateShipping(subtotalAfterDiscount));
  const total = formatCurrency(subtotalAfterDiscount + shipping);
  console.log(`[Orders] Subtotal c/ desconto: R$ ${subtotalAfterDiscount}`);
  console.log(`[Orders] Frete calculado: R$ ${shipping}`);
  console.log(`[Orders] Total final: R$ ${total}`);
  
  if (total <= 0) {
    console.error(`[Orders] ERRO: Total inválido após desconto`);
    throw new Error('Valor total inválido após desconto');
  }

  const orderItemsPayload = cartItems.map((item) => {
    const product = getProductById(item.productId);
    const unitPrice = PRODUCT_PRICE_MAP[item.productId];
    return {
      orderId: '', // preenchido depois
      productId: item.productId,
      name: product?.name ?? item.productId,
      unitPrice: normalizeReferenceValue(unitPrice),
      quantity: item.quantity,
      total: normalizeReferenceValue(unitPrice * item.quantity),
    };
  });

  const orderId = randomUUID();
  console.log(`[Orders] Order ID gerado: ${orderId}`);
  
  const asaasPayload = buildAsaasPayload(orderId, params, total);
  console.log(`[Orders] Payload ASAAS construído, chamando createAsaasPayment...`);
  
  const paymentResponse = await createAsaasPayment(asaasPayload);
  
  console.log(`[Orders] ====== RESPOSTA DO ASAAS ======`);
  console.log(`[Orders] Payment ID: ${paymentResponse.id}`);
  console.log(`[Orders] Status: ${paymentResponse.status}`);
  console.log(`[Orders] Billing Type: ${paymentResponse.billingType}`);
  
  // Log específico para PIX
  if (params.billingType === 'PIX') {
    const pixQrCode = (paymentResponse as any).pixQrCode;
    console.log(`[Orders] ====== DADOS PIX ======`);
    console.log(`[Orders] pixQrCode presente: ${pixQrCode ? 'SIM' : 'NÃO'}`);
    if (pixQrCode) {
      console.log(`[Orders] pixQrCode.encodedImage: ${pixQrCode.encodedImage ? `SIM (${pixQrCode.encodedImage.length} chars)` : 'NÃO'}`);
      console.log(`[Orders] pixQrCode.payload: ${pixQrCode.payload ? `SIM (${pixQrCode.payload.length} chars)` : 'NÃO'}`);
      console.log(`[Orders] pixQrCode.expirationDate: ${pixQrCode.expirationDate || 'NÃO'}`);
    } else {
      console.warn(`[Orders] ATENÇÃO: pixQrCode não presente na resposta!`);
      console.log(`[Orders] Resposta completa do pagamento:`, JSON.stringify(paymentResponse, null, 2));
    }
  }
  const normalizedPaymentStatus = mapPaymentStatus(paymentResponse.status);
  const initialOrderStatus = deriveOrderStatus(normalizedPaymentStatus);

  const expandedItems = expandCartItems(cartItems);
  const orderMetadata = {
    ...(params.metadata || {}),
    couponCode: params.coupon?.code ?? null,
    expandedItems,
    customerSnapshot: params.customerSnapshot || null,
  };

  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      leadId: params.leadId || null,
      customerId: params.customerReference || null,
      asaasCustomerId: params.asaasCustomerId,
      asaasPaymentId: paymentResponse.id,
      status: initialOrderStatus,
      billingType: params.billingType,
      subtotal: normalizeReferenceValue(subtotal),
      discount: normalizeReferenceValue(discountValue),
      shipping: normalizeReferenceValue(shipping),
      total: normalizeReferenceValue(total),
      metadata: orderMetadata,
    });

    if (orderItemsPayload.length) {
      await tx.insert(orderItems).values(
        orderItemsPayload.map((item) => ({
          ...item,
          orderId,
        }))
      );
    }

    await tx.insert(payments).values({
      orderId,
      asaasPaymentId: paymentResponse.id,
      customerId: paymentResponse.customer,
      status: normalizedPaymentStatus,
      billingType: paymentResponse.billingType,
      value: normalizeReferenceValue(paymentResponse.value),
      netValue: paymentResponse.netValue ? normalizeReferenceValue(paymentResponse.netValue) : null,
      dueDate: paymentResponse.dueDate ? new Date(paymentResponse.dueDate) : null,
      paidAt: paymentResponse.paymentDate ? new Date(paymentResponse.paymentDate) : null,
      payload: paymentResponse,
    });

    // Incrementa contador de uso do cupom apenas quando pedido é criado com sucesso
    // Isso evita que cupons sejam "gastos" em tentativas abandonadas
    if (params.coupon?.code) {
      const [coupon] = await tx
        .select()
        .from(coupons)
        .where(eq(coupons.code, params.coupon.code.toUpperCase()))
        .limit(1);

      if (coupon) {
        await tx
          .update(coupons)
          .set({
            currentUses: coupon.currentUses + 1,
            updatedAt: new Date(),
          })
          .where(eq(coupons.id, coupon.id));
      }
    }
  });

  const result = {
    orderId,
    orderStatus: initialOrderStatus,
    totals: {
      subtotal,
      discount: discountValue,
      shipping,
      total,
    },
    payment: paymentResponse,
  };

  console.log(`[Orders] ====== FIM CRIAÇÃO DE PEDIDO ======`);
  console.log(`[Orders] Order ID: ${result.orderId}`);
  console.log(`[Orders] Order Status: ${result.orderStatus}`);
  console.log(`[Orders] Payment ID: ${result.payment.id}`);
  
  // Log específico do retorno para PIX
  if (params.billingType === 'PIX') {
    const pixQrCode = (result.payment as any).pixQrCode;
    console.log(`[Orders] pixQrCode no retorno final: ${pixQrCode ? 'SIM' : 'NÃO'}`);
  }

  return result;
}

