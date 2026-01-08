import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createSession } from '@/lib/auth/session';

/**
 * API Route para autenticação de usuários admin
 * POST /api/auth/login
 *
 * Body esperado:
 * {
 *   email: string,
 *   password: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Extrair dados do body
    const body = await request.json();
    const { email, password } = body;

    // Validar campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Autenticar usuário
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar sessão JWT
    await createSession(user.id, user.email, user.name || undefined);

    // Retornar sucesso com dados do usuário (sem senha)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
