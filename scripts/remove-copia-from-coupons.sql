-- Script para remover "(cópia)" das descrições de cupons
-- Executar este script no banco de dados para limpar as descrições

-- Atualiza descrições removendo "(cópia)" do final
UPDATE coupons
SET description =
    CASE
        WHEN description LIKE '%(cópia)' THEN
            -- Remove "(cópia)" do final e espaços extras
            TRIM(TRAILING ' ' FROM REGEXP_REPLACE(description, '\s*\(cópia\)\s*$', ''))
        WHEN description LIKE '%(cópia)%' THEN
            -- Remove "(cópia)" do meio da descrição
            REPLACE(description, '(cópia)', '')
        ELSE
            description
    END
WHERE description LIKE '%(cópia)%';

-- Verifica quantos registros foram afetados
SELECT COUNT(*) as cupons_atualizados
FROM coupons
WHERE description LIKE '%(cópia)%' OR (
    old_description IS NOT NULL AND
    old_description != description
);

-- Opcional: Mostra as descrições antes e depois (para verificação)
-- SELECT
--     id,
--     code,
--     description as nova_descricao
-- FROM coupons
-- WHERE description LIKE '%(cópia)%' OR (
--     old_description IS NOT NULL AND
--     old_description != description
-- )
-- ORDER BY id;