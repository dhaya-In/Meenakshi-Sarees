-- ═══════════════════════════════════════════════════════════════════
--  Migration: add delivery_town to orders
--  Run this in Supabase Dashboard → SQL Editor → New query
--  Safe to run even if you already have orders — existing rows are
--  backfilled with 'Chinnalapatti' so the NOT NULL constraint doesn't
--  break on old data (update those rows manually afterward if needed).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add the column as nullable first (so it doesn't fail on existing rows)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_town VARCHAR(50);

-- 2. Backfill any existing orders with a default town
UPDATE orders SET delivery_town = 'Chinnalapatti' WHERE delivery_town IS NULL;

-- 3. Now enforce NOT NULL and the allowed-values check going forward
ALTER TABLE orders ALTER COLUMN delivery_town SET NOT NULL;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_town_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_town_check
  CHECK (delivery_town IN ('Chinnalapatti','Dindigul','Madurai'));
