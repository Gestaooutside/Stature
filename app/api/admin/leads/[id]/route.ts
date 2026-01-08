import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

/**
 * API Route para gerenciamento individual de leads (Admin)
 * PATCH /api/admin/leads/[id] - Atualiza lead
 * DELETE /api/admin/leads/[id] - Deleta lead
 *
 * Protegido por autenticação JWT
 */

/**
 * Atualiza lead existente
 * PATCH /api/admin/leads/[id]
 * Body: campos a serem atualizados (status, conversionDate, etc.)
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

    // Busca lead existente
    const [existingLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    // Prepara dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Atualiza campos permitidos
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json(
          { error: 'Nome inválido' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.whatsapp !== undefined) {
      const whatsappClean = body.whatsapp.replace(/\D/g, '');
      if (whatsappClean.length < 10 || whatsappClean.length > 13) {
        return NextResponse.json(
          { error: 'WhatsApp inválido' },
          { status: 400 }
        );
      }
      updateData.whatsapp = whatsappClean;
    }

    if (body.email !== undefined) {
      if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        );
      }
      updateData.email = body.email || null;
    }

    if (body.cpfCnpj !== undefined) {
      updateData.cpfCnpj = body.cpfCnpj?.replace(/\D/g, '') || null;
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.replace(/\D/g, '') || null;
    }

    if (body.postalCode !== undefined) {
      updateData.postalCode = body.postalCode?.replace(/\D/g, '') || null;
    }

    if (body.addressNumber !== undefined) {
      updateData.addressNumber = body.addressNumber || null;
    }

    if (body.addressComplement !== undefined) {
      updateData.addressComplement = body.addressComplement || null;
    }

    if (body.address !== undefined) {
      updateData.address = body.address || null;
    }

    if (body.city !== undefined) {
      updateData.city = body.city || null;
    }

    if (body.state !== undefined) {
      updateData.state = body.state || null;
    }

    if (body.couponCode !== undefined) {
      updateData.couponCode = body.couponCode || null;
    }

    if (body.convertedToSale !== undefined) {
      const wasConverted = existingLead.convertedToSale;
      const isNowConverted = Boolean(body.convertedToSale);

      updateData.convertedToSale = isNowConverted;

      // Se acabou de converter e antes não estava convertido, adiciona data de conversão
      if (!wasConverted && isNowConverted) {
        updateData.conversionDate = new Date();
      } else if (wasConverted && !isNowConverted) {
        updateData.conversionDate = null;
      }
    }

    if (body.ipAddress !== undefined) {
      updateData.ipAddress = body.ipAddress || null;
    }

    if (body.userAgent !== undefined) {
      updateData.userAgent = body.userAgent || null;
    }

    if (body.utmSource !== undefined) {
      updateData.utmSource = body.utmSource || null;
    }

    if (body.utmMedium !== undefined) {
      updateData.utmMedium = body.utmMedium || null;
    }

    if (body.utmCampaign !== undefined) {
      updateData.utmCampaign = body.utmCampaign || null;
    }

    // Atualiza lead no banco
    const [updatedLead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();

    return NextResponse.json(
      { message: 'Lead atualizado com sucesso', lead: updatedLead },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deleta lead
 * DELETE /api/admin/leads/[id]
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

    // Busca lead existente
    const [existingLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    // Deleta lead
    await db.delete(leads).where(eq(leads.id, id));

    return NextResponse.json(
      { message: 'Lead deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}