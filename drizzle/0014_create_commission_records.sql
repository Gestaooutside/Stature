-- Cria tabela de registros de comissões
-- Armazena histórico de todas as comissões geradas por vendas com cupons

CREATE TABLE IF NOT EXISTS "commission_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "coupon_id" uuid,
  
  -- Dados do prescritor
  "prescriber_id" uuid,
  "prescriber_commission_rate" numeric(5, 2),
  "prescriber_commission_amount" numeric(12, 2),
  
  -- Dados do representante
  "representative_id" uuid,
  "representative_commission_rate" numeric(5, 2),
  "representative_commission_amount" numeric(12, 2),
  
  -- Valor base da venda
  "sale_amount" numeric(12, 2) NOT NULL,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  
  CONSTRAINT "commission_records_order_id_fkey" 
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
  CONSTRAINT "commission_records_coupon_id_fkey" 
    FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL,
  CONSTRAINT "commission_records_prescriber_id_fkey" 
    FOREIGN KEY ("prescriber_id") REFERENCES "prescribers"("id") ON DELETE SET NULL,
  CONSTRAINT "commission_records_representative_id_fkey" 
    FOREIGN KEY ("representative_id") REFERENCES "representatives"("id") ON DELETE SET NULL
);

-- Índices para otimização de queries de relatórios
CREATE INDEX IF NOT EXISTS "idx_commission_prescriber" ON "commission_records" ("prescriber_id");
CREATE INDEX IF NOT EXISTS "idx_commission_representative" ON "commission_records" ("representative_id");
CREATE INDEX IF NOT EXISTS "idx_commission_order" ON "commission_records" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_commission_created_at" ON "commission_records" ("created_at");
