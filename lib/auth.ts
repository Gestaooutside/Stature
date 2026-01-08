import * as bcrypt from 'bcrypt';
import { db } from './db';
import { users, sessions, type User } from './db/schema';
import { eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// Constantes de configuração
const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = 'duo_admin_session';
const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '604800000'); // 7 dias em ms

/**
 * Gera hash bcrypt de uma senha
 * @param password - Senha em texto plano
 * @returns Hash bcrypt da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica se uma senha corresponde ao hash
 * @param password - Senha em texto plano
 * @param hash - Hash bcrypt armazenado
 * @returns true se a senha corresponde, false caso contrário
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Cria uma nova sessão para um usuário
 * @param userId - ID do usuário
 * @returns Token da sessão criada
 */
export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  // Criar sessão no banco de dados
  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  // Definir cookie httpOnly com o token
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Verifica e valida um token de sessão
 * @param token - Token da sessão
 * @returns Usuário associado à sessão ou null se inválida
 */
export async function verifySession(token: string): Promise<User | null> {
  try {
    // Buscar sessão no banco de dados
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .innerJoin(users, eq(sessions.userId, users.id));

    if (!session) {
      return null;
    }

    // Verificar se a sessão não expirou
    if (new Date(session.sessions.expiresAt) < new Date()) {
      // Sessão expirada - remover do banco
      await db.delete(sessions).where(eq(sessions.token, token));
      return null;
    }

    return session.users;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

/**
 * Obtém a sessão do usuário atual (server-side)
 * @returns Usuário atual ou null se não autenticado
 */
export async function getServerSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Invalida a sessão atual (logout)
 */
export async function invalidateSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // Remover sessão do banco de dados
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Remover cookie
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Limpa sessões expiradas do banco de dados
 * Deve ser executado periodicamente (cron job)
 */
export async function cleanExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(gt(sessions.expiresAt, new Date()));
}

/**
 * Autentica um usuário com email e senha
 * @param email - Email do usuário
 * @param password - Senha em texto plano
 * @returns Usuário autenticado ou null se credenciais inválidas
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    // Buscar usuário por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    return null;
  }
}
