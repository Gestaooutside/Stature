import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

/**
 * API Route para logout de usuários admin
 * POST /api/auth/logout
 *
 * Remove o cookie JWT da sessão
 */
export async function POST() {
  try {
    // Remover cookie JWT
    await deleteSession();

    return NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
