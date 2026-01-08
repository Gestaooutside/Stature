-- Adiciona campos de metadados aos pedidos para rastreamento de cupons e assinaturas

-- Adicionar campo JSON para metadados estruturados
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "metadata_json" jsonb;

-- Adicionar campos para assinaturas recorrentes
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_recurring" boolean DEFAULT false NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subscription_id" text;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS "idx_orders_metadata" ON "orders" USING GIN ("metadata_json");
CREATE INDEX IF NOT EXISTS "idx_orders_recurring" ON "orders" ("is_recurring");
CREATE INDEX IF NOT EXISTS "idx_orders_subscription" ON "orders" ("subscription_id");
