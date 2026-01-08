import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons, prescribers, representatives, orders, commissionRecords } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento individual de cupons (Admin)
 * GET /api/admin/coupons/[id] - Busca cupom com estatísticas detalhadas
 * PATCH /api/admin/coupons/[id] - Atualiza cupom
 * DELETE /api/admin/coupons/[id] - Deleta cupom
 *
 * Protegido por autenticação JWT
 */

/**
 * Busca cupom com estatísticas detalhadas
 * GET /api/admin/coupons/[id]
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

    // Busca cupom com dados relacionados
    const [result] = await db
      .select({
        coupon: coupons,
        prescriber: prescribers,
        representative: representatives,
      })
      .from(coupons)
      .leftJoin(prescribers, eq(coupons.prescriberId, prescribers.id))
      .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
      .where(eq(coupons.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    // Estatísticas de uso
    const usageStats = await db
      .select({
        usageCount: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(total::numeric), 0)`,
        lastUsedAt: sql<string>`MAX(created_at)`,
      })
      .from(orders)
      .where(sql`(metadata->>'couponCode')::text = ${result.coupon.code}`);

    // Comissões totais
    const commissionStats = await db
      .select({
        totalPrescriberCommission: sql<number>`COALESCE(SUM(prescriber_commission_amount::numeric), 0)`,
        totalRepresentativeCommission: sql<number>`COALESCE(SUM(representative_commission_amount::numeric), 0)`,
      })
      .from(commissionRecords)
      .where(eq(commissionRecords.couponId, id));

    // Últimos pedidos com este cupom (limitado a 5)
    const recentOrders = await db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        metadata: orders.metadata,
      })
      .from(orders)
      .where(sql`(metadata->>'couponCode')::text = ${result.coupon.code}`)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Calcula taxas efetivas de comissão
    const prescriberRate = Number(
      result.coupon.prescriberCommissionOverride || 
      result.prescriber?.defaultCommission || 
      0
    );
    const representativeRate = Number(
      result.coupon.representativeCommissionOverride || 
      result.representative?.defaultCommission || 
      0
    );

    // Dias até expiração
    let daysUntilExpiration: number | null = null;
    if (result.coupon.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(result.coupon.expiresAt);
      daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      coupon: {
        ...result.coupon,
        discount: Number(result.coupon.discount),
        minPurchaseAmount: result.coupon.minPurchaseAmount ? Number(result.coupon.minPurchaseAmount) : null,
        prescriberCommissionOverride: result.coupon.prescriberCommissionOverride 
          ? Number(result.coupon.prescriberCommissionOverride) 
          : null,
        representativeCommissionOverride: result.coupon.representativeCommissionOverride 
          ? Number(result.coupon.representativeCommissionOverride) 
          : null,
        daysUntilExpiration,
      },
      prescriber: result.prescriber?.id ? {
        ...result.prescriber,
        defaultCommission: result.prescriber.defaultCommission ? Number(result.prescriber.defaultCommission) : null,
      } : null,
      representative: result.representative?.id ? {
        ...result.representative,
        defaultCommission: result.representative.defaultCommission ? Number(result.representative.defaultCommission) : null,
      } : null,
      stats: {
        usageCount: Number(usageStats[0]?.usageCount || 0),
        revenue: Number(usageStats[0]?.revenue || 0),
        lastUsedAt: usageStats[0]?.lastUsedAt || null,
        totalPrescriberCommission: Number(commissionStats[0]?.totalPrescriberCommission || 0),
        totalRepresentativeCommission: Number(commissionStats[0]?.totalRepresentativeCommission || 0),
      },
      effectiveRates: {
        prescriberRate,
        representativeRate,
        totalRate: prescriberRate + representativeRate,
        source: {
          prescriber: result.coupon.prescriberCommissionOverride ? 'override' : 'default',
          representative: result.coupon.representativeCommissionOverride ? 'override' : 'default',
        },
      },
      recentOrders: recentOrders.map(order => ({
        ...order,
        total: Number(order.total),
      })),
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar cupom:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Atualiza cupom existente
 * PATCH /api/admin/coupons/[id]
 * Body: campos a serem atualizados (code, discount, description, isActive, expiresAt, maxUses, minPurchaseAmount)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Aguarda params (Next.js 15)
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

    // Busca cupom existente
    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    // Prepara dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Atualiza apenas campos fornecidos
    if (body.code !== undefined) {
      const newCode = body.code.toUpperCase().trim();
      // Verifica se novo código já existe (exceto o próprio cupom)
      const [duplicate] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, newCode))
        .limit(1);

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: 'Código de cupom já existe' },
          { status: 409 }
        );
      }
      updateData.code = newCode;
    }

    if (body.discountType !== undefined) {
      if (!['percentage', 'fixed'].includes(body.discountType)) {
        return NextResponse.json(
          { error: 'Tipo de desconto inválido' },
          { status: 400 }
        );
      }
      updateData.discountType = body.discountType;
    }

    if (body.discount !== undefined) {
      if (typeof body.discount !== 'number' || body.discount <= 0) {
        return NextResponse.json(
          { error: 'Valor do desconto deve ser maior que zero' },
          { status: 400 }
        );
      }
      // Se tipo percentual, valida limite de 100
      const currentType = body.discountType || existingCoupon.discountType;
      if (currentType === 'percentage' && body.discount > 100) {
        return NextResponse.json(
          { error: 'Desconto percentual deve ser entre 1 e 100' },
          { status: 400 }
        );
      }
      updateData.discount = String(body.discount);
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || !body.description.trim()) {
        return NextResponse.json(
          { error: 'Descrição inválida' },
          { status: 400 }
        );
      }
      updateData.description = body.description;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses || null;
    }

    if (body.minPurchaseAmount !== undefined) {
      updateData.minPurchaseAmount = body.minPurchaseAmount ? String(body.minPurchaseAmount) : null;
    }

    if (body.commission !== undefined) {
      updateData.commission = body.commission ? String(body.commission) : null;
    }

    if (body.prescriber !== undefined) {
      updateData.prescriber = body.prescriber || null;
    }

    // Novos campos do sistema multinível
    if (body.prescriberId !== undefined) {
      if (body.prescriberId) {
        // Valida prescritor existe
        const [prescriber] = await db
          .select()
          .from(prescribers)
          .where(eq(prescribers.id, body.prescriberId))
          .limit(1);
        
        if (!prescriber) {
          return NextResponse.json(
            { error: 'Prescritor não encontrado' },
            { status: 404 }
          );
        }
      }
      updateData.prescriberId = body.prescriberId || null;
    }

    if (body.prescriberCommissionOverride !== undefined) {
      if (body.prescriberCommissionOverride !== null) {
        const commission = Number(body.prescriberCommissionOverride);
        if (isNaN(commission) || commission < 0 || commission > 100) {
          return NextResponse.json(
            { error: 'Comissão do prescritor deve estar entre 0 e 100%' },
            { status: 400 }
          );
        }
        updateData.prescriberCommissionOverride = String(commission);
      } else {
        updateData.prescriberCommissionOverride = null;
      }
    }

    if (body.representativeCommissionOverride !== undefined) {
      if (body.representativeCommissionOverride !== null) {
        const commission = Number(body.representativeCommissionOverride);
        if (isNaN(commission) || commission < 0 || commission > 100) {
          return NextResponse.json(
            { error: 'Comissão do representante deve estar entre 0 e 100%' },
            { status: 400 }
          );
        }
        updateData.representativeCommissionOverride = String(commission);
      } else {
        updateData.representativeCommissionOverride = null;
      }
    }

    // Valida e atualiza campos de recorrência
    if (body.isRecurring !== undefined) {
      updateData.isRecurring = Boolean(body.isRecurring);

      // Se está ativando recorrência, valida ciclo
      if (body.isRecurring) {
        const validCycles = ['MONTHLY'];
        const cycle = body.recurringCycle || 'MONTHLY';

        if (!validCycles.includes(cycle)) {
          return NextResponse.json(
            { error: 'Ciclo de recorrência inválido. Apenas MONTHLY é suportado.' },
            { status: 400 }
          );
        }

        updateData.recurringCycle = cycle;
      }
    }

    // Se não está atualizando recorrência mas está fornecendo ciclo
    if (body.recurringCycle !== undefined && updateData.isRecurring !== false) {
      const validCycles = ['MONTHLY'];
      if (!validCycles.includes(body.recurringCycle)) {
        return NextResponse.json(
          { error: 'Ciclo de recorrência inválido. Apenas MONTHLY é suportado.' },
          { status: 400 }
        );
      }
      updateData.recurringCycle = body.recurringCycle;
    }

    // Atualiza cupom no banco
    const [updatedCoupon] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();

    return NextResponse.json(
      { message: 'Cupom atualizado com sucesso', coupon: updatedCoupon },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deleta cupom
 * DELETE /api/admin/coupons/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Aguarda params (Next.js 15)
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

    // Busca cupom existente
    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    // Deleta cupom
    await db.delete(coupons).where(eq(coupons.id, id));

    return NextResponse.json(
      { message: 'Cupom deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar cupom:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
