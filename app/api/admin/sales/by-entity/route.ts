import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { commissionRecords, prescribers, representatives, orders } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * API para relatório de vendas por entidade
 * GET /api/admin/sales/by-entity
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const entityType = searchParams.get('entityType') as 'prescriber' | 'representative' | null;

    const filters = [];
    if (startDate) {
      filters.push(gte(commissionRecords.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.push(lte(commissionRecords.createdAt, end));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Buscar vendas por prescritores
    const prescriberSales = (!entityType || entityType === 'prescriber')
      ? await db
          .select({
            entityId: commissionRecords.prescriberId,
            entityName: prescribers.name,
            entityType: sql<string>`'prescriber'`,
            totalSales: sql<number>`COALESCE(SUM(CAST(${commissionRecords.saleAmount} AS NUMERIC)), 0)`,
            totalOrders: sql<number>`COUNT(DISTINCT ${commissionRecords.orderId})`,
            totalCommissions: sql<number>`COALESCE(SUM(CAST(${commissionRecords.prescriberCommissionAmount} AS NUMERIC)), 0)`,
            lastSaleDate: sql<string>`MAX(${commissionRecords.createdAt})`
          })
          .from(commissionRecords)
          .innerJoin(prescribers, eq(commissionRecords.prescriberId, prescribers.id))
          .where(
            whereClause
              ? and(whereClause, sql`${commissionRecords.prescriberId} IS NOT NULL`)
              : sql`${commissionRecords.prescriberId} IS NOT NULL`
          )
          .groupBy(commissionRecords.prescriberId, prescribers.name)
      : [];

    // Buscar vendas por representantes
    const representativeSales = (!entityType || entityType === 'representative')
      ? await db
          .select({
            entityId: commissionRecords.representativeId,
            entityName: representatives.name,
            entityType: sql<string>`'representative'`,
            totalSales: sql<number>`COALESCE(SUM(CAST(${commissionRecords.saleAmount} AS NUMERIC)), 0)`,
            totalOrders: sql<number>`COUNT(DISTINCT ${commissionRecords.orderId})`,
            totalCommissions: sql<number>`COALESCE(SUM(CAST(${commissionRecords.representativeCommissionAmount} AS NUMERIC)), 0)`,
            lastSaleDate: sql<string>`MAX(${commissionRecords.createdAt})`
          })
          .from(commissionRecords)
          .innerJoin(representatives, eq(commissionRecords.representativeId, representatives.id))
          .where(
            whereClause
              ? and(whereClause, sql`${commissionRecords.representativeId} IS NOT NULL`)
              : sql`${commissionRecords.representativeId} IS NOT NULL`
          )
          .groupBy(commissionRecords.representativeId, representatives.name)
      : [];

    // Combinar e calcular ticket médio
    const allSales = [...prescriberSales, ...representativeSales].map(sale => ({
      entityId: sale.entityId!,
      entityName: sale.entityName,
      entityType: sale.entityType as 'prescriber' | 'representative',
      totalSales: Number(sale.totalSales),
      totalOrders: Number(sale.totalOrders),
      totalCommissions: Number(sale.totalCommissions),
      averageOrderValue: Number(sale.totalOrders) > 0 ? Number(sale.totalSales) / Number(sale.totalOrders) : 0,
      lastSaleDate: sale.lastSaleDate
    }));

    return NextResponse.json({ sales: allSales }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
