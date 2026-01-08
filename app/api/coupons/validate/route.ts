import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * API Route para validação de cupons no checkout
 * POST /api/coupons/validate
 *
 * Valida cupom e retorna informações de desconto
 * Todas as validações ocorrem no servidor para segurança
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação de entrada
    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Código do cupom é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.subtotal || typeof body.subtotal !== 'number' || body.subtotal <= 0) {
      return NextResponse.json(
        { valid: false, message: 'Valor do subtotal é obrigatório' },
        { status: 400 }
      );
    }

    const code = body.code.toUpperCase().trim();
    const subtotal = body.subtotal;

    // Busca cupom no banco de dados
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    // Cupom não existe
    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: 'Cupom inválido' },
        { status: 404 }
      );
    }

    // Validação 1: Cupom está ativo
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, message: 'Este cupom não está mais ativo' },
        { status: 400 }
      );
    }

    // Validação 2: Cupom não expirou
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, message: 'Este cupom expirou' },
        { status: 400 }
      );
    }

    // Validação 3: Cupom não atingiu limite de usos
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, message: 'Este cupom atingiu o limite de usos' },
        { status: 400 }
      );
    }

    // Validação 4: Valor mínimo de compra
    if (coupon.minPurchaseAmount) {
      const minAmount = parseFloat(String(coupon.minPurchaseAmount));
      if (subtotal < minAmount) {
        return NextResponse.json(
          {
            valid: false,
            message: `Valor mínimo de compra para este cupom é R$ ${minAmount.toFixed(2)}`,
          },
          { status: 400 }
        );
      }
    }

    // NOTA: Incremento de uso movido para API de pedidos
    // O contador só é incrementado quando o pedido é criado com sucesso
    // Isso evita que cupons sejam "gastos" em tentativas abandonadas

    // Calcula desconto baseado no tipo
    const discountValue = parseFloat(String(coupon.discount));

    // Verifica se é cupom recorrente e ajusta mensagem
    let discountMessage;
    if (coupon.isRecurring) {
      discountMessage =
        coupon.discountType === 'percentage'
          ? `Cupom recorrente aplicado! ${discountValue}% de desconto mensal`
          : `Cupom recorrente aplicado! R$ ${discountValue.toFixed(2)} de desconto mensal`;
    } else {
      discountMessage =
        coupon.discountType === 'percentage'
          ? `Cupom aplicado! ${discountValue}% de desconto`
          : `Cupom aplicado! R$ ${discountValue.toFixed(2)} de desconto`;
    }

    // Retorna informações do cupom aplicado incluindo recorrência
    return NextResponse.json(
      {
        valid: true,
        discountType: coupon.discountType,
        discount: discountValue,
        message: discountMessage,
        couponCode: coupon.code,
        description: coupon.description,
        // Informações de recorrência
        isRecurring: coupon.isRecurring,
        recurringCycle: coupon.recurringCycle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
