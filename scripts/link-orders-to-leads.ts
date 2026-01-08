/**
 * Script para vincular pedidos existentes aos leads correspondentes
 * 
 * Este script:
 * 1. Busca todos os pedidos que não têm leadId
 * 2. Para cada pedido, extrai dados do cliente do metadata (customerSnapshot)
 * 3. Tenta encontrar lead correspondente por email ou CPF
 * 4. Vincula pedido ao lead encontrado
 * 
 * Executar com: npx tsx scripts/link-orders-to-leads.ts
 */

import { db } from '../lib/db';
import { orders, leads } from '../lib/db/schema';
import { eq, isNull, or, and, sql } from 'drizzle-orm';

interface CustomerSnapshot {
  name?: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  whatsapp?: string;
}

interface OrderMetadata {
  customerSnapshot?: CustomerSnapshot;
  couponCode?: string;
}

async function linkOrdersToLeads() {
  console.log('====== VINCULANDO PEDIDOS A LEADS ======\n');

  // 1. Busca pedidos sem leadId
  const ordersWithoutLead = await db
    .select({
      id: orders.id,
      metadata: orders.metadata,
      createdAt: orders.createdAt,
      status: orders.status,
    })
    .from(orders)
    .where(isNull(orders.leadId));

  console.log(`Encontrados ${ordersWithoutLead.length} pedidos sem leadId\n`);

  if (ordersWithoutLead.length === 0) {
    console.log('✅ Todos os pedidos já estão vinculados a leads!');
    return;
  }

  let linked = 0;
  let notFound = 0;
  let noData = 0;

  for (const order of ordersWithoutLead) {
    const metadata = order.metadata as OrderMetadata | null;
    const customer = metadata?.customerSnapshot;

    if (!customer) {
      console.log(`⚠️  Pedido ${order.id.slice(0, 8)}... - Sem customerSnapshot`);
      noData++;
      continue;
    }

    // Limpa dados para comparação
    const email = customer.email?.toLowerCase().trim();
    const cpfCnpj = customer.cpfCnpj?.replace(/\D/g, '');
    const whatsapp = customer.whatsapp?.replace(/\D/g, '') || customer.phone?.replace(/\D/g, '');

    // Tenta encontrar lead por email OU cpfCnpj OU whatsapp
    let leadFound = null;

    // Busca por email (mais preciso)
    if (email) {
      const [lead] = await db
        .select({ id: leads.id, name: leads.name })
        .from(leads)
        .where(sql`LOWER(${leads.email}) = ${email}`)
        .limit(1);
      
      if (lead) leadFound = lead;
    }

    // Se não encontrou por email, busca por CPF
    if (!leadFound && cpfCnpj && cpfCnpj.length >= 11) {
      const [lead] = await db
        .select({ id: leads.id, name: leads.name })
        .from(leads)
        .where(sql`REPLACE(REPLACE(REPLACE(${leads.cpfCnpj}, '.', ''), '-', ''), '/', '') = ${cpfCnpj}`)
        .limit(1);
      
      if (lead) leadFound = lead;
    }

    // Se não encontrou por CPF, busca por WhatsApp
    if (!leadFound && whatsapp && whatsapp.length >= 10) {
      const [lead] = await db
        .select({ id: leads.id, name: leads.name })
        .from(leads)
        .where(sql`REPLACE(REPLACE(REPLACE(REPLACE(${leads.whatsapp}, '(', ''), ')', ''), '-', ''), ' ', '') = ${whatsapp}`)
        .limit(1);
      
      if (lead) leadFound = lead;
    }

    if (leadFound) {
      // Vincula pedido ao lead
      await db
        .update(orders)
        .set({ 
          leadId: leadFound.id,
          updatedAt: new Date()
        })
        .where(eq(orders.id, order.id));

      console.log(`✅ Pedido ${order.id.slice(0, 8)}... → Lead ${leadFound.id.slice(0, 8)}... (${leadFound.name})`);
      linked++;

      // Se o pedido está pago, marca lead como convertido
      if (['PAID', 'CONFIRMED'].includes(order.status)) {
        await db
          .update(leads)
          .set({
            convertedToSale: true,
            conversionDate: order.createdAt,
            updatedAt: new Date()
          })
          .where(eq(leads.id, leadFound.id));
        
        console.log(`   ↳ Lead marcado como convertido (pedido ${order.status})`);
      }
    } else {
      console.log(`❌ Pedido ${order.id.slice(0, 8)}... - Lead não encontrado (${email || cpfCnpj || 'sem dados'})`);
      notFound++;
    }
  }

  console.log('\n====== RESUMO ======');
  console.log(`Total de pedidos processados: ${ordersWithoutLead.length}`);
  console.log(`✅ Vinculados com sucesso: ${linked}`);
  console.log(`❌ Lead não encontrado: ${notFound}`);
  console.log(`⚠️  Sem dados do cliente: ${noData}`);
}

// Executa o script
linkOrdersToLeads()
  .then(() => {
    console.log('\n✅ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro ao executar script:', error);
    process.exit(1);
  });
