import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, desc, ilike, and, or } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para exportação de leads em CSV (Admin)
 * GET /api/admin/leads/export?sourceType=newsletter&search=nome
 *
 * Retorna arquivo CSV com dados filtrados dos leads
 * Protegido por autenticação JWT
 */

/**
 * Exporta leads para formato CSV
 * GET /api/admin/leads/export
 * Query params:
 * - sourceType: 'newsletter' | 'checkout' (opcional)
 * - search: termo para busca (opcional)
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

    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType') as 'newsletter' | 'checkout' | null;
    const search = searchParams.get('search');

    // Constrói query base
    let query = db.select().from(leads);

    // Aplica filtros
    const conditions = [];
    if (sourceType) {
      conditions.push(eq(leads.sourceType, sourceType));
    }
    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.whatsapp, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.couponCode, `%${search}%`)
        )
      );
    }

    // Aplica condições se houver
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Busca todos os leads filtrados (sem paginação para exportação)
    const allLeads = await query.orderBy(desc(leads.createdAt));

    // Se não houver leads, retorna CSV vazio com cabeçalho
    if (allLeads.length === 0) {
      const csvHeaders = [
        'ID',
        'Tipo de Origem',
        'Nome',
        'WhatsApp',
        'Email',
        'CPF/CNPJ',
        'Telefone',
        'CEP',
        'Número',
        'Complemento',
        'Endereço',
        'Cidade',
        'Estado',
        'Código do Cupom',
        'Convertido em Venda',
        'Data da Conversão',
        'IP Address',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'Data de Criação',
        'Data de Atualização'
      ];

      const csvContent = csvHeaders.join(',') + '\n';

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Monta CSV com cabeçalhos personalizadas baseado no tipo de fonte
    const isCheckoutOnly = sourceType === 'checkout';
    const csvHeaders = [
      'ID',
      'Tipo de Origem',
      'Nome',
      'WhatsApp',
      ...(isCheckoutOnly || !sourceType ? ['Email'] : []),
      ...(isCheckoutOnly || !sourceType ? ['CPF/CNPJ'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Telefone'] : []),
      ...(isCheckoutOnly || !sourceType ? ['CEP'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Número'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Complemento'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Endereço'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Cidade'] : []),
      ...(isCheckoutOnly || !sourceType ? ['Estado'] : []),
      ...(!isCheckoutOnly || !sourceType ? ['Código do Cupom'] : []),
      'Convertido em Venda',
      'Data da Conversão',
      'IP Address',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Data de Criação',
      'Data de Atualização'
    ];

    // Função para escapar valores CSV
    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) return '';
      const stringValue = String(field);
      // Escapa aspas e envolve em aspas se contiver vírgula, aspas ou quebra de linha
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Converte leads para linhas CSV
    const csvRows = allLeads.map(lead => {
      const baseRow = [
        lead.id,
        lead.sourceType,
        escapeCsvField(lead.name),
        escapeCsvField(lead.whatsapp)
      ];

      const conditionalFields = [
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.email)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.cpfCnpj)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.phone)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.postalCode)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.addressNumber)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.addressComplement)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.address)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.city)] : []),
        ...(isCheckoutOnly || !sourceType ? [escapeCsvField(lead.state)] : []),
        ...(!isCheckoutOnly || !sourceType ? [escapeCsvField(lead.couponCode)] : [])
      ];

      const finalRow = [
        ...baseRow,
        ...conditionalFields,
        lead.convertedToSale ? 'Sim' : 'Não',
        lead.conversionDate ? new Date(lead.conversionDate).toLocaleString('pt-BR') : '',
        escapeCsvField(lead.ipAddress),
        escapeCsvField(lead.utmSource),
        escapeCsvField(lead.utmMedium),
        escapeCsvField(lead.utmCampaign),
        new Date(lead.createdAt).toLocaleString('pt-BR'),
        new Date(lead.updatedAt).toLocaleString('pt-BR')
      ];

      return finalRow.join(',');
    });

    // Monta conteúdo CSV
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Adiciona BOM para compatibilidade com Excel (UTF-8)
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Define nome do arquivo baseado nos filtros
    const fileName = `leads_${sourceType || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Erro ao exportar leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}