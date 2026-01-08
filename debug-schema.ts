
import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkTable() {
  try {
    console.log('Checking table structure...');
    
    // Query para listar colunas da tabela orders (PostgreSQL)
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);

    console.log('Columns in "orders" table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });

  } catch (error) {
    console.error('Error checking table:', error);
  }
}

checkTable();

