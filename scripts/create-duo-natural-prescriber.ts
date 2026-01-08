/**
 * Script para criar prescritor padrão "Duo Natural"
 * 
 * Este prescritor é usado para cupons da própria empresa
 * que não estão vinculados a nenhum influencer/prescritor externo.
 * 
 * Exemplos: WHATSAPP05, BLACK10, NATAL15, etc.
 * 
 * Executar com: npx tsx scripts/create-duo-natural-prescriber.ts
 */

import { db } from '../lib/db';
import { prescribers } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const DUO_NATURAL_PHONE = '+5511999999999'; // Telefone genérico da empresa

async function createDuoNaturalPrescriber() {
  console.log('====== CRIANDO PRESCRITOR PADRÃO "DUO NATURAL" ======\n');

  try {
    // Verifica se já existe
    const existing = await db
      .select()
      .from(prescribers)
      .where(eq(prescribers.phone, DUO_NATURAL_PHONE));

    if (existing.length > 0) {
      console.log('✅ Prescritor "Duo Natural" já existe:');
      console.log(`   ID: ${existing[0].id}`);
      console.log(`   Nome: ${existing[0].name}`);
      console.log(`   Telefone: ${existing[0].phone}`);
      console.log('\n⚠️  Nenhuma alteração necessária.');
      return existing[0].id;
    }

    // Cria prescritor padrão
    const [newPrescriber] = await db
      .insert(prescribers)
      .values({
        name: 'Duo Natural',
        phone: DUO_NATURAL_PHONE,
        countryCode: '+55',
        email: 'contato@duonatural.com.br',
        cpfCnpj: null,
        representativeId: null, // Sem representante
        defaultCommission: 0, // Empresa não paga comissão a si mesma
        isActive: true,
        notes: 'Prescritor padrão da empresa para cupons internos (promoções, campanhas, etc)',
      })
      .returning();

    console.log('✅ Prescritor "Duo Natural" criado com sucesso!');
    console.log(`   ID: ${newPrescriber.id}`);
    console.log(`   Nome: ${newPrescriber.name}`);
    console.log(`   Comissão Padrão: 0%`);
    console.log('\n📋 Use este prescritor para:');
    console.log('   - Cupons de promoção da empresa');
    console.log('   - Cupons de campanhas de marketing');
    console.log('   - Qualquer cupom sem prescritor/influencer externo');

    return newPrescriber.id;

  } catch (error) {
    console.error('\n❌ Erro ao criar prescritor:', error);
    throw error;
  }
}

// Executa o script
createDuoNaturalPrescriber()
  .then((id) => {
    console.log('\n✅ Script finalizado!');
    console.log(`\n💡 Dica: Salve este ID para usar como padrão: ${id}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
