import { db } from '../lib/db';
import { commissionRecords, orders, prescribers, representatives, coupons } from '../lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

async function checkCommissions() {
  console.log('🔍 VERIFICANDO DADOS DE COMISSÕES NO BANCO...\n');

  try {
    // 1. Conta registros de comissão
    console.log('📊 REGISTROS DE COMISSÃO:');
    const allCommissions = await db.select().from(commissionRecords);
    console.log(`   Total de registros: ${allCommissions.length}`);
    
    if (allCommissions.length > 0) {
      console.log('\n   Amostra dos primeiros 3 registros:');
      allCommissions.slice(0, 3).forEach((comm, i) => {
        console.log(`   ${i + 1}. ID: ${comm.id.slice(0, 8)}...`);
        console.log(`      Pedido: ${comm.orderId.slice(0, 8)}...`);
        console.log(`      Valor Venda: R$ ${comm.saleAmount}`);
        console.log(`      Comissão Prescritor: R$ ${comm.prescriberCommissionAmount || 'N/A'}`);
        console.log(`      Comissão Representante: R$ ${comm.representativeCommissionAmount || 'N/A'}`);
        console.log(`      Data: ${comm.createdAt}`);
        console.log('');
      });
    }

    // 2. Conta pedidos pagos
    console.log('\n💰 PEDIDOS PAGOS:');
    const paidOrders = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ['PAID', 'CONFIRMED']));
    
    console.log(`   Total de pedidos pagos: ${paidOrders.length}`);

    // 3. Verifica quais pedidos têm cupom
    const ordersWithCoupon = paidOrders.filter(order => {
      const metadata = order.metadata as any;
      return metadata?.couponCode;
    });
    
    console.log(`   Pedidos com cupom: ${ordersWithCoupon.length}`);
    
    if (ordersWithCoupon.length > 0) {
      console.log('\n   Cupons usados:');
      const couponCodes = [...new Set(ordersWithCoupon.map(o => (o.metadata as any)?.couponCode))];
      couponCodes.forEach(code => console.log(`   - ${code}`));
    }

    // 4. Verifica cupons no banco
    console.log('\n🎫 CUPONS CADASTRADOS:');
    const allCoupons = await db.select().from(coupons);
    console.log(`   Total de cupons: ${allCoupons.length}`);
    console.log(`   Cupons com prescritor: ${allCoupons.filter(c => c.prescriberId).length}`);

    // 5. Verifica prescritores
    console.log('\n👨‍⚕️ PRESCRITORES:');
    const allPrescribers = await db.select().from(prescribers);
    console.log(`   Total de prescritores: ${allPrescribers.length}`);
    
    if (allPrescribers.length > 0) {
      console.log('\n   Lista de prescritores:');
      allPrescribers.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id.slice(0, 8)}...)`);
        console.log(`     Representante: ${p.representativeId ? p.representativeId.slice(0, 8) + '...' : 'Nenhum'}`);
        console.log(`     Comissão padrão: ${p.defaultCommission || 'Não definida'}%`);
      });
    }

    // 6. Verifica representantes
    console.log('\n👔 REPRESENTANTES:');
    const allRepresentatives = await db.select().from(representatives);
    console.log(`   Total de representantes: ${allRepresentatives.length}`);
    
    if (allRepresentatives.length > 0) {
      console.log('\n   Lista de representantes:');
      allRepresentatives.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r.id.slice(0, 8)}...)`);
        console.log(`     Comissão padrão: ${r.defaultCommission || 'Não definida'}%`);
      });
    }

    // 7. Análise de gap
    console.log('\n\n📈 ANÁLISE:');
    console.log(`   Pedidos pagos: ${paidOrders.length}`);
    console.log(`   Pedidos com cupom: ${ordersWithCoupon.length}`);
    console.log(`   Comissões registradas: ${allCommissions.length}`);
    console.log(`   GAP (pedidos sem comissão): ${ordersWithCoupon.length - allCommissions.length}`);

    // 8. Verifica pedidos específicos sem comissão
    if (ordersWithCoupon.length > allCommissions.length) {
      console.log('\n❌ PEDIDOS COM CUPOM SEM COMISSÃO:');
      const commissionOrderIds = allCommissions.map(c => c.orderId);
      const ordersWithoutCommission = ordersWithCoupon.filter(
        o => !commissionOrderIds.includes(o.id)
      );

      ordersWithoutCommission.slice(0, 5).forEach(order => {
        const metadata = order.metadata as any;
        console.log(`   - Pedido: ${order.id.slice(0, 8)}...`);
        console.log(`     Cupom: ${metadata?.couponCode}`);
        console.log(`     Valor: R$ ${order.total}`);
        console.log(`     Data: ${order.createdAt}`);
        console.log('');
      });
    }

    // 9. Recomendação
    console.log('\n💡 RECOMENDAÇÃO:');
    if (allCommissions.length === 0 && ordersWithCoupon.length > 0) {
      console.log('   ⚠️ HÁ PEDIDOS COM CUPOM MAS NENHUMA COMISSÃO FOI GERADA!');
      console.log('   Ação: Execute o endpoint /api/admin/commissions/process-existing');
    } else if (allCommissions.length < ordersWithCoupon.length) {
      console.log('   ⚠️ ALGUMAS COMISSÕES ESTÃO FALTANDO!');
      console.log(`   ${ordersWithCoupon.length - allCommissions.length} pedidos precisam ser processados`);
      console.log('   Ação: Execute o endpoint /api/admin/commissions/process-existing');
    } else if (allCommissions.length === ordersWithCoupon.length) {
      console.log('   ✅ TODAS AS COMISSÕES FORAM GERADAS CORRETAMENTE!');
    } else {
      console.log('   ℹ️ Não há pedidos com cupom para processar');
    }

    console.log('\n✅ Verificação concluída!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  }
}

checkCommissions();
