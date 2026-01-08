
import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixDatabase() {
  try {
    console.log('Fixing database schema...');
    
    // 1. Criar Enum se não existir (PostgreSQL)
    try {
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "delivery_status" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('Enum delivery_status created or already exists.');
    } catch (e) {
        console.error('Error creating enum:', e);
    }

    // 2. Adicionar coluna se não existir
    try {
        await db.execute(sql`
            ALTER TABLE "orders" 
            ADD COLUMN IF NOT EXISTS "delivery_status" "delivery_status" DEFAULT 'PENDING' NOT NULL;
        `);
        console.log('Column delivery_status added.');
    } catch (e) {
        console.error('Error adding column:', e);
    }

    console.log('Fix applied.');

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

fixDatabase();

