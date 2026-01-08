import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { generateCommissionReport } from '@/lib/services/commissions';

/**
 * API Route para relatórios de comissões (Admin)
 * GET /api/admin/commissions/report - Gera relatório de comissões
 *
 * Query params:
 * - startDate: Data início (ISO string)
 * - endDate: Data fim (ISO string)
 * - prescriberId: Filtrar por prescritor específico
 * - representativeId: Filtrar por representante específico
 * - groupBy: 'prescriber' | 'representative' | 'month'
 *
 * Protegido por autenticação JWT
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    
    const filters: any = {};

    // Filtros de data
    if (searchParams.get('startDate')) {
      const start = new Date(searchParams.get('startDate')!);
      start.setHours(0, 0, 0, 0); // Início do dia
      filters.startDate = start;
    }
    if (searchParams.get('endDate')) {
      const end = new Date(searchParams.get('endDate')!);
      end.setHours(23, 59, 59, 999); // Fim do dia
      filters.endDate = end;
    }

    // Filtros de entidade
    if (searchParams.get('prescriberId')) {
      filters.prescriberId = searchParams.get('prescriberId')!;
    }
    if (searchParams.get('representativeId')) {
      filters.representativeId = searchParams.get('representativeId')!;
    }

    // Tipo de agrupamento
    const groupBy = searchParams.get('groupBy');
    if (groupBy && ['prescriber', 'representative', 'month'].includes(groupBy)) {
      filters.groupBy = groupBy;
    }

    // Gera relatório
    const report = await generateCommissionReport(filters);

    console.log(`[Commissions Report] Filtros aplicados:`, filters);
    console.log(`[Commissions Report] Total de registros retornados:`, report?.length || 0);

    // Calcular totais gerais
    let totalSales = 0;
    let totalPrescriberCommissions = 0;
    let totalRepresentativeCommissions = 0;
    let recordCount = 0;

    if (Array.isArray(report)) {
      report.forEach((item: any) => {
        if (filters.groupBy === 'prescriber' || filters.groupBy === 'representative') {
          totalSales += item.totalSales || 0;
          totalPrescriberCommissions += item.totalCommissions || 0;
          recordCount += item.salesCount || 0;
        } else {
          totalSales += Number(item.commissionRecord?.saleAmount || 0);
          totalPrescriberCommissions += Number(item.commissionRecord?.prescriberCommissionAmount || 0);
          totalRepresentativeCommissions += Number(item.commissionRecord?.representativeCommissionAmount || 0);
          recordCount++;
        }
      });
    }

    console.log(`[Commissions Report] Totais calculados:`, {
      totalSales,
      totalPrescriberCommissions,
      totalRepresentativeCommissions,
      recordCount
    });

    return NextResponse.json({
      report,
      summary: {
        totalSales,
        totalPrescriberCommissions,
        totalRepresentativeCommissions,
        recordCount,
        filters: {
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
          prescriberId: filters.prescriberId || null,
          representativeId: filters.representativeId || null,
          groupBy: filters.groupBy || 'none'
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
