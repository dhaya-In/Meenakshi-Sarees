-- ═══════════════════════════════════════════════════════════════════
--  Meenakshi Sarees — Supabase PostgreSQL Schema
--  Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  phone       VARCHAR(15),
  role        VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         VARCHAR(50) PRIMARY KEY,
  label      VARCHAR(100) NOT NULL,
  icon       VARCHAR(10)  DEFAULT '✨',
  color      VARCHAR(100) DEFAULT 'bg-rose-100 text-rose',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(200) NOT NULL,
  category_id    VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  fabric         VARCHAR(100),
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  occasion       VARCHAR(100),
  color          VARCHAR(100),
  description    TEXT,
  image_url      TEXT,
  badge          VARCHAR(50),
  in_stock       BOOLEAN DEFAULT TRUE,
  rating         DECIMAL(3,1) DEFAULT 0,
  review_count   INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  verified    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)     -- one review per user per product
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Shipping contact & address — ships anywhere in Tamil Nadu / India,
  -- not restricted to specific towns.
  customer_name    VARCHAR(150) NOT NULL,
  customer_email   VARCHAR(255),
  phone_number     VARCHAR(15) NOT NULL,
  company_name     VARCHAR(150),
  address_line_1   TEXT NOT NULL,
  address_line_2   TEXT,
  city             VARCHAR(100) NOT NULL,
  state            VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  postal_code      VARCHAR(10) NOT NULL,
  country          VARCHAR(100) NOT NULL DEFAULT 'India',

  -- Payment — free UPI deep-link/QR or Cash on Delivery only.
  payment_method   VARCHAR(20) NOT NULL CHECK (payment_method IN ('cod','upi')),
  payment_status   VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','paid','cash_on_delivery','failed')),
  utr_number       VARCHAR(50),

  total_amount     DECIMAL(10,2) NOT NULL,
  status           VARCHAR(30) DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number   ON orders(phone_number);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  qty         INTEGER NOT NULL CHECK (qty > 0),
  unit_price  DECIMAL(10,2) NOT NULL
);

-- ── Appointments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  name           VARCHAR(100) NOT NULL,
  phone          VARCHAR(15) NOT NULL,
  service        VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  notes          TEXT,
  status         VARCHAR(30) DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enquiries ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(15) NOT NULL,
  email      VARCHAR(255),
  message    TEXT NOT NULL,
  status     VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new','read','replied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for performance ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock    ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_reviews_product      ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_enquiries_status     ON enquiries(status);

-- ── Seed default categories ───────────────────────────────────────────────────
INSERT INTO categories (id, label, icon, color) VALUES
  ('silk',     'Silk',     '✨', 'bg-rose-100 text-rose'),
  ('cotton',   'Cotton',   '🌿', 'bg-green-50 text-green-700'),
  ('designer', 'Designer', '💎', 'bg-purple-50 text-purple-700'),
  ('bridal',   'Bridal',   '👑', 'bg-gold-50 text-gold-dark'),
  ('festival', 'Festival', '🪔', 'bg-orange-50 text-orange-700')
ON CONFLICT (id) DO NOTHING;

-- ── Default admin account (change password after first login!) ────────────────
-- Password hash below = "admin123" — CHANGE IN PRODUCTION
INSERT INTO users (id, name, email, password, role) VALUES (
  uuid_generate_v4(),
  'Admin',
  'admin@meenakshisarees.in',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCB5nzHw/9Q7.Jxl8iOVEsi',
  'admin'
) ON CONFLICT (email) DO NOTHING;
