import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventory, inventoryTransactions } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { isPhysicalProduct } from '@/lib/config/products';
import { getInventoryDashboardData } from '@/lib/services/inventory';

/**
 * GET /api/admin/inventory
 * Lista todos os produtos com seus níveis de estoque atuais
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token || !await verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await getInventoryDashboardData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * POST /api/admin/inventory
 * Ajuste manual de estoque (Entrada/Saída)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('duo_admin_session')?.value;
    const session = token ? await verifyToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, type, quantity, reason } = body;

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const normalizedType = String(type).toUpperCase();
    if (!['IN', 'OUT'].includes(normalizedType)) {
      return NextResponse.json({ error: 'Tipo de transação inválido' }, { status: 400 });
    }

    if (!isPhysicalProduct(productId)) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
    }

    const now = new Date();

    // Transação atômica
    await db.transaction(async (tx) => {
      // 1. Busca ou Cria registro de inventário
      const [currentInventory] = await tx
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId));

      let newQuantity = currentInventory ? currentInventory.quantity : 0;

      if (normalizedType === 'IN') {
        newQuantity += quantity;
      } else if (normalizedType === 'OUT') {
        newQuantity -= quantity;
      }

      if (newQuantity < 0) {
        newQuantity = 0;
      }

      const lowStockThreshold = currentInventory?.lowStockThreshold ?? 10;

      await tx
        .insert(inventory)
        .values({
          productId,
          quantity: newQuantity,
          lowStockThreshold,
          lastReconciledAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: inventory.productId,
          set: {
            quantity: newQuantity,
            lowStockThreshold,
            lastReconciledAt: now,
            updatedAt: now,
          },
        });

      await tx.insert(inventoryTransactions).values({
        productId,
        type: normalizedType as any,
        quantity,
        note: reason?.trim() || 'Ajuste manual de estoque',
        createdBy: session.userId || 'admin',
      });
    });

    const snapshot = await getInventoryDashboardData();

    return NextResponse.json({ success: true, inventory: snapshot });

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return NextResponse.json({ error: 'Erro ao processar transação' }, { status: 500 });
  }
}

