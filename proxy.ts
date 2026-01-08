import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/session';

/**
 * Middleware para proteger rotas admin
 * Usa JWT para validação rápida sem consultas ao banco de dados
 * Compatible com Edge Runtime
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso à página de login sem autenticação
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Para todas as outras rotas /admin/*, verificar autenticação
  if (pathname.startsWith('/admin')) {
    // Obter token JWT do cookie
    const token = request.cookies.get('duo_admin_session')?.value;

    // Se não houver token, redirecionar para login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se o token JWT é válido (SEM consulta ao banco)
    const session = await verifyToken(token);

    // Se o token não for válido ou estiver expirado, redirecionar para login
    if (!session || new Date(session.expires) < new Date()) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Usuário autenticado - permitir acesso
    return NextResponse.next();
  }

  return NextResponse.next();
}
