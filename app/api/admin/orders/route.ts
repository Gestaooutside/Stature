import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import {
  count,
  desc,
  eq,
  and,
  inArray,
  gte,
  lte,
  ilike,
  sum,
} from 'drizzle-orm';

const PAID_ORDER_STATUSES: Array<'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];
const PAID_PAYMENT_STATUSES: Array<'RECEIVED' | 'CONFIRMED'> = ['RECEIVED', 'CONFIRMED'];

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const deliveryStatusFilter = searchParams.get('deliveryStatus');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const billingTypeFilter = searchParams.get('billingType');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 200);
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('search')?.trim();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const filters = [];
    if (statusFilter) {
      filters.push(eq(orders.status, statusFilter as typeof orders.$inferSelect.status));
    }
    if (deliveryStatusFilter) {
      filters.push(eq(orders.deliveryStatus, deliveryStatusFilter as typeof orders.$inferSelect.deliveryStatus));
    }
    if (billingTypeFilter) {
      filters.push(eq(orders.billingType, billingTypeFilter));
    }
    if (paymentStatusFilter) {
      filters.push(eq(orders.status, paymentStatusFilter as typeof orders.$inferSelect.status));
    }
    if (startDateParam) {
      const startDate = new Date(startDateParam);
      if (!isNaN(startDate.getTime())) {
        filters.push(gte(orders.createdAt, startDate));
      }
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam);
      if (!isNaN(endDate.getTime())) {
        // Ajusta para o final do dia
        endDate.setHours(23, 59, 59, 999);
        filters.push(lte(orders.createdAt, endDate));
      }
    }
    if (search) {
      filters.push(ilike(orders.id, `%${search}%`));
    }

    const whereClause =
      filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters);

    const ordersQuery = db
      .select({
        id: orders.id,
        status: orders.status,
        deliveryStatus: orders.deliveryStatus,
        total: orders.total,
        billingType: orders.billingType,
        createdAt: orders.createdAt,
        metadata: orders.metadata,
        stockDeductedAt: orders.stockDeductedAt,
        paymentStatus: payments.status,
        paymentValue: payments.value,
        paymentDueDate: payments.dueDate,
        paymentPaidAt: payments.paidAt,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id));

    const baseCountQuery = db.select({ count: count() }).from(orders);

    const [ordersList, totalCountResult, awaitingResult, paidResult, revenueResult] = await Promise.all([
      whereClause
        ? ordersQuery.where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset)
        : ordersQuery.orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      whereClause ? baseCountQuery.where(whereClause) : baseCountQuery,
      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.status, 'AWAITING_PAYMENT')),
      db
        .select({ count: count() })
        .from(orders)
        .where(inArray(orders.status, PAID_ORDER_STATUSES)),
      db
        .select({
          value: sum(orders.total),
        })
        .from(orders)
        .leftJoin(payments, eq(payments.orderId, orders.id))
        .where(
          and(
            gte(orders.createdAt, startOfMonth),
            inArray(orders.status, PAID_ORDER_STATUSES)
          )
        ),
    ]);

    const totalCount = Number(totalCountResult[0]?.count || 0);
    const awaiting = Number(awaitingResult[0]?.count || 0);
    const paid = Number(paidResult[0]?.count || 0);
    const revenue = toNumber(revenueResult[0]?.value ?? 0);

    return NextResponse.json({
      summary: {
        awaiting,
        paid,
        revenueMonth: revenue,
      },
      orders: ordersList.map((order) => ({
        ...order,
        total: toNumber(order.total),
        paymentValue: toNumber(order.paymentValue),
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

