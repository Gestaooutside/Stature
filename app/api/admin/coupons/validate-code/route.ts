import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, ilike, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * POST /api/admin/coupons/validate-code
 * Valida se um código de cupom já existe e sugere alternativas
 * Body: { code: string }
 * Response: { exists: boolean, suggestion?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 }
      );
    }

    const code = body.code.toUpperCase().trim();

    // Verifica se código já existe (case-insensitive)
    const [existingCoupon] = await db
      .select({ id: coupons.id, code: coupons.code })
      .from(coupons)
      .where(sql`UPPER(${coupons.code}) = ${code}`)
      .limit(1);

    if (existingCoupon) {
      // Gera sugestão de código alternativo
      let suggestion = null;
      let suffix = 1;
      let maxAttempts = 10;

      while (suffix <= maxAttempts) {
        const suggestedCode = `${code}${suffix}`;
        const [existing] = await db
          .select({ id: coupons.id })
          .from(coupons)
          .where(sql`UPPER(${coupons.code}) = ${suggestedCode}`)
          .limit(1);

        if (!existing) {
          suggestion = suggestedCode;
          break;
        }
        suffix++;
      }

      // Se não encontrou com número, tenta com timestamp
      if (!suggestion) {
        const timestamp = Date.now().toString().slice(-4);
        suggestion = `${code}${timestamp}`;
      }

      return NextResponse.json({
        exists: true,
        message: 'Código já existe',
        suggestion,
      });
    }

    return NextResponse.json({
      exists: false,
      message: 'Código disponível',
    });

  } catch (error) {
    console.error('Erro ao validar código:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
