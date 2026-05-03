-- ─── Ajouts Shopify ──────────────────────────────────────────────────────────
-- Ajoute access_token à la table stores existante
ALTER TABLE stores ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_scope TEXT;

-- Table produits Shopify synchronisés
CREATE TABLE IF NOT EXISTS products (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           TEXT        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_id         TEXT        NOT NULL,
  title              TEXT        NOT NULL,
  image_url          TEXT,
  price              NUMERIC     DEFAULT 0,
  currency           TEXT        DEFAULT 'EUR',
  presentment_prices JSONB       DEFAULT '[]',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, shopify_id)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_access" ON products;
CREATE POLICY "public_access" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

-- Realtime pour sync en direct
ALTER PUBLICATION supabase_realtime ADD TABLE products;
