import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Configuração do JWT
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
const COOKIE_NAME = 'duo_admin_session';

// Obter chave secreta do environment
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET não está definida nas variáveis de ambiente');
}

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Dados armazenados na sessão JWT
 */
export type SessionData = {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
  expires: string;
};

/**
 * Cria e assina um token JWT
 * @param payload - Dados da sessão
 * @returns Token JWT assinado
 */
export async function signToken(payload: SessionData): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7 days from now')
    .sign(key);
}

/**
 * Verifica e decodifica um token JWT
 * Compatible com Edge Runtime (sem consulta ao banco)
 * @param token - Token JWT a ser verificado
 * @returns Dados da sessão ou null se inválido
 */
export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (error) {
    console.error('Erro ao verificar token JWT:', error);
    return null;
  }
}

/**
 * Cria uma nova sessão e salva o JWT em cookie
 * @param userId - ID do usuário
 * @param userEmail - Email do usuário (opcional)
 * @param userName - Nome do usuário (opcional)
 */
export async function createSession(
  userId: string,
  userEmail?: string,
  userName?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session: SessionData = {
    user: {
      id: userId,
      email: userEmail,
      name: userName,
    },
    expires: expiresAt.toISOString(),
  };

  const token = await signToken(session);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Obtém a sessão atual do cookie (server-side)
 * @returns Dados da sessão ou null se não autenticado
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await verifyToken(token);

  if (!session) {
    return null;
  }

  // Verificar se a sessão não expirou
  if (new Date(session.expires) < new Date()) {
    return null;
  }

  return session;
}

/**
 * Invalida a sessão atual removendo o cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Renova a sessão existente, estendendo a expiração
 * Útil para manter usuários logados em requisições frequentes
 */
export async function renewSession(): Promise<void> {
  const session = await getSession();

  if (!session) {
    return;
  }

  // Criar nova sessão com mesmos dados mas nova expiração
  await createSession(
    session.user.id,
    session.user.email,
    session.user.name
  );
}
