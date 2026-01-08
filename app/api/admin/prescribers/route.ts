import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescribers, representatives, coupons } from '@/lib/db/schema';
import { eq, desc, sql, ilike, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento de prescritores/influencers (Admin)
 * GET /api/admin/prescribers - Lista todos os prescritores com filtros
 * POST /api/admin/prescribers - Cria novo prescritor
 *
 * Protegido por autenticação JWT
 */

/**
 * Lista todos os prescritores
 * GET /api/admin/prescribers
 * Query params: search, representativeId, isActive, sortBy, sortOrder, limit, offset
 * Retorna prescritores com dados do representante vinculado
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

    // Extrai parâmetros de filtro
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const representativeId = searchParams.get('representativeId');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    // Monta condições de filtro
    const conditions = [];
    
    if (search) {
      conditions.push(ilike(prescribers.name, `%${search}%`));
    }
    
    if (representativeId === 'independent') {
      conditions.push(sql`${prescribers.representativeId} IS NULL`);
    } else if (representativeId) {
      conditions.push(eq(prescribers.representativeId, representativeId));
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      conditions.push(eq(prescribers.isActive, isActive === 'true'));
    }

    // Busca prescritores com LEFT JOIN para representantes e contagem de cupons
    const results = await db
      .select({
        prescriber: prescribers,
        representative: {
          id: representatives.id,
          name: representatives.name,
          phone: representatives.phone,
          countryCode: representatives.countryCode,
        },
        couponCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${coupons} 
          WHERE ${coupons.prescriberId} = ${prescribers.id}
        )`.as('couponCount'),
      })
      .from(prescribers)
      .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        sortOrder === 'desc' 
          ? desc(prescribers[sortBy as keyof typeof prescribers] || prescribers.name)
          : prescribers[sortBy as keyof typeof prescribers] || prescribers.name
      )
      .limit(limit)
      .offset(offset);

    // Conta total para paginação
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(prescribers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Formata resposta com dados do representante ou null
    const prescribersWithDetails = results.map(row => ({
      ...row.prescriber,
      representative: row.representative?.id ? row.representative : null,
      couponCount: Number(row.couponCount || 0),
    }));

    return NextResponse.json({
      prescribers: prescribersWithDetails,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao listar prescritores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Cria novo prescritor
 * POST /api/admin/prescribers
 * Body: { name, phone, countryCode?, email?, cpfCnpj?, representativeId?, defaultCommission?, notes? }
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

    // Valida campos obrigatórios
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nome é obrigatório e deve ter no mínimo 3 caracteres' },
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

    // Valida representante se fornecido
    if (body.representativeId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.representativeId)) {
        return NextResponse.json(
          { error: 'ID do representante inválido' },
          { status: 400 }
        );
      }

      const [representative] = await db
        .select()
        .from(representatives)
        .where(eq(representatives.id, body.representativeId))
        .limit(1);

      if (!representative) {
        return NextResponse.json(
          { error: 'Representante não encontrado' },
          { status: 404 }
        );
      }
    }

    // Valida comissão se fornecida
    if (body.defaultCommission !== undefined && body.defaultCommission !== null) {
      const commission = Number(body.defaultCommission);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'Comissão deve estar entre 0 e 100%' },
          { status: 400 }
        );
      }
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
        .from(prescribers)
        .where(eq(prescribers.cpfCnpj, cleanDoc))
        .limit(1);

      if (existingDoc) {
        return NextResponse.json(
          { error: 'Já existe um prescritor com este CPF/CNPJ' },
          { status: 409 }
        );
      }
    }

    // Cria prescritor
    const [newPrescriber] = await db
      .insert(prescribers)
      .values({
        name: body.name.trim(),
        phone: cleanPhone,
        countryCode: body.countryCode || '+55',
        email: body.email?.trim() || null,
        cpfCnpj: body.cpfCnpj ? body.cpfCnpj.replace(/\D/g, '') : null,
        representativeId: body.representativeId || null,
        defaultCommission: body.defaultCommission !== undefined && body.defaultCommission !== null
          ? String(body.defaultCommission)
          : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        notes: body.notes || null,
      })
      .returning();

    // Busca dados completos incluindo representante
    let representative = null;
    if (newPrescriber.representativeId) {
      const [rep] = await db
        .select({
          id: representatives.id,
          name: representatives.name,
          phone: representatives.phone,
          countryCode: representatives.countryCode,
        })
        .from(representatives)
        .where(eq(representatives.id, newPrescriber.representativeId))
        .limit(1);
      representative = rep || null;
    }

    console.log('Prescritor criado:', {
      action: 'create',
      entityId: newPrescriber.id,
      timestamp: new Date().toISOString(),
      data: newPrescriber,
    });

    return NextResponse.json(
      {
        message: 'Prescritor criado com sucesso',
        prescriber: {
          ...newPrescriber,
          representative,
          couponCount: 0,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar prescritor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
