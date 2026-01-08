import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Configurar WebSocket para desenvolvimento local
if (process.env.NODE_ENV === 'development') {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
}

// Criar pool de conexões
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Criar instância do Drizzle ORM
export const db = drizzle(pool, { schema });

// Exportar schema para uso em queries
export { schema };
