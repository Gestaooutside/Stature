-- Cria tabela de repasses/pagamentos de comissões
-- Gerencia histórico de pagamentos para prescritores e representantes

CREATE TABLE IF NOT EXISTS "payouts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  
  -- Entidade que recebe o repasse
  "entity_type" text NOT NULL CHECK ("entity_type" IN ('prescriber', 'representative')),
  "entity_id" uuid NOT NULL,
  
  -- Valores financeiros
  "amount" numeric(12, 2) NOT NULL CHECK ("amount" > 0),
  
  -- Período coberto pelo repasse
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  
  -- Status do repasse
  "status" text DEFAULT 'pending' NOT NULL CHECK ("status" IN ('pending', 'paid', 'cancelled')),
  
  -- Data de pagamento
  "paid_at" timestamp,
  
  -- Método de pagamento
  "payment_method" text CHECK ("payment_method" IN ('pix', 'transfer', 'cash', 'check', 'other')),
  
  -- Observações e referências
  "notes" text,
  "reference_id" text,
  
  -- Auditoria
  "created_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT "payouts_period_valid" CHECK ("period_end" >= "period_start"),
  CONSTRAINT "payouts_paid_status_requires_date" 
    CHECK (
      ("status" = 'paid' AND "paid_at" IS NOT NULL) OR 
      ("status" != 'paid')
    )
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS "idx_payouts_entity" ON "payouts" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_payouts_status" ON "payouts" ("status");
CREATE INDEX IF NOT EXISTS "idx_payouts_period" ON "payouts" ("period_start", "period_end");
CREATE INDEX IF NOT EXISTS "idx_payouts_paid_at" ON "payouts" ("paid_at");
