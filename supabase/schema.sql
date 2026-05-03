-- ─── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id             TEXT PRIMARY KEY,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  phone          TEXT,
  company        TEXT,
  country        TEXT,
  country_code   TEXT,
  plan           TEXT CHECK (plan IN ('starter','pro','enterprise')) DEFAULT 'starter',
  status         TEXT CHECK (status IN ('active','trial','suspended','cancelled')) DEFAULT 'trial',
  joined_at      TEXT,
  monthly_revenue  NUMERIC DEFAULT 0,
  total_revenue    NUMERIC DEFAULT 0,
  stores_count     INTEGER DEFAULT 0,
  orders_count     INTEGER DEFAULT 0,
  leads_count      INTEGER DEFAULT 0,
  last_active      TEXT,
  avatar_color     TEXT,
  password_hash    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balances (
  client_id  TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  amount     NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  client_id    TEXT REFERENCES clients(id) ON DELETE CASCADE,
  client_name  TEXT,
  client_email TEXT,
  amount       NUMERIC NOT NULL,
  currency     TEXT DEFAULT 'EUR',
  iban         TEXT NOT NULL,
  status       TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_note   TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  client_id        TEXT REFERENCES clients(id) ON DELETE CASCADE,
  client_name      TEXT,
  customer_name    TEXT,
  customer_phone   TEXT,
  country          TEXT,
  country_code     TEXT,
  product          TEXT,
  value            NUMERIC DEFAULT 0,
  currency         TEXT DEFAULT 'EUR',
  status           TEXT CHECK (status IN ('PENDING','SHIPPED','DELIVERED','RETURNED','ERROR')) DEFAULT 'PENDING',
  store            TEXT,
  tracking_number  TEXT,
  created_at       TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id               TEXT PRIMARY KEY,
  client_id        TEXT REFERENCES clients(id) ON DELETE CASCADE,
  client_name      TEXT,
  customer_name    TEXT,
  customer_phone   TEXT,
  country          TEXT,
  country_code     TEXT,
  product          TEXT,
  value            NUMERIC DEFAULT 0,
  currency         TEXT DEFAULT 'EUR',
  status           TEXT CHECK (status IN ('CONFIRMED','PENDING','UNREACHED','CANCELED','ERROR')) DEFAULT 'PENDING',
  store            TEXT,
  attempts         INTEGER DEFAULT 0,
  created_at       TEXT
);

CREATE TABLE IF NOT EXISTS stores (
  id           TEXT PRIMARY KEY,
  client_id    TEXT REFERENCES clients(id) ON DELETE CASCADE,
  name         TEXT,
  domain       TEXT,
  status       TEXT CHECK (status IN ('connected','syncing','error')) DEFAULT 'connected',
  country      TEXT,
  orders_today INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  currency     TEXT DEFAULT 'EUR',
  last_sync    TEXT
);

-- ─── Balance adjustments (manual credit / debit by admin) ──────────────────
CREATE TABLE IF NOT EXISTS balance_adjustments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  TEXT        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount     NUMERIC     NOT NULL,  -- positive = credit, negative = debit
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Auth credentials (email + hashed password per client) ─────────────────
CREATE TABLE IF NOT EXISTS auth_credentials (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  TEXT        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email      TEXT        UNIQUE NOT NULL,
  hash       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_credentials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_access" ON clients;
DROP POLICY IF EXISTS "public_access" ON balances;
DROP POLICY IF EXISTS "public_access" ON withdrawals;
DROP POLICY IF EXISTS "public_access" ON orders;
DROP POLICY IF EXISTS "public_access" ON leads;
DROP POLICY IF EXISTS "public_access" ON stores;
DROP POLICY IF EXISTS "public_access" ON auth_credentials;
DROP POLICY IF EXISTS "public_access" ON balance_adjustments;

CREATE POLICY "public_access" ON clients          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON balances         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON withdrawals      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON orders           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON leads            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON stores           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON auth_credentials   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON balance_adjustments FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── Realtime ────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE balances;
