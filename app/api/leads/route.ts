import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { isValidProduct } from '@/lib/config/products';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';

/**
 * API Route pública para captura de leads
 * POST /api/leads - Captura novo lead de formulário
 *
 * Endpoints suportados:
 * - Newsletter: name, whatsapp, couponCode
 * - Checkout: name, whatsapp, email, cpfCnpj, phone, address...
 */

/**
 * Captura novo lead de formulário (público)
 * POST /api/leads
 * Body: dados do lead + sourceType obrigatório
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();

    // Extrai IP e User-Agent
    const ipAddress = headersList.get('x-forwarded-for') ||
                     headersList.get('x-real-ip') ||
                     request.ip ||
                     null;

    const userAgent = headersList.get('user-agent') || null;

    // Validação obrigatória: sourceType
    if (!body.sourceType || !['newsletter', 'checkout'].includes(body.sourceType)) {
      return NextResponse.json(
        { error: 'Tipo de origem inválido. Use newsletter ou checkout.' },
        { status: 400 }
      );
    }

    const sourceType = body.sourceType as 'newsletter' | 'checkout';

    // Validações obrigatórias para ambos os tipos
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

    // Valida formato do WhatsApp (básico)
    const whatsappClean = body.whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10 || whatsappClean.length > 13) {
      return NextResponse.json(
        { error: 'WhatsApp inválido' },
        { status: 400 }
      );
    }

    // Validações específicas por tipo
    if (sourceType === 'newsletter') {
      // Newsletter pode ter ou não código de cupom
      if (body.couponCode && typeof body.couponCode !== 'string') {
        return NextResponse.json(
          { error: 'Código do cupom inválido' },
          { status: 400 }
        );
      }
    } else if (sourceType === 'checkout') {
      // Checkout exige email
      if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
        return NextResponse.json(
          { error: 'Email é obrigatório para checkout' },
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

      if (!body.rg || typeof body.rg !== 'string' || body.rg.trim().length < 5) {
        return NextResponse.json(
          { error: 'RG é obrigatório para checkout' },
          { status: 400 }
        );
      }

      if (!body.rgIssuer || typeof body.rgIssuer !== 'string' || body.rgIssuer.trim().length < 2) {
        return NextResponse.json(
          { error: 'Órgão emissor é obrigatório para checkout' },
          { status: 400 }
        );
      }
    }

    // Valida email se fornecido (newsletter opcional)
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Sanitiza itens do carrinho (quando enviados)
    let cartItemsPayload: Array<{ productId: string; quantity: number }> | null = null;
    if (Array.isArray(body.cartItems)) {
      const sanitizedItems = body.cartItems
        .map((item: any) => ({
          productId: typeof item?.productId === 'string' ? item.productId : null,
          quantity: Number(item?.quantity) || 0,
        }))
        .filter((item) => item.productId && item.quantity > 0 && isValidProduct(item.productId));

      if (sanitizedItems.length > 0) {
        cartItemsPayload = sanitizedItems.map((item) => ({
          productId: item.productId as string,
          quantity: Math.min(Math.max(Math.round(item.quantity), 1), 999),
        }));
      }
    }

    // Prepara dados do lead baseado no tipo
    const leadData: any = {
      sourceType,
      name: body.name.trim(),
      whatsapp: whatsappClean,
      email: body.email?.trim() || null,
      cpfCnpj: body.cpfCnpj?.replace(/\D/g, '') || null,
      rg: body.rg?.trim().toUpperCase() || null,
      rgIssuer: body.rgIssuer?.trim().toUpperCase() || null,
      phone: body.phone?.replace(/\D/g, '') || null,
      postalCode: body.postalCode?.replace(/\D/g, '') || null,
      addressNumber: body.addressNumber?.trim() || null,
      addressComplement: body.addressComplement?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      couponCode: body.couponCode?.trim().toUpperCase() || null,
      convertedToSale: false,
      conversionDate: null,
      cartItems: sourceType === 'checkout' ? cartItemsPayload : null,
      ipAddress,
      userAgent,
      utmSource: body.utmSource?.trim() || null,
      utmMedium: body.utmMedium?.trim() || null,
      utmCampaign: body.utmCampaign?.trim() || null,
    };

  
    // Insere lead no banco
    const [createdLead] = await db
      .insert(leads)
      .values(leadData)
      .returning();

  
    return NextResponse.json(
      {
        message: 'Lead capturado com sucesso',
        lead: {
          id: createdLead.id,
          name: createdLead.name,
          sourceType: createdLead.sourceType,
          createdAt: createdLead.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao capturar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Lista leads (endpoint público limitado)
 * GET /api/leads?sourceType=newsletter&limit=10
 *
 * NOTA: Este endpoint é público e limitado para uso em analytics
 * Não retorna dados sensíveis como CPF/endereço completo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType') as 'newsletter' | 'checkout' | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Máximo 100

    // Constrói query base
    let query = db.select({
      id: leads.id,
      sourceType: leads.sourceType,
      name: leads.name,
      whatsapp: leads.whatsapp,
      email: leads.email,
      couponCode: leads.couponCode,
      convertedToSale: leads.convertedToSale,
      conversionDate: leads.conversionDate,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    }).from(leads);

    // Aplica filtro por tipo se especificado
    if (sourceType) {
      query = query.where(eq(leads.sourceType, sourceType));
    }

    // Limita resultados
    const allLeads = await query
      .orderBy(desc(leads.createdAt))
      .limit(limit);

    return NextResponse.json({
      leads: allLeads,
      total: allLeads.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao listar leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}