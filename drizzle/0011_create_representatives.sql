-- Cria tabela de representantes (incluindo clínicas parceiras)
-- Representantes podem ter múltiplos prescritores/influencers vinculados

CREATE TABLE IF NOT EXISTS "representatives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "country_code" text DEFAULT '+55' NOT NULL,
  "email" text,
  "cpf_cnpj" text,
  "default_commission" numeric(5, 2),
  "entity_type" text DEFAULT 'individual',
  "is_active" boolean DEFAULT true NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS "idx_representatives_active" ON "representatives" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_representatives_entity_type" ON "representatives" ("entity_type");
