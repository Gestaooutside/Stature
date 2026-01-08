import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, desc, like, ilike, and, or, count } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento de leads (Admin)
 * GET /api/admin/leads - Lista todos os leads com filtros
 * POST /api/admin/leads - Cria novo lead
 *
 * Protegido por autenticação JWT (middleware)
 */

/**
 * Lista todos os leads com suporte a filtros e paginação
 * GET /api/admin/leads?source=newsletter&search=nome&page=1&limit=20
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

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

    // Ordena por criação (mais recentes primeiro) e aplica paginação
    const allLeads = await query
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    // Busca total de registros para paginação
    let totalCountQuery = db.select({ count: count() }).from(leads);
    if (conditions.length > 0) {
      totalCountQuery = totalCountQuery.where(and(...conditions));
    }
    const [{ count: total }] = await totalCountQuery;

    return NextResponse.json({
      leads: allLeads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Cria novo lead manualmente (uso raro, geralmente usamos a API pública)
 * POST /api/admin/leads
 * Body: { name, whatsapp, sourceType, email?, ...outrosCampos }
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

    // Validações obrigatórias
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.whatsapp || typeof body.whatsapp !== 'string' || body.whatsapp.trim().length === 0) {
      return NextResponse.json(
        { error: 'WhatsApp é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.sourceType || !['newsletter', 'checkout'].includes(body.sourceType)) {
      return NextResponse.json(
        { error: 'Tipo de origem inválido. Use newsletter ou checkout.' },
        { status: 400 }
      );
    }

    // Valida formato do WhatsApp (básico)
    const whatsappClean = body.whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10 || whatsappClean.length > 13) {
      return NextResponse.json(
        { error: 'WhatsApp inválido' },
        { status: 400 }
      );
    }

    // Valida email se fornecido
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Prepara dados do lead
    const newLead = {
      name: body.name.trim(),
      whatsapp: whatsappClean,
      sourceType: body.sourceType as 'newsletter' | 'checkout',
      email: body.email || null,
      cpfCnpj: body.cpfCnpj?.replace(/\D/g, '') || null,
      phone: body.phone?.replace(/\D/g, '') || null,
      postalCode: body.postalCode?.replace(/\D/g, '') || null,
      addressNumber: body.addressNumber || null,
      addressComplement: body.addressComplement || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      couponCode: body.couponCode || null,
      convertedToSale: false,
      conversionDate: null,
      ipAddress: body.ipAddress || null,
      userAgent: body.userAgent || null,
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
    };

    // Insere lead no banco
    const [createdLead] = await db
      .insert(leads)
      .values(newLead)
      .returning();

    return NextResponse.json(
      { message: 'Lead criado com sucesso', lead: createdLead },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}