import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { representatives, prescribers, coupons, orders, commissionRecords } from '@/lib/db/schema';
import { eq, asc, desc, ilike, or, sql, and, inArray } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento de representantes (Admin)
 * GET /api/admin/representatives - Lista todos os representantes com estatísticas
 * POST /api/admin/representatives - Cria novo representante
 *
 * Protegido por autenticação JWT
 */

const PAID_ORDER_STATUSES: Array<'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];

/**
 * Lista todos os representantes cadastrados com estatísticas
 * GET /api/admin/representatives
 * Query params: search, entityType, isActive, sortBy, sortOrder, limit, offset
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
    const search = searchParams.get('search');
    const entityType = searchParams.get('entityType');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    // Monta condições de filtro
    let whereCondition = undefined;

    // Filtro de busca por nome, telefone ou email
    if (search) {
      whereCondition = or(
        ilike(representatives.name, `%${search}%`),
        ilike(representatives.phone, `%${search}%`),
        ilike(representatives.email, `%${search}%`)
      );
    }

    // Filtro por tipo de entidade
    if (entityType) {
      const entityCondition = eq(representatives.entityType, entityType);
      whereCondition = whereCondition ? and(whereCondition, entityCondition) : entityCondition;
    }

    // Filtro de status
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      const statusCondition = eq(representatives.isActive, isActive === 'true');
      whereCondition = whereCondition ? and(whereCondition, statusCondition) : statusCondition;
    }

    // Query ultra simplificada para teste - sem where, sem ordenação, sem paginação
    const representativesList = await db
      .select()
      .from(representatives)
      .limit(10);

    // Estatísticas simplificadas
    const representativesWithStats = representativesList.map((rep) => ({
      ...rep,
      prescriberCount: 0,
      totalSales: 0,
      totalCommission: 0,
    }));

    return NextResponse.json({
      representatives: representativesWithStats,
      pagination: {
        total: representativesWithStats.length,
        limit: 10,
        offset: 0,
        hasMore: false,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar representantes:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Cria novo representante
 * POST /api/admin/representatives
 * Body: { name, phone, countryCode?, email?, cpfCnpj?, defaultCommission?, entityType?, notes? }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validações
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nome é obrigatório (mínimo 3 caracteres)' },
        { status: 400 }
      );
    }

    if (!body.phone || typeof body.phone !== 'string') {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Valida formato de telefone (aceita formatos mais flexíveis)
    const cleanPhone = body.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json(
        { error: 'Telefone deve ter entre 10 e 15 dígitos' },
        { status: 400 }
      );
    }

    // Validar comissão se fornecida
    if (body.defaultCommission !== undefined && body.defaultCommission !== null) {
      const commission = Number(body.defaultCommission);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'Comissão deve estar entre 0 e 100%' },
          { status: 400 }
        );
      }
    }

    // Validar entity type
    const validEntityTypes = ['individual', 'clinic', 'company'];
    if (body.entityType && !validEntityTypes.includes(body.entityType)) {
      return NextResponse.json(
        { error: 'Tipo de entidade inválido. Use: individual, clinic ou company' },
        { status: 400 }
      );
    }

    // Valida CPF/CNPJ se fornecido
    if (body.cpfCnpj) {
      const cleanDoc = body.cpfCnpj.replace(/\D/g, '');
      if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        return NextResponse.json(
          { error: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' },
          { status: 400 }
        );
      }

      // Verifica unicidade de CPF/CNPJ
      const [existingDoc] = await db
        .select()
        .from(representatives)
        .where(eq(representatives.cpfCnpj, cleanDoc))
        .limit(1);

      if (existingDoc) {
        return NextResponse.json(
          { error: 'Já existe um representante com este CPF/CNPJ' },
          { status: 409 }
        );
      }
    }

    // Prepara dados do representante
    const newRepresentative = {
      name: body.name.trim(),
      phone: cleanPhone,
      countryCode: body.countryCode || '+55',
      email: body.email?.trim() || null,
      cpfCnpj: body.cpfCnpj ? body.cpfCnpj.replace(/\D/g, '') : null,
      defaultCommission: body.defaultCommission !== undefined && body.defaultCommission !== null
        ? String(body.defaultCommission)
        : null,
      entityType: body.entityType || 'individual',
      isActive: body.isActive !== undefined ? body.isActive : true,
      notes: body.notes || null
    };

    // Insere representante no banco
    const [createdRepresentative] = await db
      .insert(representatives)
      .values(newRepresentative)
      .returning();

    // Log de auditoria
    console.log('Representante criado:', {
      action: 'create',
      entityId: createdRepresentative.id,
      timestamp: new Date().toISOString(),
      data: createdRepresentative,
    });

    return NextResponse.json(
      { 
        message: 'Representante criado com sucesso', 
        representative: {
          ...createdRepresentative,
          prescriberCount: 0,
          totalSales: 0,
          totalCommission: 0,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar representante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
