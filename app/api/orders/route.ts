import { NextRequest, NextResponse } from 'next/server';
import { BillingType, CreditCardData, CreditCardHolderInfo } from '@/lib/types/payment';
import { createOrderWithPayment } from '@/lib/services/orders';
import { validateAndCalculateCart } from '@/lib/config/products';

interface OrderRequestBody {
  customerId: string;
  billingType: BillingType;
  items: Array<{ productId: string; quantity: number }>;
  couponCode?: string;
  discountPercent?: number;
  leadId?: string;
  description?: string;
  metadata?: Record<string, any>;
  customerSnapshot?: Record<string, any>;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  remoteIp?: string;
}

function validateItems(items: Array<{ productId: string; quantity: number }> | undefined) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(
    (item) =>
      item &&
      typeof item.productId === 'string' &&
      item.productId.trim().length > 0 &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );
}

function validateCreditCardPayload(cardData?: CreditCardData, holderInfo?: CreditCardHolderInfo): string | null {
  if (!cardData || !holderInfo) return 'Dados do cartão não fornecidos';

  if (!cardData.holderName || cardData.holderName.trim().length < 3) {
    return 'Nome no cartão inválido';
  }

  if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
    return 'Número do cartão inválido';
  }

  if (!cardData.expiryMonth || !cardData.expiryYear) {
    return 'Data de validade inválida';
  }

  if (!cardData.ccv || cardData.ccv.length < 3) {
    return 'Código de segurança inválido';
  }

  if (!holderInfo.name || !holderInfo.email || !holderInfo.cpfCnpj) {
    return 'Dados do titular incompletos';
  }

  if (!holderInfo.postalCode || !holderInfo.addressNumber) {
    return 'Endereço do titular incompleto';
  }

  if (!holderInfo.phone) {
    return 'Telefone do titular é obrigatório';
  }

  // mobilePhone é obrigatório conforme documentação ASAAS para cartão de crédito
  // Se não fornecido explicitamente, será usado o phone como fallback no service
  
  return null;
}

/**
 * POST - Cria novo pedido com pagamento
 * Inclui logs detalhados para debug do fluxo
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Orders API][${requestId}] ====== INÍCIO REQUISIÇÃO ======`);
  
  try {
    const body = (await request.json()) as OrderRequestBody;

    console.log(`[Orders API][${requestId}] Dados recebidos:`);
    console.log(`[Orders API][${requestId}]   - customerId: ${body.customerId}`);
    console.log(`[Orders API][${requestId}]   - billingType: ${body.billingType}`);
    console.log(`[Orders API][${requestId}]   - items: ${body.items?.length || 0} item(s)`);
    console.log(`[Orders API][${requestId}]   - couponCode (req): ${body.couponCode || 'nenhum'}`);

    if (!body.customerId || typeof body.customerId !== 'string') {
      console.error(`[Orders API][${requestId}] ERRO: customerId inválido`);
      return NextResponse.json(
        { error: 'ID do cliente do Asaas é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.billingType || !['PIX', 'BOLETO', 'CREDIT_CARD'].includes(body.billingType)) {
      console.error(`[Orders API][${requestId}] ERRO: billingType inválido: ${body.billingType}`);
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      );
    }

    if (!validateItems(body.items)) {
      console.error(`[Orders API][${requestId}] ERRO: items inválidos`);
      return NextResponse.json(
        { error: 'Itens do carrinho inválidos' },
        { status: 400 }
      );
    }

    if (body.billingType === 'CREDIT_CARD') {
      const cardValidationError = validateCreditCardPayload(body.creditCard, body.creditCardHolderInfo);
      if (cardValidationError) {
        console.error(`[Orders API][${requestId}] ERRO: validação de cartão: ${cardValidationError}`);
        return NextResponse.json({ error: cardValidationError }, { status: 400 });
      }
    }

    // Obtém IP do cliente - obrigatório para pagamentos de cartão conforme ASAAS
    const clientIp = body.remoteIp || 
                     request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     request.ip ||
                     '127.0.0.1';
    console.log(`[Orders API][${requestId}] IP do cliente: ${clientIp}`);

    // Recalcula subtotal com preços oficiais para validar cupom e frete
    let subtotal: number;
    try {
      subtotal = validateAndCalculateCart(body.items);
    } catch (error: any) {
      console.error(`[Orders API][${requestId}] ERRO: validação de carrinho: ${error.message}`);
      return NextResponse.json(
        { error: 'Itens do carrinho inválidos' },
        { status: 400 }
      );
    }

    // Valida cupom no servidor para garantir tipo/valor correto
    let coupon: { code: string; discountType: 'percentage' | 'fixed'; discountPercent?: number; discount?: number } | undefined;
    if (body.couponCode) {
      const couponResponse = await fetch(`${request.nextUrl.origin}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: body.couponCode,
          subtotal,
        }),
      });

      if (!couponResponse.ok) {
        const error = await couponResponse.json();
        console.error(`[Orders API][${requestId}] ERRO: cupom inválido: ${error.message || couponResponse.statusText}`);
        return NextResponse.json(
          { error: error.message || 'Cupom inválido' },
          { status: 400 }
        );
      }

      const couponData = await couponResponse.json();
      coupon = {
        code: couponData.couponCode || body.couponCode.toUpperCase(),
        discountType: couponData.discountType,
      };

      if (couponData.discountType === 'percentage') {
        coupon.discountPercent = Number(couponData.discount);
      } else {
        // valor fixo; converte também para % para logs posteriores
        coupon.discount = Number(couponData.discount);
        coupon.discountPercent = subtotal > 0 ? Number(((couponData.discount / subtotal) * 100).toFixed(2)) : 0;
      }

      console.log(`[Orders API][${requestId}] Cupom validado:`, {
        code: coupon.code,
        type: coupon.discountType,
        percent: coupon.discountPercent,
        value: coupon.discount,
      });
    }

    console.log(`[Orders API][${requestId}] Chamando createOrderWithPayment...`);
    
    const result = await createOrderWithPayment({
      asaasCustomerId: body.customerId,
      billingType: body.billingType,
      items: body.items,
      leadId: body.leadId,
      description: body.description,
      coupon,
      metadata: body.metadata,
      creditCard: body.billingType === 'CREDIT_CARD' ? body.creditCard : undefined,
      creditCardHolderInfo: body.billingType === 'CREDIT_CARD' ? body.creditCardHolderInfo : undefined,
      remoteIp: clientIp,
      customerSnapshot: body.customerSnapshot,
    });

    console.log(`[Orders API][${requestId}] ====== RESULTADO ======`);
    console.log(`[Orders API][${requestId}] Order ID: ${result.orderId}`);
    console.log(`[Orders API][${requestId}] Order Status: ${result.orderStatus}`);
    console.log(`[Orders API][${requestId}] Payment ID: ${result.payment.id}`);
    console.log(`[Orders API][${requestId}] Payment Status: ${result.payment.status}`);

    // Log específico para PIX
    const pixQrCode = (result.payment as any).pixQrCode;
    if (body.billingType === 'PIX') {
      console.log(`[Orders API][${requestId}] ====== DADOS PIX NA RESPOSTA ======`);
      console.log(`[Orders API][${requestId}] pixQrCode presente: ${pixQrCode ? 'SIM' : 'NÃO'}`);
      if (pixQrCode) {
        console.log(`[Orders API][${requestId}]   - encodedImage: ${pixQrCode.encodedImage ? `SIM (${pixQrCode.encodedImage.length} chars)` : 'NÃO'}`);
        console.log(`[Orders API][${requestId}]   - payload: ${pixQrCode.payload ? `SIM (${pixQrCode.payload.length} chars)` : 'NÃO'}`);
        console.log(`[Orders API][${requestId}]   - expirationDate: ${pixQrCode.expirationDate || 'NÃO'}`);
      } else {
        console.warn(`[Orders API][${requestId}] ATENÇÃO: PIX solicitado mas pixQrCode não presente!`);
      }
    }

    // Monta resposta
    const responsePayload = {
      orderId: result.orderId,
      orderStatus: result.orderStatus,
      totals: result.totals,
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        value: result.payment.value,
        billingType: result.payment.billingType,
        invoiceUrl: result.payment.invoiceUrl,
        bankSlipUrl: result.payment.bankSlipUrl,
        pix: pixQrCode || null,
      },
    };

    console.log(`[Orders API][${requestId}] ====== RESPOSTA FINAL ======`);
    console.log(`[Orders API][${requestId}] payment.pix: ${responsePayload.payment.pix ? 'SIM' : 'NÃO (null)'}`);
    
    if (body.billingType === 'PIX' && !responsePayload.payment.pix) {
      console.error(`[Orders API][${requestId}] ERRO CRÍTICO: Pagamento PIX criado mas sem QR Code!`);
    }

    console.log(`[Orders API][${requestId}] ====== FIM REQUISIÇÃO (SUCESSO) ======`);

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error: any) {
    console.error(`[Orders API][${requestId}] ====== ERRO ======`);
    console.error(`[Orders API][${requestId}] Mensagem: ${error?.message}`);
    console.error(`[Orders API][${requestId}] Stack:`, error?.stack);
    
    const errorMessage = error?.message || 'Não foi possível criar o pedido';
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

