import { db } from '@/lib/db';
import { 
  commissionRecords, 
  coupons, 
  prescribers, 
  representatives,
  orders 
} from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Serviço de Cálculo e Gestão de Comissões
 * Gerencia comissões em cascata para prescritores e representantes
 */

/**
 * Interface para configuração de comissão de uma entidade
 */
interface EntityCommissionConfig {
  id: string;
  name: string;
  phone: string;
  rate: number;
  isOverride: boolean;
}

/**
 * Interface para retorno da configuração de comissões de um cupom
 */
interface CouponCommissionConfig {
  prescriber: EntityCommissionConfig | null;
  representative: EntityCommissionConfig | null;
}

/**
 * Obtém configurações de comissão de um cupom
 * Aplica lógica de precedência: override no cupom > comissão padrão da entidade
 * 
 * @param couponId - UUID do cupom
 * @returns Configuração de comissões do prescritor e representante (se houver)
 */
export async function getCommissionConfig(
  couponId: string
): Promise<CouponCommissionConfig> {
  // Busca cupom com joins para prescritor e representante
  const result = await db
    .select({
      coupon: coupons,
      prescriber: prescribers,
      representative: representatives
    })
    .from(coupons)
    .leftJoin(prescribers, eq(coupons.prescriberId, prescribers.id))
    .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
    .where(eq(coupons.id, couponId))
    .limit(1);

  if (!result[0]) {
    return { prescriber: null, representative: null };
  }

  const { coupon, prescriber, representative } = result[0];

  // Configurar comissão do prescritor
  let prescriberConfig: EntityCommissionConfig | null = null;
  if (prescriber) {
    // Aplica lógica de precedência: override > padrão
    const rate = coupon.prescriberCommissionOverride 
      ? Number(coupon.prescriberCommissionOverride)
      : Number(prescriber.defaultCommission || 0);
    
    prescriberConfig = {
      id: prescriber.id,
      name: prescriber.name,
      phone: prescriber.phone,
      rate,
      isOverride: coupon.prescriberCommissionOverride !== null
    };
  }

  // Configurar comissão do representante
  let representativeConfig: EntityCommissionConfig | null = null;
  if (representative) {
    // Aplica lógica de precedência: override > padrão
    const rate = coupon.representativeCommissionOverride
      ? Number(coupon.representativeCommissionOverride)
      : Number(representative.defaultCommission || 0);
    
    representativeConfig = {
      id: representative.id,
      name: representative.name,
      phone: representative.phone,
      rate,
      isOverride: coupon.representativeCommissionOverride !== null
    };
  }

  return {
    prescriber: prescriberConfig,
    representative: representativeConfig
  };
}

/**
 * Calcula e registra comissões ao finalizar um pedido
 * Ambas as comissões incidem sobre o valor total da venda
 * 
 * @param orderId - UUID do pedido
 * @param couponId - UUID do cupom utilizado
 * @param saleAmount - Valor total da venda
 * @returns Registro de comissão criado ou null se não houver comissões
 */
export async function calculateAndRecordCommissions(
  orderId: string,
  couponId: string,
  saleAmount: number
): Promise<any> {
  try {
    // Obtém configuração de comissões do cupom
    const config = await getCommissionConfig(couponId);

    // Se não há prescritor nem representante, não registra comissão
    if (!config.prescriber && !config.representative) {
      return null;
    }

    // Calcula valores de comissão
    const prescriberCommissionAmount = config.prescriber
      ? (saleAmount * config.prescriber.rate) / 100
      : null;

    const representativeCommissionAmount = config.representative
      ? (saleAmount * config.representative.rate) / 100
      : null;

    // Cria registro de comissão
    const [commissionRecord] = await db
      .insert(commissionRecords)
      .values({
        orderId,
        couponId,
        prescriberId: config.prescriber?.id || null,
        prescriberCommissionRate: config.prescriber?.rate ? String(config.prescriber.rate) : null,
        prescriberCommissionAmount: prescriberCommissionAmount ? String(prescriberCommissionAmount) : null,
        representativeId: config.representative?.id || null,
        representativeCommissionRate: config.representative?.rate ? String(config.representative.rate) : null,
        representativeCommissionAmount: representativeCommissionAmount ? String(representativeCommissionAmount) : null,
        saleAmount: String(saleAmount)
      })
      .returning();

    console.log('✅ Comissões registradas:', {
      orderId,
      prescritorComissao: prescriberCommissionAmount ? `R$ ${prescriberCommissionAmount.toFixed(2)}` : 'N/A',
      representanteComissao: representativeCommissionAmount ? `R$ ${representativeCommissionAmount.toFixed(2)}` : 'N/A'
    });

    return commissionRecord;
  } catch (error) {
    console.error('❌ Erro ao calcular/registrar comissões:', error);
    throw error;
  }
}

/**
 * Gera relatório de comissões com filtros
 * 
 * @param filters - Filtros para o relatório
 * @returns Dados agregados de comissões
 */
export async function generateCommissionReport(filters: {
  startDate?: Date;
  endDate?: Date;
  prescriberId?: string;
  representativeId?: string;
  groupBy?: 'prescriber' | 'representative' | 'month';
}) {
  try {
    const conditions = [];

    // Filtros de data
    if (filters.startDate) {
      conditions.push(gte(commissionRecords.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(commissionRecords.createdAt, filters.endDate));
    }

    // Filtros de entidade
    if (filters.prescriberId) {
      conditions.push(eq(commissionRecords.prescriberId, filters.prescriberId));
    }
    if (filters.representativeId) {
      conditions.push(eq(commissionRecords.representativeId, filters.representativeId));
    }

    // Query base com joins
    let query = db
      .select({
        commissionRecord: commissionRecords,
        order: orders,
        prescriber: prescribers,
        representative: representatives
      })
      .from(commissionRecords)
      .leftJoin(orders, eq(commissionRecords.orderId, orders.id))
      .leftJoin(prescribers, eq(commissionRecords.prescriberId, prescribers.id))
      .leftJoin(representatives, eq(commissionRecords.representativeId, representatives.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;

    // Se agrupamento por prescritor
    if (filters.groupBy === 'prescriber') {
      const grouped = results.reduce((acc: any, row) => {
        if (!row.prescriber) return acc;
        
        const key = row.prescriber.id;
        if (!acc[key]) {
          acc[key] = {
            prescriber: row.prescriber,
            salesCount: 0,
            totalSales: 0,
            totalCommissions: 0,
            orders: []
          };
        }
        
        acc[key].salesCount++;
        acc[key].totalSales += Number(row.commissionRecord.saleAmount || 0);
        acc[key].totalCommissions += Number(row.commissionRecord.prescriberCommissionAmount || 0);
        acc[key].orders.push(row.order);
        
        return acc;
      }, {});

      return Object.values(grouped);
    }

    // Se agrupamento por representante
    if (filters.groupBy === 'representative') {
      const grouped = results.reduce((acc: any, row) => {
        if (!row.representative) return acc;
        
        const key = row.representative.id;
        if (!acc[key]) {
          acc[key] = {
            representative: row.representative,
            salesCount: 0,
            totalSales: 0,
            totalCommissions: 0,
            orders: []
          };
        }
        
        acc[key].salesCount++;
        acc[key].totalSales += Number(row.commissionRecord.saleAmount || 0);
        acc[key].totalCommissions += Number(row.commissionRecord.representativeCommissionAmount || 0);
        acc[key].orders.push(row.order);
        
        return acc;
      }, {});

      return Object.values(grouped);
    }

    // Sem agrupamento - retorna todos os registros
    return results;
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error);
    throw error;
  }
}
