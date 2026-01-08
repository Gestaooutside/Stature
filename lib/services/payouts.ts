import { db } from '@/lib/db';
import { 
  payouts, 
  commissionRecords, 
  prescribers, 
  representatives 
} from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Serviço de Gestão de Repasses (Payouts)
 * Calcula saldo devedor, gerencia histórico e registra pagamentos
 */

/**
 * Interface para saldo de uma entidade
 */
interface EntityBalance {
  entityId: string;
  entityType: 'prescriber' | 'representative';
  entityName: string;
  totalCommissionsEarned: number; // Total de comissões geradas
  totalPaid: number; // Total já pago
  totalPending: number; // Total ainda pendente
  balance: number; // Saldo devedor (earned - paid)
}

/**
 * Calcula saldo devedor de uma entidade específica
 * 
 * @param entityType - Tipo da entidade ('prescriber' ou 'representative')
 * @param entityId - UUID da entidade
 * @param periodStart - Data inicial opcional
 * @param periodEnd - Data final opcional
 * @returns Objeto com informações de saldo
 */
export async function calculateEntityBalance(
  entityType: 'prescriber' | 'representative',
  entityId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<EntityBalance> {
  try {
    // Buscar nome da entidade
    let entityName = '';
    if (entityType === 'prescriber') {
      const [prescriber] = await db
        .select({ name: prescribers.name })
        .from(prescribers)
        .where(eq(prescribers.id, entityId))
        .limit(1);
      entityName = prescriber?.name || 'Desconhecido';
    } else {
      const [representative] = await db
        .select({ name: representatives.name })
        .from(representatives)
        .where(eq(representatives.id, entityId))
        .limit(1);
      entityName = representative?.name || 'Desconhecido';
    }

    // Calcular comissões geradas
    const commissionConditions = [
      entityType === 'prescriber'
        ? eq(commissionRecords.prescriberId, entityId)
        : eq(commissionRecords.representativeId, entityId)
    ];

    if (periodStart) {
      commissionConditions.push(gte(commissionRecords.createdAt, periodStart));
    }
    if (periodEnd) {
      commissionConditions.push(lte(commissionRecords.createdAt, periodEnd));
    }

    const commissionsResult = await db
      .select({
        total: entityType === 'prescriber'
          ? sql<number>`COALESCE(SUM(CAST(${commissionRecords.prescriberCommissionAmount} AS NUMERIC)), 0)`
          : sql<number>`COALESCE(SUM(CAST(${commissionRecords.representativeCommissionAmount} AS NUMERIC)), 0)`
      })
      .from(commissionRecords)
      .where(and(...commissionConditions));

    const totalCommissionsEarned = Number(commissionsResult[0]?.total || 0);

    // Calcular repasses já feitos
    const payoutConditions = [
      eq(payouts.entityType, entityType),
      eq(payouts.entityId, entityId)
    ];

    if (periodStart) {
      payoutConditions.push(gte(payouts.periodStart, periodStart));
    }
    if (periodEnd) {
      payoutConditions.push(lte(payouts.periodEnd, periodEnd));
    }

    // Total pago
    const paidResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${payouts.amount} AS NUMERIC)), 0)`
      })
      .from(payouts)
      .where(and(...payoutConditions, eq(payouts.status, 'paid')));

    const totalPaid = Number(paidResult[0]?.total || 0);

    // Total pendente
    const pendingResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${payouts.amount} AS NUMERIC)), 0)`
      })
      .from(payouts)
      .where(and(...payoutConditions, eq(payouts.status, 'pending')));

    const totalPending = Number(pendingResult[0]?.total || 0);

    // Saldo devedor = comissões geradas - (pago + pendente)
    const balance = totalCommissionsEarned - (totalPaid + totalPending);

    return {
      entityId,
      entityType,
      entityName,
      totalCommissionsEarned,
      totalPaid,
      totalPending,
      balance
    };
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
}

/**
 * Gera relatório consolidado de repasses
 * 
 * @param filters - Filtros opcionais
 * @returns Lista de saldos por entidade
 */
export async function generatePayoutReport(filters?: {
  entityType?: 'prescriber' | 'representative';
  periodStart?: Date;
  periodEnd?: Date;
}): Promise<EntityBalance[]> {
  try {
    // Buscar todas as entidades com comissões
    let entities: Array<{ id: string; type: 'prescriber' | 'representative' }> = [];

    if (!filters?.entityType || filters.entityType === 'prescriber') {
      const prescribersWithCommissions = await db
        .select({ id: commissionRecords.prescriberId })
        .from(commissionRecords)
        .where(sql`${commissionRecords.prescriberId} IS NOT NULL`)
        .groupBy(commissionRecords.prescriberId);

      entities.push(...prescribersWithCommissions.map(p => ({ 
        id: p.id!, 
        type: 'prescriber' as const 
      })));
    }

    if (!filters?.entityType || filters.entityType === 'representative') {
      const representativesWithCommissions = await db
        .select({ id: commissionRecords.representativeId })
        .from(commissionRecords)
        .where(sql`${commissionRecords.representativeId} IS NOT NULL`)
        .groupBy(commissionRecords.representativeId);

      entities.push(...representativesWithCommissions.map(r => ({ 
        id: r.id!, 
        type: 'representative' as const 
      })));
    }

    // Calcular saldo para cada entidade
    const balances = await Promise.all(
      entities.map(entity =>
        calculateEntityBalance(
          entity.type,
          entity.id,
          filters?.periodStart,
          filters?.periodEnd
        )
      )
    );

    // Ordenar por saldo devedor (maior primeiro)
    return balances.sort((a, b) => b.balance - a.balance);
  } catch (error) {
    console.error('Erro ao gerar relatório de repasses:', error);
    throw error;
  }
}

/**
 * Cria repasse automaticamente para uma entidade
 * Calcula saldo devedor e cria registro de repasse
 * 
 * @param entityType - Tipo da entidade
 * @param entityId - UUID da entidade
 * @param periodStart - Início do período
 * @param periodEnd - Fim do período
 * @param createdBy - Usuário que criou
 * @returns Repasse criado
 */
export async function createPayout(
  entityType: 'prescriber' | 'representative',
  entityId: string,
  periodStart: Date,
  periodEnd: Date,
  createdBy: string
) {
  try {
    // Calcula saldo do período
    const balance = await calculateEntityBalance(
      entityType,
      entityId,
      periodStart,
      periodEnd
    );

    // Só cria repasse se houver saldo a pagar
    if (balance.balance <= 0) {
      throw new Error('Não há saldo a pagar para este período');
    }

    // Cria registro de repasse
    const [payout] = await db
      .insert(payouts)
      .values({
        entityType,
        entityId,
        amount: String(balance.balance),
        periodStart,
        periodEnd,
        status: 'pending',
        createdBy,
        notes: `Repasse automático - Período: ${periodStart.toLocaleDateString()} a ${periodEnd.toLocaleDateString()}`
      })
      .returning();

    return payout;
  } catch (error) {
    console.error('Erro ao criar repasse:', error);
    throw error;
  }
}
