import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, orders, payments } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/session';
import { sql, desc, gte, and, inArray, eq } from 'drizzle-orm';
import { count } from 'drizzle-orm';

/**
 * GET /api/admin/dashboard
 * Retorna métricas consolidadas para o dashboard administrativo
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const token = request.cookies.get('duo_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const paidOrderStatuses: Array<'PAID' | 'CONFIRMED'> = ['PAID', 'CONFIRMED'];
    const paidPaymentStatuses: Array<'RECEIVED' | 'CONFIRMED'> = ['RECEIVED', 'CONFIRMED'];

    const baseOrderCount = db.select({ count: count() }).from(orders);
    const totalLeadsPromise = db.select({ count: count() }).from(leads);
    const totalOrdersPromise = baseOrderCount;
    const paidOrdersPromise = db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, paidOrderStatuses));
    const awaitingOrdersPromise = db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'AWAITING_PAYMENT'));
    const ordersTodayPromise = db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.createdAt, startOfToday));

    const revenueMonthPromise = db.execute(sql`
      SELECT COALESCE(SUM(p.value), 0) AS total
      FROM payments p
      WHERE p.status IN ('RECEIVED','CONFIRMED')
        AND COALESCE(p.paid_at, p.updated_at) >= ${startOfMonth}
    `);

    const revenueTodayPromise = db.execute(sql`
      SELECT COALESCE(SUM(p.value), 0) AS total
      FROM payments p
      WHERE p.status IN ('RECEIVED','CONFIRMED')
        AND COALESCE(p.paid_at, p.updated_at) >= ${startOfToday}
    `);

    const chartQuery = db.execute(sql`
      SELECT
        to_char(o.created_at, 'YYYY-MM-DD') AS date,
        count(*) AS orders,
        count(*) FILTER (WHERE o.status IN ('PAID','CONFIRMED')) AS paid_orders,
        COALESCE(sum(CASE WHEN o.status IN ('PAID','CONFIRMED') THEN o.total::numeric ELSE 0 END), 0) AS revenue
      FROM orders o
      WHERE o.created_at >= ${thirtyDaysAgo}
      GROUP BY 1
      ORDER BY 1
    `);

    const recentOrdersQuery = db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        billingType: orders.billingType,
        createdAt: orders.createdAt,
        metadata: orders.metadata,
        paymentStatus: payments.status,
        paymentValue: payments.value,
        paymentPaidAt: payments.paidAt,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const [
      totalLeadsResult,
      totalOrdersResult,
      paidOrdersResult,
      awaitingOrdersResult,
      ordersTodayResult,
      revenueMonthResult,
      revenueTodayResult,
      chartDataResult,
      recentOrders,
    ] = await Promise.all([
      totalLeadsPromise,
      totalOrdersPromise,
      paidOrdersPromise,
      awaitingOrdersPromise,
      ordersTodayPromise,
      revenueMonthPromise,
      revenueTodayPromise,
      chartQuery,
      recentOrdersQuery,
    ]);

    const totalLeads = Number(totalLeadsResult[0]?.count || 0);
    const totalOrders = Number(totalOrdersResult[0]?.count || 0);
    const paidOrders = Number(paidOrdersResult[0]?.count || 0);
    const awaitingOrders = Number(awaitingOrdersResult[0]?.count || 0);
    const ordersToday = Number(ordersTodayResult[0]?.count || 0);
    const revenueMonth = Number(revenueMonthResult.rows?.[0]?.total || 0);
    const revenueToday = Number(revenueTodayResult.rows?.[0]?.total || 0);

    const conversionRate =
      totalLeads > 0 ? ((paidOrders / totalLeads) * 100).toFixed(1) : '0.0';
    const ticketAverage = paidOrders > 0 ? revenueMonth / paidOrders : 0;

    const chartData = chartDataResult.rows.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      orders: Number(row.orders),
      paidOrders: Number(row.paid_orders),
      revenue: Number(row.revenue),
    }));

    return NextResponse.json({
      summary: {
        totalOrders,
        paidOrders,
        awaitingOrders,
        ordersToday,
        revenueMonth,
        revenueToday,
        conversionRate,
        ticketAverage,
      },
      chartData,
      recentOrders: recentOrders.map((order) => ({
        ...order,
        total: Number(order.total),
        paymentValue: order.paymentValue ? Number(order.paymentValue) : null,
      })),
    });

  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

