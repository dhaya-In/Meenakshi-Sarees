-- ═══════════════════════════════════════════════════════════════════
--  Migration 002: Professional checkout — full shipping address,
--  free UPI payment fields, and removal of the town-restriction system.
--
--  Run this in Supabase Dashboard → SQL Editor → New query.
--  Safe to run on a database that already has orders from before —
--  existing rows are backfilled so nothing breaks.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Drop the old town-restriction constraint and column from
--    migration-001 — checkout now accepts shipping addresses from
--    anywhere in Tamil Nadu / India, not just 3 fixed towns.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_town_check;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_town;

-- 2. Add the full shipping address fields.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name    VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email   VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number     VARCHAR(15);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name     VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_line_1   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_line_2   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city             VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state            VARCHAR(100) DEFAULT 'Tamil Nadu';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code      VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country          VARCHAR(100) DEFAULT 'India';

-- 3. Add free-UPI-specific fields.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status   VARCHAR(30) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_number       VARCHAR(50);

-- 4. Backfill required-but-new columns on any pre-existing orders, using
--    the old delivery_address text as a fallback so nothing is left NULL
--    where a NOT NULL constraint is about to be applied.
UPDATE orders
SET
  customer_name  = COALESCE(customer_name, 'Unknown'),
  phone_number   = COALESCE(phone_number, '0000000000'),
  address_line_1 = COALESCE(address_line_1, delivery_address, 'Not provided'),
  city           = COALESCE(city, 'Not provided'),
  postal_code    = COALESCE(postal_code, '000000')
WHERE customer_name IS NULL OR address_line_1 IS NULL;

-- 5. Now that old rows are backfilled, enforce NOT NULL on the fields
--    the new checkout form always requires going forward.
ALTER TABLE orders ALTER COLUMN customer_name  SET NOT NULL;
ALTER TABLE orders ALTER COLUMN phone_number   SET NOT NULL;
ALTER TABLE orders ALTER COLUMN address_line_1 SET NOT NULL;
ALTER TABLE orders ALTER COLUMN city           SET NOT NULL;
ALTER TABLE orders ALTER COLUMN postal_code    SET NOT NULL;

-- 6. payment_method now only allows 'cod' or 'upi' (Card is removed per
--    the new spec). Existing 'card' orders, if any, are remapped to 'upi'
--    so the constraint doesn't reject historical data.
UPDATE orders SET payment_method = 'upi' WHERE payment_method = 'card';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'upi'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'cash_on_delivery', 'failed'));

-- 7. Index for admin order lookups by email/phone (support/customer service).
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number   ON orders(phone_number);
