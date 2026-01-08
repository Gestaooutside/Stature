/**
 * Script para padronizar nomes de prescritores em Title Case
 * 
 * Converte todos os nomes existentes para o formato adequado:
 * - "MARIA SILVA" → "Maria Silva"
 * - "joão santos" → "João Santos"
 * - "Ana PAULA" → "Ana Paula"
 * 
 * Executar com: npx tsx scripts/normalize-prescriber-names.ts
 */

import { db } from '../lib/db';
import { prescribers, representatives } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Converte string para Title Case
 * Exceções: de, da, do, dos, das, e, ou
 */
function toTitleCase(str: string): string {
  const exceptions = ['de', 'da', 'do', 'dos', 'das', 'e', 'ou'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Primeira palavra sempre maiúscula
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Exceções mantêm minúscula
      if (exceptions.includes(word)) {
        return word;
      }
      
      // Demais palavras em Title Case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .trim();
}

async function normalizePrescribers() {
  console.log('====== NORMALIZANDO NOMES DE PRESCRITORES ======\n');

  try {
    // Busca todos os prescritores
    const allPrescribers = await db.select().from(prescribers);

    console.log(`Encontrados ${allPrescribers.length} prescritores\n`);

    let updated = 0;
    let unchanged = 0;

    for (const prescriber of allPrescribers) {
      const normalizedName = toTitleCase(prescriber.name);

      if (normalizedName !== prescriber.name) {
        console.log(`📝 Atualizando:`);
        console.log(`   De: "${prescriber.name}"`);
        console.log(`   Para: "${normalizedName}"`);

        await db
          .update(prescribers)
          .set({ 
            name: normalizedName,
            updatedAt: new Date()
          })
          .where(eq(prescribers.id, prescriber.id));

        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('\n====== RESUMO PRESCRITORES ======');
    console.log(`✅ Atualizados: ${updated}`);
    console.log(`⏭️  Sem mudança: ${unchanged}`);
    console.log(`📊 Total: ${allPrescribers.length}`);

  } catch (error) {
    console.error('\n❌ Erro ao normalizar prescritores:', error);
    throw error;
  }
}

async function normalizeRepresentatives() {
  console.log('\n\n====== NORMALIZANDO NOMES DE REPRESENTANTES ======\n');

  try {
    // Busca todos os representantes
    const allRepresentatives = await db.select().from(representatives);

    console.log(`Encontrados ${allRepresentatives.length} representantes\n`);

    let updated = 0;
    let unchanged = 0;

    for (const rep of allRepresentatives) {
      const normalizedName = toTitleCase(rep.name);

      if (normalizedName !== rep.name) {
        console.log(`📝 Atualizando:`);
        console.log(`   De: "${rep.name}"`);
        console.log(`   Para: "${normalizedName}"`);

        await db
          .update(representatives)
          .set({ 
            name: normalizedName,
            updatedAt: new Date()
          })
          .where(eq(representatives.id, rep.id));

        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('\n====== RESUMO REPRESENTANTES ======');
    console.log(`✅ Atualizados: ${updated}`);
    console.log(`⏭️  Sem mudança: ${unchanged}`);
    console.log(`📊 Total: ${allRepresentatives.length}`);

  } catch (error) {
    console.error('\n❌ Erro ao normalizar representantes:', error);
    throw error;
  }
}

// Executa o script
async function main() {
  await normalizePrescribers();
  await normalizeRepresentatives();
}

main()
  .then(() => {
    console.log('\n\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
