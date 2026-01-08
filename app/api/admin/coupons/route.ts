import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons, prescribers, representatives, orders } from '@/lib/db/schema';
import { eq, asc, desc, ilike, and, sql, inArray, isNull, isNotNull, lt, gte } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento de cupons (Admin)
 * GET /api/admin/coupons - Lista todos os cupons com filtros e estatísticas
 * POST /api/admin/coupons - Cria novo cupom
 *
 * Protegido por autenticação JWT
 */

const PAID_ORDER_STATUSES: Array<'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];

/**
 * Lista todos os cupons cadastrados com informações de prescritores e estatísticas
 * GET /api/admin/coupons
 * Query params: search, prescriberId, representativeId, discountType, isRecurring, isActive, expired, sortBy, sortOrder, limit, offset
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
    const prescriberId = searchParams.get('prescriberId');
    const representativeId = searchParams.get('representativeId');
    const discountType = searchParams.get('discountType');
    const isRecurring = searchParams.get('isRecurring');
    const isActive = searchParams.get('isActive');
    const expired = searchParams.get('expired');
    const sortBy = searchParams.get('sortBy') || 'code';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    const now = new Date();

    // Monta condições de filtro
    const conditions = [];

    // Filtro de busca por código ou descrição
    if (search) {
      conditions.push(
        ilike(coupons.code, `%${search}%`)
      );
    }

    // Filtro por prescritor
    if (prescriberId === 'none') {
      conditions.push(isNull(coupons.prescriberId));
    } else if (prescriberId) {
      conditions.push(eq(coupons.prescriberId, prescriberId));
    }

    // Filtro por tipo de desconto
    if (discountType) {
      conditions.push(eq(coupons.discountType, discountType as 'percentage' | 'fixed'));
    }

    // Filtro por recorrência
    if (isRecurring !== null && isRecurring !== undefined && isRecurring !== '') {
      conditions.push(eq(coupons.isRecurring, isRecurring === 'true'));
    }

    // Filtro de status
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      conditions.push(eq(coupons.isActive, isActive === 'true'));
    }

    // Filtro por expirados
    if (expired === 'true') {
      conditions.push(lt(coupons.expiresAt, now));
    } else if (expired === 'false') {
      conditions.push(
        sql`(${coupons.expiresAt} IS NULL OR ${coupons.expiresAt} >= ${now})`
      );
    }

    // Query principal com estatísticas
    const results = await db
      .select({
        coupon: coupons,
        prescriber: {
          id: prescribers.id,
          name: prescribers.name,
          phone: prescribers.phone,
          countryCode: prescribers.countryCode,
          defaultCommission: prescribers.defaultCommission,
          representativeId: prescribers.representativeId,
        },
        representative: {
          id: representatives.id,
          name: representatives.name,
          phone: representatives.phone,
          countryCode: representatives.countryCode,
          defaultCommission: representatives.defaultCommission,
        },
        orderCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${orders} 
          WHERE (metadata->>'couponCode')::text = ${coupons.code}
        )`.as('orderCount'),
        revenue: sql<number>`COALESCE((
          SELECT SUM(total::numeric) 
          FROM ${orders} 
          WHERE (metadata->>'couponCode')::text = ${coupons.code}
            AND status IN ('PAID', 'CONFIRMED')
        ), 0)`.as('revenue'),
      })
      .from(coupons)
      .leftJoin(prescribers, eq(coupons.prescriberId, prescribers.id))
      .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        sortOrder === 'desc'
          ? desc(coupons[sortBy as keyof typeof coupons] || coupons.code)
          : asc(coupons[sortBy as keyof typeof coupons] || coupons.code)
      )
      .limit(limit)
      .offset(offset);

    // Filtro por representativeId (via prescriber)
    let filteredResults = results;
    if (representativeId) {
      filteredResults = results.filter(r => r.prescriber?.representativeId === representativeId);
    }

    // Conta total para paginação
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(coupons)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Formata resposta com dados calculados
    const couponsWithStats = filteredResults.map(row => {
      // Calcula dias até expiração
      let daysUntilExpiration: number | null = null;
      if (row.coupon.expiresAt) {
        const expiresAt = new Date(row.coupon.expiresAt);
        daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        coupon: {
          ...row.coupon,
          discount: Number(row.coupon.discount),
          minPurchaseAmount: row.coupon.minPurchaseAmount ? Number(row.coupon.minPurchaseAmount) : null,
          prescriberCommissionOverride: row.coupon.prescriberCommissionOverride 
            ? Number(row.coupon.prescriberCommissionOverride) 
            : null,
          representativeCommissionOverride: row.coupon.representativeCommissionOverride 
            ? Number(row.coupon.representativeCommissionOverride) 
            : null,
          daysUntilExpiration,
        },
        prescriber: row.prescriber?.id ? {
          ...row.prescriber,
          defaultCommission: row.prescriber.defaultCommission ? Number(row.prescriber.defaultCommission) : null,
        } : null,
        representative: row.representative?.id ? {
          ...row.representative,
          defaultCommission: row.representative.defaultCommission ? Number(row.representative.defaultCommission) : null,
        } : null,
        stats: {
          orderCount: Number(row.orderCount || 0),
          revenue: Number(row.revenue || 0),
        },
      };
    });

    return NextResponse.json({
      coupons: couponsWithStats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Cria novo cupom
 * POST /api/admin/coupons
 * Body: { code, discountType, discount, description, prescriberId?, prescriberCommissionOverride?, representativeCommissionOverride?, createNewPrescriber?, newPrescriber?, ... }
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
    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { error: 'Código do cupom é obrigatório' },
        { status: 400 }
      );
    }

    // Valida tipo de desconto
    const discountType = body.discountType || 'percentage';
    if (!['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Tipo de desconto inválido' },
        { status: 400 }
      );
    }

    // Valida valor do desconto baseado no tipo
    if (!body.discount || typeof body.discount !== 'number' || body.discount <= 0) {
      return NextResponse.json(
        { error: 'Valor do desconto é obrigatório e deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Se percentual, limite entre 1 e 100
    if (discountType === 'percentage' && body.discount > 100) {
      return NextResponse.json(
        { error: 'Desconto percentual deve ser entre 1 e 100' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }

    // Converte código para uppercase
    const code = body.code.toUpperCase().trim();

    // Verifica se código já existe
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (existingCoupon.length > 0) {
      return NextResponse.json(
        { error: 'Código de cupom já existe' },
        { status: 409 }
      );
    }

    let prescriberId = body.prescriberId || null;

    // Criar novo prescritor inline se solicitado
    if (body.createNewPrescriber && body.newPrescriber) {
      const { name, phone, countryCode, email, representativeId } = body.newPrescriber;

      if (!name || !phone) {
        return NextResponse.json(
          { error: 'Nome e telefone são obrigatórios para criar novo prescritor' },
          { status: 400 }
        );
      }

      // Validar representante se fornecido
      if (representativeId) {
        const [rep] = await db
          .select()
          .from(representatives)
          .where(eq(representatives.id, representativeId))
          .limit(1);

        if (!rep) {
          return NextResponse.json(
            { error: 'Representante não encontrado' },
            { status: 404 }
          );
        }
      }

      // Criar prescritor
      const [newPrescriber] = await db
        .insert(prescribers)
        .values({
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          countryCode: countryCode || '+55',
          email: email?.trim() || null,
          representativeId: representativeId || null,
          isActive: true,
        })
        .returning();

      prescriberId = newPrescriber.id;

      console.log('Prescritor criado inline:', {
        action: 'create_inline',
        entityId: newPrescriber.id,
        couponCode: code,
        timestamp: new Date().toISOString(),
      });
    }

    // Validar prescritor se fornecido (não inline)
    if (prescriberId && !body.createNewPrescriber) {
      const [prescriber] = await db
        .select()
        .from(prescribers)
        .where(eq(prescribers.id, prescriberId))
        .limit(1);

      if (!prescriber) {
        return NextResponse.json(
          { error: 'Prescritor não encontrado' },
          { status: 404 }
        );
      }
    }

    // Validar comissões override se fornecidas
    if (body.prescriberCommissionOverride !== undefined && body.prescriberCommissionOverride !== null) {
      const commission = Number(body.prescriberCommissionOverride);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'Comissão do prescritor deve estar entre 0 e 100%' },
          { status: 400 }
        );
      }
    }

    if (body.representativeCommissionOverride !== undefined && body.representativeCommissionOverride !== null) {
      const commission = Number(body.representativeCommissionOverride);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'Comissão do representante deve estar entre 0 e 100%' },
          { status: 400 }
        );
      }
    }

    // Valida campos de recorrência
    if (body.isRecurring && body.recurringCycle) {
      const validCycles = ['MONTHLY', 'WEEKLY', 'YEARLY'];
      if (!validCycles.includes(body.recurringCycle)) {
        return NextResponse.json(
          { error: 'Ciclo de recorrência inválido' },
          { status: 400 }
        );
      }
    }

    // Prepara dados do cupom
    const newCoupon = {
      code,
      discountType: discountType as 'percentage' | 'fixed',
      discount: String(body.discount),
      description: body.description,
      isActive: body.isActive !== undefined ? body.isActive : true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      maxUses: body.maxUses || null,
      minPurchaseAmount: body.minPurchaseAmount ? String(body.minPurchaseAmount) : null,
      // Sistema multinível
      prescriberId,
      prescriberCommissionOverride: body.prescriberCommissionOverride !== undefined && body.prescriberCommissionOverride !== null
        ? String(body.prescriberCommissionOverride)
        : null,
      representativeCommissionOverride: body.representativeCommissionOverride !== undefined && body.representativeCommissionOverride !== null
        ? String(body.representativeCommissionOverride)
        : null,
      // Campos antigos (compatibilidade)
      commission: body.commission ? String(body.commission) : null,
      prescriber: body.prescriber || null,
      // Recorrência
      isRecurring: body.isRecurring || false,
      recurringCycle: body.isRecurring ? (body.recurringCycle || 'MONTHLY') : 'MONTHLY',
    };

    // Insere cupom no banco
    const [createdCoupon] = await db
      .insert(coupons)
      .values(newCoupon)
      .returning();

    // Busca dados completos para retorno
    let prescriberData = null;
    let representativeData = null;

    if (createdCoupon.prescriberId) {
      const [pres] = await db
        .select()
        .from(prescribers)
        .where(eq(prescribers.id, createdCoupon.prescriberId))
        .limit(1);

      if (pres) {
        prescriberData = pres;

        if (pres.representativeId) {
          const [rep] = await db
            .select()
            .from(representatives)
            .where(eq(representatives.id, pres.representativeId))
            .limit(1);

          representativeData = rep || null;
        }
      }
    }

    // Warning se soma de comissões elevada
    let warning = undefined;
    const prescriberRate = Number(createdCoupon.prescriberCommissionOverride || prescriberData?.defaultCommission || 0);
    const representativeRate = Number(createdCoupon.representativeCommissionOverride || representativeData?.defaultCommission || 0);
    const totalCommission = prescriberRate + representativeRate;

    if (totalCommission > 40) {
      warning = `Soma de comissões elevada: ${totalCommission}%`;
    }

    console.log('Cupom criado:', {
      action: 'create',
      entityId: createdCoupon.id,
      code: createdCoupon.code,
      prescriberId: createdCoupon.prescriberId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Cupom criado com sucesso',
      coupon: {
        coupon: createdCoupon,
        prescriber: prescriberData,
        representative: representativeData,
        stats: {
          orderCount: 0,
          revenue: 0,
        },
      },
      warning,
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
