// API route para criar pagamento no Asaas
// Suporta PIX, Boleto e Cartão de Crédito com desconto
// SEMPRE recalcula valor no servidor (não confia no frontend)

import { NextRequest, NextResponse } from 'next/server';
import {
  AsaasPaymentRequest,
  AsaasPaymentResponse,
  AsaasErrorResponse,
  BillingType,
  AsaasDiscount,
} from '@/lib/types/payment';
import { validateAndCalculateCart, calculateShipping } from '@/lib/config/products';

// Ambiente padrão: production
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'production';

/**
 * Retorna URL base da API Asaas conforme ambiente
 */
function getAsaasApiUrl(): string {
  const url = ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
  console.log(`[Create Payment] Ambiente: ${ASAAS_ENVIRONMENT}, URL: ${url}`);
  return url;
}

/**
 * Calcula data de vencimento (7 dias a partir de hoje para PIX/Boleto)
 */
function calculateDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

/**
 * Converte cupom de desconto do carrinho para formato Asaas
 */
function convertDiscountToAsaas(
  discountPercent: number,
  value: number
): AsaasDiscount {
  // Calcula valor fixo do desconto baseado na porcentagem
  const discountValue = (value * discountPercent) / 100;

  return {
    value: discountValue,
    dueDateLimitDays: 0, // Desconto válido até o vencimento
    type: 'FIXED',
  };
}

/**
 * Valida dados do cartão de crédito
 */
function validateCreditCardData(creditCard: any, holderInfo: any): string | null {
  if (!creditCard) return 'Dados do cartão não fornecidos';

  // Valida campos do cartão
  if (!creditCard.holderName || creditCard.holderName.trim().length < 3) {
    return 'Nome no cartão inválido';
  }

  if (!creditCard.number || creditCard.number.replace(/\s/g, '').length < 13) {
    return 'Número do cartão inválido';
  }

  if (!creditCard.expiryMonth || !creditCard.expiryYear) {
    return 'Data de validade inválida';
  }

  if (!creditCard.ccv || creditCard.ccv.length < 3) {
    return 'Código de segurança inválido';
  }

  // Valida dados do titular
  if (!holderInfo) return 'Dados do titular não fornecidos';

  if (!holderInfo.name || !holderInfo.email || !holderInfo.cpfCnpj) {
    return 'Dados do titular incompletos';
  }

  if (!holderInfo.postalCode || !holderInfo.addressNumber) {
    return 'Endereço do titular incompleto';
  }

  return null;
}

/**
 * POST - Cria novo pagamento no Asaas
 * SEGURANÇA: Recebe items, valida e calcula valor no servidor
 * NUNCA confia em valor enviado pelo frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação de campos obrigatórios
    if (!body.customer || !body.billingType || !body.items) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios faltando',
          message: 'ID do cliente, método de pagamento e items são obrigatórios',
        },
        { status: 400 }
      );
    }

    // VALIDAÇÃO CRÍTICA DE SEGURANÇA:
    // Recalcula valor total usando preços do servidor
    // Ignora qualquer valor enviado pelo frontend
    let calculatedValue: number;
    try {
      calculatedValue = validateAndCalculateCart(body.items);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Carrinho inválido',
          message: error.message || 'Erro ao validar items do carrinho',
        },
        { status: 400 }
      );
    }

    // Busca cupom no banco se código fornecido
    let discountPercent = 0;
    let discountType = 'percentage';
    let discountFixed = 0;

    if (body.couponCode) {
      const couponData = await fetch(`${request.nextUrl.origin}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: body.couponCode,
          subtotal: calculatedValue
        })
      });

      if (couponData.ok) {
        const coupon = await couponData.json();
        if (coupon.valid) {
          discountType = coupon.discountType;
          if (discountType === 'percentage') {
            discountPercent = coupon.discount;
          } else {
            discountFixed = coupon.discount;
          }
        }
      }
    }

    // Calcula valor do desconto baseado no tipo
    const discountValue = discountType === 'percentage'
      ? (calculatedValue * discountPercent) / 100
      : discountFixed;

    const subtotalAfterDiscount = calculatedValue - discountValue;
    const shipping = calculateShipping(subtotalAfterDiscount);
    const totalWithShipping = subtotalAfterDiscount + shipping;

    // Valida valor mínimo
    if (totalWithShipping < 1) {
      return NextResponse.json(
        {
          error: 'Valor inválido',
          message: 'Valor mínimo de R$ 1,00',
        },
        { status: 400 }
      );
    }

    // Valida tipo de cobrança
    const validBillingTypes: BillingType[] = ['PIX', 'BOLETO', 'CREDIT_CARD'];
    if (!validBillingTypes.includes(body.billingType)) {
      return NextResponse.json(
        {
          error: 'Método de pagamento inválido',
          message: 'Métodos aceitos: PIX, BOLETO, CREDIT_CARD',
        },
        { status: 400 }
      );
    }

    // Validação específica para PIX
    // Verifica se existe chave Pix ativa antes de criar pagamento
    if (body.billingType === 'PIX') {
      try {
        const baseUrl = request.nextUrl.origin;
        const pixKeyResponse = await fetch(`${baseUrl}/api/asaas/pix-key`, {
          method: 'GET',
        });

        if (pixKeyResponse.ok) {
          const pixKeyData = await pixKeyResponse.json();

          // Se Pix não está disponível, retorna erro específico
          if (!pixKeyData.available) {
            let errorMessage = 'O Pix não está disponível no momento.';

            if (pixKeyData.reason === 'ACCOUNT_NOT_APPROVED') {
              errorMessage =
                'O Pix não está disponível no momento. Para utilizá-lo, sua conta precisa estar aprovada.';
            } else if (pixKeyData.reason === 'NO_KEY_REGISTERED') {
              errorMessage =
                'O Pix não está disponível. Nenhuma chave Pix cadastrada na conta.';
            } else if (pixKeyData.reason === 'KEY_PENDING_ACTIVATION') {
              errorMessage =
                'O Pix não está disponível. Chave Pix aguardando ativação.';
            }

            return NextResponse.json(
              {
                error: 'Pix indisponível',
                message: errorMessage,
                reason: pixKeyData.reason,
                details: pixKeyData.details,
              },
              { status: 400 }
            );
          }
        }
      } catch (error) {
        console.error('Erro ao verificar chave Pix:', error);
        // Continua mesmo se verificação falhar (fallback)
      }
    }

    // Validação específica para cartão de crédito
    if (body.billingType === 'CREDIT_CARD') {
      const validationError = validateCreditCardData(
        body.creditCard,
        body.creditCardHolderInfo
      );

      if (validationError) {
        return NextResponse.json(
          {
            error: 'Dados do cartão inválidos',
            message: validationError,
          },
          { status: 400 }
        );
      }
    }

    // Prepara dados do pagamento
    // USA VALOR CALCULADO PELO SERVIDOR (nunca o valor do frontend)
    const paymentData: AsaasPaymentRequest = {
      customer: body.customer,
      billingType: body.billingType,
      value: totalWithShipping, // ← VALOR JÁ COM DESCONTO E FRETE APLICADOS
      dueDate: body.dueDate || calculateDueDate(),
      description: body.description || 'Compra DUO - Suplemento Natural',
      externalReference: body.externalReference,
      // IMPORTANTE: Não envia campo 'discount' pois o desconto já foi aplicado no cálculo do valor
      // Enviar desconto aqui faria com que ASAAS aplicasse o desconto duas vezes
    };

    // Adiciona dados específicos de cartão de crédito
    if (body.billingType === 'CREDIT_CARD') {
      paymentData.creditCard = {
        holderName: body.creditCard.holderName,
        number: body.creditCard.number.replace(/\s/g, ''), // Remove espaços
        expiryMonth: body.creditCard.expiryMonth,
        expiryYear: body.creditCard.expiryYear,
        ccv: body.creditCard.ccv,
      };

      paymentData.creditCardHolderInfo = {
        name: body.creditCardHolderInfo.name,
        email: body.creditCardHolderInfo.email,
        cpfCnpj: body.creditCardHolderInfo.cpfCnpj.replace(/[^\d]/g, ''),
        postalCode: body.creditCardHolderInfo.postalCode.replace(/[^\d]/g, ''),
        addressNumber: body.creditCardHolderInfo.addressNumber,
        addressComplement: body.creditCardHolderInfo.addressComplement,
        phone: body.creditCardHolderInfo.phone?.replace(/[^\d]/g, ''),
        mobilePhone: body.creditCardHolderInfo.mobilePhone?.replace(/[^\d]/g, ''),
      };

      // IP do cliente (obrigatório para cartão)
      paymentData.remoteIp = body.remoteIp || request.ip || '127.0.0.1';
    }

    // Chama API do Asaas
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Configuração inválida',
          message: 'API Key do Asaas não configurada',
        },
        { status: 500 }
      );
    }

    const asaasUrl = getAsaasApiUrl();

    // Para PIX, usa endpoint /lean/payments que retorna QR code diretamente
    // Para outros métodos, usa endpoint /payments padrão
    const endpoint = body.billingType === 'PIX'
      ? `${asaasUrl}/lean/payments`
      : `${asaasUrl}/payments`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    // Tratamento de erros da API Asaas
    if (!response.ok) {
      const errorData = data as AsaasErrorResponse;
      let errorMessage =
        errorData.errors?.[0]?.description ||
        errorData.message ||
        'Erro ao criar pagamento';

      // Tratamento específico para erros de Pix
      if (body.billingType === 'PIX') {
        // Verifica se o erro é relacionado à chave Pix não configurada
        if (
          errorMessage.toLowerCase().includes('pix') &&
          (errorMessage.toLowerCase().includes('aprovad') ||
            errorMessage.toLowerCase().includes('disponível') ||
            errorMessage.toLowerCase().includes('chave'))
        ) {
          errorMessage =
            'O Pix não está disponível no momento. Para utilizá-lo, sua conta precisa estar aprovada.';
        }
      }

      return NextResponse.json(
        {
          error: 'Erro ao criar pagamento',
          message: errorMessage,
          details: errorData.errors,
        },
        { status: response.status }
      );
    }

    const paymentResponse = data as AsaasPaymentResponse;

    // Log de debug para verificar resposta da API
    console.log('[DEBUG] Resposta da API Asaas:', JSON.stringify(data, null, 2));

    // PARA PIX: Buscar SEMPRE o QR Code explicitamente (comportamento padrão da API)
    if (body.billingType === 'PIX') {
      try {
        console.log('[INFO] Buscando QR Code PIX (busca primária obrigatória)...');
        const qrCodeResponse = await fetch(`${asaasUrl}/payments/${data.id}/pixQrCode`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            access_token: apiKey,
          },
        });

        if (qrCodeResponse.ok) {
          const qrCodeData = await qrCodeResponse.json();
          // Acopla o QR Code à resposta original
          data.pixQrCode = qrCodeData;
          console.log('[INFO] QR Code PIX obtido com sucesso:', {
            hasEncodedImage: !!qrCodeData.encodedImage,
            hasPayload: !!qrCodeData.payload,
            expirationDate: qrCodeData.expirationDate,
          });
        } else {
          console.error('[ERRO] Falha ao buscar QR Code PIX:', await qrCodeResponse.text());
          const errorText = await qrCodeResponse.text();
          console.error('[ERRO] Detalhes do erro:', errorText);
        }
      } catch (qrError) {
        console.error('[ERRO] Erro na busca do QR Code PIX:', qrError);
      }
    }

    // Mapeia pixQrCode para pix para manter compatibilidade com frontend
    // O QR Code agora é obtido SEMPRE via busca explícita para PIX
    if (body.billingType === 'PIX') {
      // Valida se pixQrCode foi retornado pela busca explícita
      if (!data.pixQrCode) {
        console.error('[ERRO] API Asaas não retornou pixQrCode para pagamento PIX');
        console.error('[ERRO] Dados recebidos:', data);

        return NextResponse.json(
          {
            error: 'Erro ao gerar QR Code PIX',
            message: 'O Pix não está disponível no momento. Para utilizá-lo, sua conta Asaas precisa ter uma chave Pix cadastrada e aprovada.',
            details: 'A API não retornou os dados do QR Code. Verifique se há uma chave Pix ativa na conta Asaas.',
          },
          { status: 400 }
        );
      }

      console.log('[DEBUG] QR Code PIX gerado com sucesso:', {
        hasEncodedImage: !!data.pixQrCode.encodedImage,
        hasPayload: !!data.pixQrCode.payload,
        expirationDate: data.pixQrCode.expirationDate,
      });

      return NextResponse.json(
        {
          ...paymentResponse,
          pix: data.pixQrCode, // Mapeia pixQrCode -> pix para compatibilidade
        },
        { status: 201 }
      );
    }

    return NextResponse.json(paymentResponse, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      {
        error: 'Erro interno',
        message: 'Erro ao processar requisição',
      },
      { status: 500 }
    );
  }
}
