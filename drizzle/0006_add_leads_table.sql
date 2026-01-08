-- Criar enum para tipo de origem do lead
CREATE TYPE source_type AS ENUM ('newsletter', 'checkout');

-- Criar tabela de leads para capturar dados dos formulários
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" source_type NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"cpf_cnpj" text,
	"phone" text,
	"postal_code" text,
	"address_number" text,
	"address_complement" text,
	"address" text,
	"city" text,
	"state" text,
	"coupon_code" text,
	"converted_to_sale" boolean DEFAULT false NOT NULL,
	"conversion_date" timestamp,
	"ip_address" text,
	"user_agent" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX "leads_source_type_idx" ON "leads" ("source_type");
CREATE INDEX "leads_created_at_idx" ON "leads" ("created_at");
CREATE INDEX "leads_converted_to_sale_idx" ON "leads" ("converted_to_sale");
CREATE INDEX "leads_coupon_code_idx" ON "leads" ("coupon_code");

-- Adicionar comentário na tabela
COMMENT ON TABLE "leads" IS 'Tabela para armazenar leads capturados dos formulários de newsletter e checkout';