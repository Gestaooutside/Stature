import { searchSimilarChunks, formatContextForPrompt } from '@/lib/services/vector-search';

// Queries de teste representativas de perguntas reais de clientes
const TEST_QUERIES = [
  "Quanto custa o Kit DUO completo?",
  "Como funciona a garantia de devolução?",
  "O DUO causa dependência química?",
  "Quais são os ingredientes do DUO NOITE?",
  "Quanto tempo demora para ver resultados?",
  "Posso tomar junto com remédios tarja preta?",
  "Por que o Kit Completo é melhor que comprar separado?",
  "Como faço para superar a objeção de preço?",
];

async function testVectorSearch() {
  console.log('🧪 Testando Sistema de Busca Vetorial RAG\n');
  console.log('=' .repeat(80));
  console.log('\n');

  for (const query of TEST_QUERIES) {
    console.log(`\n🔍 Query: "${query}"\n`);

    const results = await searchSimilarChunks(query, 3);

    if (results.length === 0) {
      console.log('⚠️  Nenhum resultado encontrado\n');
      continue;
    }

    results.forEach((result, i) => {
      const similarityPercent = (result.similarity * 100).toFixed(1);
      const section = result.metadata?.section || 'N/A';
      const subsection = result.metadata?.subsection || '';
      const tokens = result.metadata?.tokens || 0;

      console.log(`${i + 1}. [${similarityPercent}% similar] ${result.sourceFile}`);
      console.log(`   📍 Seção: ${section}`);
      if (subsection) console.log(`   📍 Subseção: ${subsection}`);
      console.log(`   📊 Tokens: ${tokens}`);
      console.log(`   📝 Preview: ${result.content.substring(0, 120).replace(/\n/g, ' ')}...`);
      console.log('');
    });

    console.log('-'.repeat(80));
  }

  console.log('\n\n✅ Teste concluído!\n');
  
  // Exemplo de formatação para prompt
  console.log('📋 EXEMPLO DE CONTEXTO FORMATADO PARA PROMPT:\n');
  const sampleResults = await searchSimilarChunks("Quanto custa o Kit DUO?", 2);
  const formatted = formatContextForPrompt(sampleResults);
  console.log(formatted.substring(0, 800) + '\n...\n');
}

testVectorSearch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  });
