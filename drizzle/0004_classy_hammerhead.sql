CREATE TYPE "public"."transaction_type" AS ENUM('IN', 'OUT', 'ADJUSTMENT', 'SALE_DEDUCTION');
--> statement-breakpoint
CREATE TABLE "inventory" (
	"product_id" text PRIMARY KEY NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"last_reconciled_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "cart_items" jsonb;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_inventory_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."inventory"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
