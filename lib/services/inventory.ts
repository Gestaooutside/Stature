import { db } from '@/lib/db';
import { inventory, inventoryTransactions, orders, orderItems } from '@/lib/db/schema';
import { PHYSICAL_PRODUCTS, PHYSICAL_PRODUCT_IDS, PRODUCTS } from '@/lib/config/products';
import { desc, eq, and, gte, inArray, isNull } from 'drizzle-orm';

export interface InventoryBaseItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  lastReconciledAt: Date | null;
  updatedAt: Date | null;
}

export interface PendingSalesStats {
  units: number;
  orders: number;
  lastOrderDate: Date | null;
}

export interface InventoryDashboardItem {
  productId: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  lastReconciledAt: Date | null;
  updatedAt: Date | null;
  projectedStock: number;
  status: 'LOW' | 'OK';
  pendingSales: PendingSalesStats;
}

export interface InventoryTransactionEntry {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: Date;
  createdBy: string | null;
  productName: string;
}

/**
 * Retorna lista base de produtos fundindo catálogo oficial com registros do banco
 */
export async function fetchInventoryBaseItems(): Promise<InventoryBaseItem[]> {
  const inventoryRows = await db
    .select()
    .from(inventory)
    .where(inArray(inventory.productId, PHYSICAL_PRODUCT_IDS));

  return PHYSICAL_PRODUCTS.map((product) => {
    const row = inventoryRows.find((item) => item.productId === product.id);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: row?.quantity ?? 0,
      lowStockThreshold: row?.lowStockThreshold ?? 10,
      lastReconciledAt: row?.lastReconciledAt ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

/**
 * Calcula pedidos pendentes desde a última reconciliação manual
 */
const PAID_ORDER_STATUSES: Array<InventoryDashboardItem['status'] | 'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];

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

async function fetchFallbackOrderItems(orderIds: string[]): Promise<Record<string, ExpandedItem[]>> {
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

export async function buildPendingSalesMap(
  baseItems: InventoryBaseItem[]
): Promise<Record<string, PendingSalesStats>> {
  if (baseItems.length === 0) {
    return {};
  }

  const baseMap = new Map(baseItems.map((item) => [item.productId, item]));
  const lastReconcilePerProduct = new Map(
    baseItems.map((item) => [item.productId, item.lastReconciledAt ?? null])
  );

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

  const pendingMap: Record<string, PendingSalesStats> = {};
  const orderTracker: Record<string, Set<string>> = {};

  for (const order of pendingOrders) {
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const expandedItems = extractExpandedItems(order.metadata) ?? fallbackItems[order.id] ?? [];

    for (const item of expandedItems) {
      const productId = item.productId;
      if (!baseMap.has(productId)) continue;

      const cutoff = lastReconcilePerProduct.get(productId);
      if (cutoff && orderDate <= cutoff) {
        continue;
      }

      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) continue;

      if (!pendingMap[productId]) {
        pendingMap[productId] = {
          units: 0,
          orders: 0,
          lastOrderDate: null,
        };
        orderTracker[productId] = new Set();
      }

      pendingMap[productId]!.units += quantity;
      orderTracker[productId]!.add(order.id);

      if (
        !pendingMap[productId]!.lastOrderDate ||
        orderDate > (pendingMap[productId]!.lastOrderDate as Date)
      ) {
        pendingMap[productId]!.lastOrderDate = orderDate;
      }
    }
  }

  Object.keys(pendingMap).forEach((productId) => {
    pendingMap[productId]!.orders = orderTracker[productId]?.size ?? 0;
  });

  return pendingMap;
}

/**
 * Busca histórico recente de transações de estoque
 */
export async function getRecentInventoryTransactions(limit = 20): Promise<InventoryTransactionEntry[]> {
  const transactions = await db
    .select()
    .from(inventoryTransactions)
    .orderBy(desc(inventoryTransactions.createdAt))
    .limit(limit);

  return transactions.map((tx) => ({
    ...tx,
    productName: PRODUCTS.find((product) => product.id === tx.productId)?.name ?? tx.productId,
  }));
}

/**
 * Constrói snapshot completo do dashboard de estoque
 */
export async function getInventoryDashboardData(): Promise<{
  items: InventoryDashboardItem[];
  transactions: InventoryTransactionEntry[];
}> {
  const baseItems = await fetchInventoryBaseItems();
  const pendingMap = await buildPendingSalesMap(baseItems);

  const items: InventoryDashboardItem[] = baseItems.map((item) => {
    const pending = pendingMap[item.productId] || {
      units: 0,
      orders: 0,
      lastOrderDate: null,
    };

    const projectedStock = Math.max(item.quantity - pending.units, 0);
    const status = projectedStock <= item.lowStockThreshold ? 'LOW' : 'OK';

    return {
      productId: item.productId,
      name: item.name,
      price: item.price,
      stock: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      lastReconciledAt: item.lastReconciledAt,
      updatedAt: item.updatedAt,
      projectedStock,
      status,
      pendingSales: pending,
    };
  });

  const transactions = await getRecentInventoryTransactions();

  return { items, transactions };
}

