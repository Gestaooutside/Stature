import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { generatePayoutReport } from '@/lib/services/payouts';

/**
 * API para buscar saldos devedores de todas as entidades
 * GET /api/admin/payouts/balances
 */
export async function GET(request: NextRequest) {
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

    // Gera relatório de saldos
    const balances = await generatePayoutReport();

    return NextResponse.json({ balances }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar saldos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
