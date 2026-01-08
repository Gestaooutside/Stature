-- Cria tabela de prescritores/influencers
-- Prescritores podem estar vinculados a um representante e possuem múltiplos cupons

CREATE TABLE IF NOT EXISTS "prescribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "country_code" text DEFAULT '+55' NOT NULL,
  "email" text,
  "cpf_cnpj" text,
  "representative_id" uuid,
  "default_commission" numeric(5, 2),
  "is_active" boolean DEFAULT true NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "prescribers_representative_id_fkey" FOREIGN KEY ("representative_id") 
    REFERENCES "representatives"("id") ON DELETE SET NULL
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS "idx_prescribers_representative" ON "prescribers" ("representative_id");
CREATE INDEX IF NOT EXISTS "idx_prescribers_active" ON "prescribers" ("is_active");
