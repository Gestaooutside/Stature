-- Migração de dados existentes e atualização da estrutura de cupons
-- Converte campo prescriber (texto) para prescriber_id (UUID com FK)

-- 1. Adicionar novas colunas aos cupons
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "prescriber_id" uuid;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "prescriber_commission_override" numeric(5, 2);
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "representative_commission_override" numeric(5, 2);

-- 2. Migrar dados existentes: criar prescritores para cupons que têm o campo prescriber preenchido
DO $$
DECLARE
  coupon_record RECORD;
  new_prescriber_id uuid;
BEGIN
  -- Iterar sobre cupons que têm prescritor (campo texto)
  FOR coupon_record IN 
    SELECT id, prescriber, commission 
    FROM coupons 
    WHERE prescriber IS NOT NULL AND prescriber != ''
  LOOP
    -- Verificar se já existe um prescritor com esse nome
    SELECT id INTO new_prescriber_id 
    FROM prescribers 
    WHERE name = coupon_record.prescriber 
    LIMIT 1;
    
    -- Se não existe, criar novo prescritor
    IF new_prescriber_id IS NULL THEN
      INSERT INTO prescribers (name, phone, default_commission, is_active, notes)
      VALUES (
        coupon_record.prescriber,
        '+5500000000000', -- Placeholder - admin deve atualizar
        coupon_record.commission, -- Migra comissão antiga
        true,
        'Migrado automaticamente do sistema antigo - atualizar dados'
      )
      RETURNING id INTO new_prescriber_id;
    END IF;
    
    -- Atualizar cupom com o ID do prescritor
    UPDATE coupons 
    SET prescriber_id = new_prescriber_id,
        prescriber_commission_override = coupon_record.commission
    WHERE id = coupon_record.id;
  END LOOP;
END $$;

-- 3. Adicionar índice para FK
CREATE INDEX IF NOT EXISTS "idx_coupons_prescriber" ON "coupons" ("prescriber_id");

-- 4. Adicionar constraint de FK
ALTER TABLE "coupons" 
  ADD CONSTRAINT "coupons_prescriber_id_fkey" 
  FOREIGN KEY ("prescriber_id") 
  REFERENCES "prescribers"("id") 
  ON DELETE SET NULL;

-- 5. Remover colunas antigas (comentado para segurança - descomentar após validação)
-- ALTER TABLE "coupons" DROP COLUMN IF EXISTS "prescriber";
-- ALTER TABLE "coupons" DROP COLUMN IF EXISTS "commission";
