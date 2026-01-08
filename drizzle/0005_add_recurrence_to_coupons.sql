-- Migration: Adicionar campos de recorrência à tabela de cupons
-- Data: 2025-11-30
-- Descrição: Adiciona suporte a cupons recorrentes para integração com ASAAS subscriptions

-- Adicionar campos de recorrência
ALTER TABLE coupons
ADD COLUMN is_recurring BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN recurring_cycle TEXT DEFAULT 'MONTHLY';

-- Adicionar comentários para documentação
COMMENT ON COLUMN coupons.is_recurring IS 'Indica se o cupom ativa uma assinatura recorrente';
COMMENT ON COLUMN coupons.recurring_cycle IS 'Ciclo de cobrança para recorrência (WEEKLY, MONTHLY, YEARLY) - atualmente apenas MONTHLY implementado';

-- Criar índice para performance em queries de cupons recorrentes
CREATE INDEX idx_coupons_is_recurring ON coupons(is_recurring);

-- Inserir dados de exemplo para teste (opcional - pode ser removido em produção)
INSERT INTO coupons (code, discount_type, discount, description, is_active, is_recurring, recurring_cycle)
VALUES (
  'MENSAL20',
  'percentage',
  20.00,
  'Cupom recorrente mensal com 20% de desconto',
  true,
  true,
  'MONTHLY'
) ON CONFLICT (code) DO NOTHING;