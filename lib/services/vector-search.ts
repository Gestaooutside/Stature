import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente primeiro
dotenv.config({ path: '.env.local' });

// Configurar WebSocket para desenvolvimento local
if (process.env.NODE_ENV === 'development') {
  neonConfig.webSocketConstructor = ws;
}

// Pool direto do PostgreSQL para queries vetoriais
// NOTA: Drizzle ORM tem problemas de performance com vetores de 1536 dimensões.
// Tentativas com cosineDistance() resultaram em queries SQL malformadas e timeouts.
// A solução com Pool nativo + prepared statements é instantânea (45-264ms).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Cliente OpenRouter para embeddings
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  timeout: 30000, // 30 segundos de timeout
  maxRetries: 2,
});

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

// Log de inicialização
if (!process.env.OPENROUTER_API_KEY) {
  console.error('[vector-search] ⚠️  OPENROUTER_API_KEY não configurada!');
} else {
  console.log('[vector-search] ✓ Cliente OpenRouter inicializado');
}

/**
 * Busca chunks similares semanticamente usando cosine distance
 * @param query - Pergunta ou texto do usuário
 * @param limit - Número de chunks a retornar (padrão: 7)
 * @returns Array de chunks ordenados por similaridade
 */
export async function searchSimilarChunks(query: string, limit = 7) {
  console.log(`[vector-search] Iniciando busca para: "${query.substring(0, 50)}..."`);
  
  try {
    // 1. Gera embedding da query do usuário
    console.log(`[vector-search] Gerando embedding via OpenRouter (${EMBEDDING_MODEL})...`);
    const startEmbed = Date.now();
    
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;
    
    console.log(`[vector-search] Embedding gerado em ${Date.now() - startEmbed}ms (${queryEmbedding.length} dimensões)`);

    // 2. Busca por similaridade usando operador <=> (cosine distance)
    // Usa Pool PostgreSQL direto com prepared statements para melhor performance
    console.log(`[vector-search] Executando query no banco (limit: ${limit})...`);
    const startQuery = Date.now();
    
    // Formata embedding como array PostgreSQL: [0.1,0.2,0.3,...]
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    const queryText = `
      SELECT 
        id,
        content,
        source_file as "sourceFile",
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM knowledge_chunks
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;
    
    const result = await pool.query(queryText, [embeddingStr, limit]);

    console.log(`[vector-search] Query concluída em ${Date.now() - startQuery}ms (${result.rows.length} resultados)`);
    
    return result.rows;
  } catch (error) {
    console.error('[vector-search] ❌ Erro na busca:', error);
    throw error;
  }
}

/**
 * Formata chunks recuperados para injeção no system prompt
 * @param chunks - Array de chunks do RAG
 * @returns String formatada para contexto do LLM
 */
export function formatContextForPrompt(
  chunks: Array<{
    content: string;
    sourceFile: string;
    metadata: any;
    similarity: number;
  }>
): string {
  if (!chunks.length) return '';

  const formattedChunks = chunks
    .map((chunk, i) => {
      const similarityPercent = (chunk.similarity * 100).toFixed(1);
      const section = chunk.metadata?.section || 'N/A';
      
      return `### [${i + 1}] ${section} (${similarityPercent}% relevante)
**Fonte:** ${chunk.sourceFile}

${chunk.content}

---`;
    })
    .join('\n');

  return `
## CONTEXTO DINÂMICO RECUPERADO (RAG)

Os trechos abaixo foram selecionados automaticamente da base de conhecimento como os mais relevantes para responder à consulta do cliente. Use essas informações para enriquecer sua resposta com precisão, mas mantenha naturalidade — não cite explicitamente "de acordo com o contexto" ou "segundo a documentação".

${formattedChunks}
`;
}
