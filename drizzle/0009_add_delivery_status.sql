CREATE TYPE "delivery_status" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED');
ALTER TABLE "orders" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'PENDING' NOT NULL;

