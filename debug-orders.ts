
import { db } from './lib/db';
import { orders } from './lib/db/schema';
import { desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkOrders() {
  try {
    console.log('Querying orders...');
    const result = await db
      .select({
        id: orders.id,
        status: orders.status,
        deliveryStatus: orders.deliveryStatus,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    console.log('Orders found:', result.length);
    console.log('First order:', result[0]);
  } catch (error) {
    console.error('Error querying orders:', error);
  }
}

checkOrders();

