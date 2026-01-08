import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { knowledgeChunks } from '@/lib/db/schema';
import { encoding_for_model } from 'tiktoken';

// Configuração do embedding
// Usa text-embedding-3-small (1536 dimensões) por limitação do HNSW (max 2000 dims)
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const KNOWLEDGE_DIR = join(process.cwd(), 'llm');
const MAX_TOKENS_PER_CHUNK = 800;

// Cliente OpenRouter configurado
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Contador de tokens usando tiktoken
function countTokens(text: string): number {
  const encoding = encoding_for_model('text-embedding-3-small' as any);
  const tokens = encoding.encode(text);
  encoding.free();
  return tokens.length;
}

// Chunking semântico por seções markdown (## e ###)
function chunkMarkdownBySection(content: string, sourceFile: string) {
  const chunks: Array<{
    content: string;
    metadata: {
      section?: string;
      subsection?: string;
      tokens: number;
      chunkIndex: number;
    };
    sourceFile: string;
  }> = [];

  // Split por seções de nível 2 (##)
  const sections = content.split(/^##\s+/m).filter(s => s.trim());

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();
    const sectionBody = lines.slice(1).join('\n');
    const fullContent = `## ${sectionTitle}\n${sectionBody}`;

    // Se seção muito grande, subdivide por subsections (###)
    if (countTokens(fullContent) > MAX_TOKENS_PER_CHUNK) {
      const subsections = fullContent.split(/^###\s+/m).filter(s => s.trim());

      for (let j = 0; j < subsections.length; j++) {
        const subsection = subsections[j].trim();
        if (!subsection) continue;

        const subLines = subsection.split('\n');
        const subTitle = subLines[0].trim();
        const subBody = subLines.slice(1).join('\n');
        const subContent = j === 0 
          ? `## ${sectionTitle}\n${subBody}` 
          : `## ${sectionTitle}\n### ${subTitle}\n${subBody}`;

        chunks.push({
          content: subContent,
          metadata: {
            section: sectionTitle,
            subsection: j === 0 ? undefined : subTitle,
            tokens: countTokens(subContent),
            chunkIndex: chunks.length,
          },
          sourceFile,
        });
      }
    } else {
      // Seção cabe em um chunk
      chunks.push({
        content: fullContent,
        metadata: {
          section: sectionTitle,
          tokens: countTokens(fullContent),
          chunkIndex: chunks.length,
        },
        sourceFile,
      });
    }
  }

  return chunks;
}

// Gera embedding usando OpenRouter
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

// Processa um arquivo markdown
async function ingestFile(filePath: string) {
  console.log(`\n📄 Processando: ${filePath}`);

  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop()!;
  const chunks = chunkMarkdownBySection(content, fileName);

  console.log(`  → ${chunks.length} chunks gerados`);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);

    await db.insert(knowledgeChunks).values({
      sourceFile: chunk.sourceFile,
      content: chunk.content,
      embedding: embedding, // Passa array direto, não como string
      metadata: chunk.metadata,
    });

    const sectionInfo = chunk.metadata.subsection
      ? `${chunk.metadata.section} > ${chunk.metadata.subsection}`
      : chunk.metadata.section;
    console.log(`  ✓ Chunk ${chunk.metadata.chunkIndex + 1}: ${sectionInfo} (${chunk.metadata.tokens} tokens)`);
  }
}

// Script principal
async function main() {
  console.log('🚀 Iniciando ingestão de documentação de vendas...\n');
  console.log(`📊 Modelo de embedding: ${EMBEDDING_MODEL}`);
  console.log(`🎯 Dimensões: 1536`);
  console.log(`📏 Max tokens por chunk: ${MAX_TOKENS_PER_CHUNK}\n`);

  // Limpa tabela existente
  await db.delete(knowledgeChunks);
  console.log('🗑️  Tabela knowledge_chunks limpa\n');

  // Processa todos arquivos MD relevantes
  const files = [
    join(KNOWLEDGE_DIR, 'knowledge', 'knowledge-sales.md'),
    join(KNOWLEDGE_DIR, 'knowledge', 'knowledge-ultimate-sales-guide.md'),
    join(KNOWLEDGE_DIR, 'prompts', 'system-prompt-sales.md'),
  ];

  let totalChunks = 0;
  for (const file of files) {
    await ingestFile(file);
    const result = await db.select().from(knowledgeChunks);
    totalChunks = result.length;
  }

  console.log(`\n✅ Ingestão concluída!`);
  console.log(`📦 Total de chunks armazenados: ${totalChunks}`);
  console.log(`💾 Banco: Neon PostgreSQL com pgvector`);
  console.log(`🔍 Índice: HNSW (cosine distance)\n`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro durante ingestão:', error);
  process.exit(1);
});
