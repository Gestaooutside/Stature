import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { representatives, prescribers, coupons, orders, commissionRecords, payouts } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento individual de representantes (Admin)
 * PATCH /api/admin/representatives/[id] - Atualiza representante
 * DELETE /api/admin/representatives/[id] - Deleta representante
 * GET /api/admin/representatives/[id]/stats - Estatísticas do representante
 *
 * Protegido por autenticação JWT
 */

/**
 * Atualiza representante existente
 * PATCH /api/admin/representatives/[id]
 * Body: campos a serem atualizados
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();

    // Busca representante existente
    const [existingRepresentative] = await db
      .select()
      .from(representatives)
      .where(eq(representatives.id, id))
      .limit(1);

    if (!existingRepresentative) {
      return NextResponse.json({ error: 'Representante não encontrado' }, { status: 404 });
    }

    // Prepara dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Atualiza apenas campos fornecidos
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 3) {
        return NextResponse.json(
          { error: 'Nome deve ter no mínimo 3 caracteres' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.phone !== undefined) {
      const phoneRegex = /^\+\d{1,3}\d{10,14}$/;
      if (!phoneRegex.test(body.phone)) {
        return NextResponse.json(
          { error: 'Formato de telefone inválido' },
          { status: 400 }
        );
      }
      updateData.phone = body.phone;
    }

    if (body.countryCode !== undefined) {
      updateData.countryCode = body.countryCode;
    }

    if (body.email !== undefined) {
      updateData.email = body.email?.trim() || null;
    }

    if (body.cpfCnpj !== undefined) {
      updateData.cpfCnpj = body.cpfCnpj || null;
    }

    if (body.defaultCommission !== undefined) {
      if (body.defaultCommission !== null) {
        const commission = Number(body.defaultCommission);
        if (isNaN(commission) || commission < 0 || commission > 100) {
          return NextResponse.json(
            { error: 'Comissão deve estar entre 0 e 100%' },
            { status: 400 }
          );
        }
        updateData.defaultCommission = String(commission);
      } else {
        updateData.defaultCommission = null;
      }
    }

    if (body.entityType !== undefined) {
      const validTypes = ['individual', 'clinic', 'company'];
      if (!validTypes.includes(body.entityType)) {
        return NextResponse.json(
          { error: 'Tipo de entidade inválido' },
          { status: 400 }
        );
      }
      updateData.entityType = body.entityType;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes || null;
    }

    // Atualiza representante no banco
    const [updatedRepresentative] = await db
      .update(representatives)
      .set(updateData)
      .where(eq(representatives.id, id))
      .returning();

    return NextResponse.json(
      { 
        message: 'Representante atualizado com sucesso', 
        representative: updatedRepresentative 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar representante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deleta representante
 * DELETE /api/admin/representatives/[id]
 * Verifica se há prescritores vinculados antes de deletar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Busca representante existente
    const [existingRepresentative] = await db
      .select()
      .from(representatives)
      .where(eq(representatives.id, id))
      .limit(1);

    if (!existingRepresentative) {
      return NextResponse.json({ error: 'Representante não encontrado' }, { status: 404 });
    }

    // Verifica se há prescritores ativos vinculados
    const linkedPrescribers = await db
      .select()
      .from(prescribers)
      .where(eq(prescribers.representativeId, id))
      .limit(1);

    if (linkedPrescribers.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar representante com prescritores vinculados',
          suggestion: 'Desative o representante ou remova os prescritores vinculados primeiro'
        },
        { status: 400 }
      );
    }

    // Deleta representante
    await db.delete(representatives).where(eq(representatives.id, id));

    return NextResponse.json(
      { message: 'Representante deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar representante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Retorna representante com estatísticas completas
 * GET /api/admin/representatives/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Busca representante
    const [representative] = await db
      .select()
      .from(representatives)
      .where(eq(representatives.id, id))
      .limit(1);

    if (!representative) {
      return NextResponse.json({ error: 'Representante não encontrado' }, { status: 404 });
    }

    // Conta prescritores vinculados (total e ativos)
    const prescriberStats = await db
      .select({ 
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) FILTER (WHERE is_active = true)`
      })
      .from(prescribers)
      .where(eq(prescribers.representativeId, id));

    // Calcula comissões totais
    const commissionStats = await db
      .select({
        totalCommission: sql<number>`COALESCE(SUM(representative_commission_amount::numeric), 0)`
      })
      .from(commissionRecords)
      .where(eq(commissionRecords.representativeId, id));

    // Calcula repasses pagos
    const payoutStats = await db
      .select({
        totalPaid: sql<number>`COALESCE(SUM(amount::numeric), 0)`
      })
      .from(payouts)
      .where(
        and(
          eq(payouts.entityType, 'representative'),
          eq(payouts.entityId, id),
          eq(payouts.status, 'paid')
        )
      );

    const totalCommission = Number(commissionStats[0]?.totalCommission || 0);
    const totalPaid = Number(payoutStats[0]?.totalPaid || 0);
    const pendingBalance = totalCommission - totalPaid;

    // Lista prescritores vinculados (limitado a 10 para performance)
    const linkedPrescribers = await db
      .select({
        id: prescribers.id,
        name: prescribers.name,
        phone: prescribers.phone,
        countryCode: prescribers.countryCode,
        isActive: prescribers.isActive,
        couponCount: sql<number>`(
          SELECT COUNT(*) FROM ${coupons} WHERE prescriber_id = ${prescribers.id}
        )`.as('couponCount'),
      })
      .from(prescribers)
      .where(eq(prescribers.representativeId, id))
      .limit(10);

    return NextResponse.json({
      representative,
      stats: {
        totalPrescribers: Number(prescriberStats[0]?.total || 0),
        activePrescribers: Number(prescriberStats[0]?.active || 0),
        totalCommission,
        totalPaid,
        pendingBalance,
      },
      prescribers: linkedPrescribers.map(p => ({
        ...p,
        couponCount: Number(p.couponCount || 0),
      })),
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar representante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
