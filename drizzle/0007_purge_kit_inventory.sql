DO $$
BEGIN
  DELETE FROM "inventory_transactions"
  WHERE "product_id" NOT IN ('duo-dia', 'duo-noite');

  DELETE FROM "inventory"
  WHERE "product_id" NOT IN ('duo-dia', 'duo-noite');
END $$;

