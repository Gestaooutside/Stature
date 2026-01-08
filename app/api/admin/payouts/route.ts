import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payouts, prescribers, representatives, commissionRecords } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, or } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gestão de repasses/payouts (Admin)
 * GET /api/admin/payouts - Lista repasses
 * POST /api/admin/payouts - Cria novo repasse
 *
 * Protegido por autenticação JWT
 */

/**
 * Lista repasses com filtros opcionais
 * GET /api/admin/payouts
 * Query params: entityType, entityId, status, startDate, endDate
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
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir query com filtros
    const conditions = [];
    
    if (entityType) {
      conditions.push(eq(payouts.entityType, entityType));
    }
    
    if (entityId) {
      conditions.push(eq(payouts.entityId, entityId));
    }
    
    if (status) {
      conditions.push(eq(payouts.status, status));
    }
    
    if (startDate) {
      conditions.push(gte(payouts.periodStart, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(payouts.periodEnd, new Date(endDate)));
    }

    let query = db.select().from(payouts);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allPayouts = await query.orderBy(sql`${payouts.createdAt} DESC`);

    return NextResponse.json({ payouts: allPayouts }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar repasses:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Cria novo repasse
 * POST /api/admin/payouts
 * Body: { entityType, entityId, amount, periodStart, periodEnd, paymentMethod?, notes? }
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
    if (!body.entityType || !['prescriber', 'representative'].includes(body.entityType)) {
      return NextResponse.json(
        { error: 'Tipo de entidade inválido. Use: prescriber ou representative' },
        { status: 400 }
      );
    }

    if (!body.entityId) {
      return NextResponse.json(
        { error: 'ID da entidade é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'Valor do repasse deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (!body.periodStart || !body.periodEnd) {
      return NextResponse.json(
        { error: 'Período inicial e final são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se entidade existe
    if (body.entityType === 'prescriber') {
      const [prescriber] = await db
        .select()
        .from(prescribers)
        .where(eq(prescribers.id, body.entityId))
        .limit(1);
      
      if (!prescriber) {
        return NextResponse.json(
          { error: 'Prescritor não encontrado' },
          { status: 404 }
        );
      }
    } else {
      const [representative] = await db
        .select()
        .from(representatives)
        .where(eq(representatives.id, body.entityId))
        .limit(1);
      
      if (!representative) {
        return NextResponse.json(
          { error: 'Representante não encontrado' },
          { status: 404 }
        );
      }
    }

    // Prepara dados do repasse
    const newPayout = {
      entityType: body.entityType,
      entityId: body.entityId,
      amount: String(body.amount),
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
      status: 'pending',
      paymentMethod: body.paymentMethod || null,
      notes: body.notes || null,
      createdBy: session.userId || 'admin'
    };

    // Insere repasse no banco
    const [createdPayout] = await db
      .insert(payouts)
      .values(newPayout)
      .returning();

    return NextResponse.json(
      { 
        message: 'Repasse criado com sucesso', 
        payout: createdPayout 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar repasse:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
