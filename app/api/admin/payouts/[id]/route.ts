import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payouts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento individual de repasses (Admin)
 * PATCH /api/admin/payouts/[id] - Atualiza repasse
 * DELETE /api/admin/payouts/[id] - Deleta repasse
 *
 * Protegido por autenticação JWT
 */

/**
 * Atualiza repasse existente (principalmente para marcar como pago)
 * PATCH /api/admin/payouts/[id]
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

    // Busca repasse existente
    const [existingPayout] = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, id))
      .limit(1);

    if (!existingPayout) {
      return NextResponse.json({ error: 'Repasse não encontrado' }, { status: 404 });
    }

    // Prepara dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      const validStatuses = ['pending', 'paid', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Status inválido. Use: pending, paid ou cancelled' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
      
      // Se marcar como pago, registrar data
      if (body.status === 'paid' && !existingPayout.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    if (body.paymentMethod !== undefined) {
      updateData.paymentMethod = body.paymentMethod || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes || null;
    }

    if (body.referenceId !== undefined) {
      updateData.referenceId = body.referenceId || null;
    }

    // Atualiza repasse no banco
    const [updatedPayout] = await db
      .update(payouts)
      .set(updateData)
      .where(eq(payouts.id, id))
      .returning();

    return NextResponse.json(
      { 
        message: 'Repasse atualizado com sucesso', 
        payout: updatedPayout 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar repasse:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deleta repasse
 * DELETE /api/admin/payouts/[id]
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

    // Busca repasse existente
    const [existingPayout] = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, id))
      .limit(1);

    if (!existingPayout) {
      return NextResponse.json({ error: 'Repasse não encontrado' }, { status: 404 });
    }

    // Não permite deletar repasses já pagos
    if (existingPayout.status === 'paid') {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar repasse já pago',
          suggestion: 'Cancele o repasse em vez de deletá-lo'
        },
        { status: 400 }
      );
    }

    // Deleta repasse
    await db.delete(payouts).where(eq(payouts.id, id));

    return NextResponse.json(
      { message: 'Repasse deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar repasse:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
