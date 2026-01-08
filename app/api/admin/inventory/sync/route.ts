import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { getInventoryDashboardData } from '@/lib/services/inventory';
import { isPhysicalProduct } from '@/lib/config/products';
import { db } from '@/lib/db';
import { inventory, inventoryTransactions, orders, orderItems } from '@/lib/db/schema';
import { inArray, isNull, and, eq } from 'drizzle-orm';

/**
 * POST /api/admin/inventory/sync
 * Reconciliates inventory by subtracting confirmed orders since the last manual update
 */
type ExpandedItem = { productId: string; quantity: number };

function extractExpandedItems(metadata: any): ExpandedItem[] | null {
  if (metadata && Array.isArray(metadata.expandedItems)) {
    return metadata.expandedItems
      .map((item) => ({
        productId: typeof item?.productId === 'string' ? item.productId : null,
        quantity: Number(item?.quantity) || 0,
      }))
      .filter((item) => item.productId && item.quantity > 0) as ExpandedItem[];
  }
  return null;
}

async function fetchFallbackOrderItems(orderIds: string[]) {
  if (!orderIds.length) return {};
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const map: Record<string, ExpandedItem[]> = {};
  rows.forEach((row) => {
    if (!map[row.orderId]) {
      map[row.orderId] = [];
    }
    map[row.orderId].push({
      productId: row.productId,
      quantity: row.quantity,
    });
  });
  return map;
}

const PAID_ORDER_STATUSES: Array<'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const productId = body?.productId ? String(body.productId) : undefined;

    if (productId && !isPhysicalProduct(productId)) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
    }

    const pendingOrders = await db
      .select({
        id: orders.id,
        metadata: orders.metadata,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(isNull(orders.stockDeductedAt), inArray(orders.status, PAID_ORDER_STATUSES)));

    const ordersWithoutMetadata = pendingOrders
      .filter((order) => !extractExpandedItems(order.metadata))
      .map((order) => order.id);

    const fallbackItems = await fetchFallbackOrderItems(ordersWithoutMetadata);

    const ordersToProcess = pendingOrders
      .map((order) => {
        const rawItems = extractExpandedItems(order.metadata) ?? fallbackItems[order.id] ?? [];
        const items = rawItems.filter((item) => isPhysicalProduct(item.productId));
        return {
          id: order.id,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          items,
        };
      })
      .filter((entry) => entry.items.length > 0)
      .filter((entry) =>
        productId ? entry.items.some((item) => item.productId === productId) : true
      );

    if (ordersToProcess.length === 0) {
      return NextResponse.json({
        message: 'Nenhum pedido elegível para baixa de estoque.',
        updated: [],
        inventory: await getInventoryDashboardData(),
      });
    }

    const deductionsPerProduct: Record<string, number> = {};
    ordersToProcess.forEach((order) => {
      order.items.forEach((item) => {
        deductionsPerProduct[item.productId] =
          (deductionsPerProduct[item.productId] || 0) + item.quantity;
      });
    });

    const productIds = Object.keys(deductionsPerProduct).filter((id) => isPhysicalProduct(id));
    const inventoryRows = await db
      .select()
      .from(inventory)
      .where(inArray(inventory.productId, productIds));
    const inventoryMap = new Map(inventoryRows.map((row) => [row.productId, row]));

    const now = new Date();

    await db.transaction(async (tx) => {
      for (const productId of productIds) {
        const currentRow = inventoryMap.get(productId);
        const currentQuantity = currentRow?.quantity ?? 0;
        const deduction = deductionsPerProduct[productId] || 0;
        const newQuantity = Math.max(currentQuantity - deduction, 0);
        const lowStockThreshold = currentRow?.lowStockThreshold ?? 10;

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

        inventoryMap.set(productId, {
          productId,
          quantity: newQuantity,
          lowStockThreshold,
          lastReconciledAt: now,
          updatedAt: now,
        } as any);
      }

      for (const order of ordersToProcess) {
        for (const item of order.items) {
          await tx.insert(inventoryTransactions).values({
            productId: item.productId,
            type: 'SALE_DEDUCTION' as any,
            quantity: item.quantity,
            note: `Pedido ${order.id}`,
            createdBy: session.userId || 'admin',
            orderId: order.id,
          });
        }

        await tx
          .update(orders)
          .set({ stockDeductedAt: now })
          .where(eq(orders.id, order.id));
      }
    });

    const snapshot = await getInventoryDashboardData();

    return NextResponse.json({
      message: 'Estoque reconciliado com sucesso.',
      updated: productIds.map((id) => ({
        productId: id,
        deductedUnits: deductionsPerProduct[id],
        ordersCount: ordersToProcess.filter((order) =>
          order.items.some((item) => item.productId === id)
        ).length,
        newQuantity:
          Math.max((inventoryMap.get(id)?.quantity ?? 0) - deductionsPerProduct[id], 0),
      })),
      inventory: snapshot,
    });
  } catch (error) {
    console.error('Erro ao reconciliar estoque:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

