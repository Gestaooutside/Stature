import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescribers, coupons, representatives } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento individual de prescritores (Admin)
 * GET /api/admin/prescribers/[id] - Busca prescritor por ID com estatísticas
 * PATCH /api/admin/prescribers/[id] - Atualiza prescritor
 * DELETE /api/admin/prescribers/[id] - Deleta prescritor
 *
 * Protegido por autenticação JWT
 */

/**
 * Busca prescritor por ID com estatísticas
 * GET /api/admin/prescribers/[id]
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

    // Busca prescritor com dados do representante
    const [result] = await db
      .select({
        prescriber: prescribers,
        representative: {
          id: representatives.id,
          name: representatives.name,
          phone: representatives.phone,
          countryCode: representatives.countryCode,
        },
      })
      .from(prescribers)
      .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
      .where(eq(prescribers.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json({ error: 'Prescritor não encontrado' }, { status: 404 });
    }

    // Conta cupons vinculados
    const couponCount = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) FILTER (WHERE is_active = true)`
      })
      .from(coupons)
      .where(eq(coupons.prescriberId, id));

    return NextResponse.json({
      prescriber: {
        ...result.prescriber,
        representative: result.representative?.id ? result.representative : null,
      },
      stats: {
        totalCoupons: Number(couponCount[0]?.total || 0),
        activeCoupons: Number(couponCount[0]?.active || 0),
        totalSales: 0, // TODO: implementar quando sistema de vendas estiver pronto
        totalCommissions: 0, // TODO: implementar
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar prescritor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Atualiza prescritor existente
 * PATCH /api/admin/prescribers/[id]
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

    // Busca prescritor existente
    const [existingPrescriber] = await db
      .select()
      .from(prescribers)
      .where(eq(prescribers.id, id))
      .limit(1);

    if (!existingPrescriber) {
      return NextResponse.json({ error: 'Prescritor não encontrado' }, { status: 404 });
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

    if (body.representativeId !== undefined) {
      if (body.representativeId) {
        // Valida representante existe
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
      updateData.representativeId = body.representativeId || null;
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

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes || null;
    }

    // Atualiza prescritor no banco
    const [updatedPrescriber] = await db
      .update(prescribers)
      .set(updateData)
      .where(eq(prescribers.id, id))
      .returning();

    return NextResponse.json(
      { 
        message: 'Prescritor atualizado com sucesso', 
        prescriber: updatedPrescriber 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar prescritor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deleta prescritor
 * DELETE /api/admin/prescribers/[id]
 * Verifica se há cupons ativos vinculados antes de deletar
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

    // Busca prescritor existente
    const [existingPrescriber] = await db
      .select()
      .from(prescribers)
      .where(eq(prescribers.id, id))
      .limit(1);

    if (!existingPrescriber) {
      return NextResponse.json({ error: 'Prescritor não encontrado' }, { status: 404 });
    }

    // Verifica se há cupons vinculados
    const linkedCoupons = await db
      .select({ count: sql<number>`count(*)` })
      .from(coupons)
      .where(eq(coupons.prescriberId, id));

    const couponCount = Number(linkedCoupons[0]?.count || 0);

    if (couponCount > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível deletar prescritor com ${couponCount} cupom(ns) vinculado(s)`,
          suggestion: 'Desative o prescritor ou remova os cupons vinculados primeiro'
        },
        { status: 400 }
      );
    }

    // Deleta prescritor
    await db.delete(prescribers).where(eq(prescribers.id, id));

    return NextResponse.json(
      { message: 'Prescritor deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar prescritor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
