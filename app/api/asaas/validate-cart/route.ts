// API route para validar carrinho e calcular valor total
// Recalcula preços baseado em dados do servidor (não confia no frontend)

import { NextRequest, NextResponse } from 'next/server';
import { validateAndCalculateCart } from '@/lib/config/products';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ValidateCartRequest {
  items: CartItem[];
}

export interface ValidateCartResponse {
  subtotal: number;
  discount: number;
  total: number;
  valid: boolean;
  error?: string;
}

/**
 * POST - Valida carrinho e retorna valor total calculado no servidor
 * Não confia em valores enviados pelo frontend
 * Usa função centralizada de validação
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidateCartRequest = await request.json();

    // Valida e calcula usando função centralizada
    // Lança erro se houver qualquer problema
    const subtotal = validateAndCalculateCart(body.items);

    // Por enquanto, desconto é calculado no frontend via cupom
    // Aqui retornamos 0 e o desconto será aplicado no create-payment
    const discount = 0;
    const total = subtotal - discount;

    return NextResponse.json(
      {
        valid: true,
        subtotal,
        discount,
        total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao validar carrinho:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'Erro ao validar carrinho',
        subtotal: 0,
        discount: 0,
        total: 0,
      },
      { status: 400 }
    );
  }
}
