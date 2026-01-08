-- Semeia estoque base para produtos físicos
INSERT INTO "inventory" ("product_id", "quantity", "low_stock_threshold", "updated_at", "last_reconciled_at")
VALUES
  ('duo-dia', 1000, 10, NOW(), NOW()),
  ('duo-noite', 1000, 10, NOW(), NOW())
ON CONFLICT ("product_id")
DO UPDATE SET
  "quantity" = EXCLUDED."quantity",
  "updated_at" = NOW();

