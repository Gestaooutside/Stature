import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * API Route para criar assinaturas recorrentes no ASAAS
 * POST /api/asaas/create-subscription
 *
 * Criado especificamente para cupons recorrentes que ativam assinaturas mensais
 */

// Configuração da API ASAAS
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

/**
 * Valida e cria uma assinatura recorrente no ASAAS
 * Requer: cupom recorrente, dados do cliente, dados do cartão
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica se a chave da API ASAAS está configurada
    if (!ASAAS_API_KEY) {
      console.error('Chave da API ASAAS não configurada');
      return NextResponse.json(
        { error: 'Erro de configuração do pagamento' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = [
      'couponCode',
      'subtotal',
      'totalAmount',
      'customer',
      'creditCard',
      'creditCardHolderInfo'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }

    const {
      couponCode,
      subtotal,
      totalAmount,
      discountAmount,
      customer,
      creditCard,
      creditCardHolderInfo,
      billingAddress
    } = body;

    // 1. Busca informações do cupom
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode))
      .limit(1);

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // 2. Valida se o cupom é recorrente
    if (!coupon.isRecurring) {
      return NextResponse.json(
        { error: 'Este cupom não é recorrente' },
        { status: 400 }
      );
    }

    // 3. Validação de recorrência já foi feita acima

    // 4. Prepara payload para ASAAS
    const nextDueDate = new Date().toISOString().split('T')[0]; // Hoje
    const subscriptionPayload = {
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      nextDueDate: nextDueDate,
      value: Number(totalAmount),
      cycle: 'MONTHLY', // Fixado em mensal conforme requisito
      description: `Assinatura DUO - Cupom ${couponCode}`,
      creditCard: {
        holderName: creditCard.holderName,
        number: creditCard.number,
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.ccv
      },
      creditCardHolderInfo: {
        name: creditCardHolderInfo.name,
        email: creditCardHolderInfo.email,
        cpfCnpj: creditCardHolderInfo.cpfCnpj,
        postalCode: creditCardHolderInfo.postalCode,
        addressNumber: creditCardHolderInfo.addressNumber,
        addressComplement: creditCardHolderInfo.addressComplement || '',
        phone: creditCardHolderInfo.phone || '',
        mobilePhone: creditCardHolderInfo.mobilePhone || ''
      }
    };

    // 5. Cria assinatura no ASAAS
    const asaasResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(subscriptionPayload)
    });

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text();
      console.error('Erro na API ASAAS:', errorText);

      // Tenta extrair mensagem de erro
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          {
            error: 'Erro ao criar assinatura',
            details: errorData.errors?.[0]?.description || errorData.error || 'Erro desconhecido'
          },
          { status: 400 }
        );
      } catch {
        return NextResponse.json(
          { error: 'Erro ao criar assinatura. Tente novamente.' },
          { status: 400 }
        );
      }
    }

    const subscriptionData = await asaasResponse.json();

    // 6. Log para auditoria
    console.log('Assinatura criada com sucesso:', {
      subscriptionId: subscriptionData.id,
      customerId: customer.id,
      couponCode: couponCode,
      value: totalAmount,
      cycle: 'MONTHLY'
    });

    // 7. Retorna sucesso
    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionData.id,
      customerId: customer.id,
      nextDueDate: nextDueDate,
      value: totalAmount,
      cycle: 'MONTHLY',
      description: `Assinatura DUO - Cupom ${couponCode}`,
      message: 'Assinatura recorrente criada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar assinatura' },
      { status: 500 }
    );
  }
}

/**
 * Busca informações de uma assinatura específica
 * GET /api/asaas/create-subscription?id={subscriptionId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID da assinatura é obrigatório' },
        { status: 400 }
      );
    }

    const asaasResponse = await fetch(
      `${ASAAS_API_URL}/subscriptions/${subscriptionId}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    if (!asaasResponse.ok) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    const subscriptionData = await asaasResponse.json();

    return NextResponse.json({
      success: true,
      subscription: subscriptionData
    });

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assinatura' },
      { status: 500 }
    );
  }
}