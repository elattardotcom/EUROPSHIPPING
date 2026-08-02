-- Fee rates per country (configurable by admin)
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS fee_rates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code    TEXT NOT NULL UNIQUE,  -- 'ES', 'IT', 'MA', etc. or 'DEFAULT'
  country_name    TEXT NOT NULL,
  delivery_fee    NUMERIC(10,2) NOT NULL DEFAULT 3.00,
  return_fee      NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  call_center_fee NUMERIC(10,2) NOT NULL DEFAULT 0.50,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate common countries
INSERT INTO fee_rates (country_code, country_name, delivery_fee, return_fee, call_center_fee) VALUES
  ('DEFAULT', 'Par défaut (fallback)',     3.00, 2.00, 0.50),
  ('ES',      'Espagne',                   3.50, 2.50, 0.50),
  ('IT',      'Italie',                    3.50, 2.50, 0.50),
  ('PT',      'Portugal',                  3.00, 2.00, 0.50),
  ('FR',      'France',                    4.00, 3.00, 0.50),
  ('MA',      'Maroc',                     2.50, 1.50, 0.30),
  ('BE',      'Belgique',                  4.00, 2.50, 0.50),
  ('NL',      'Pays-Bas',                  4.00, 2.50, 0.50),
  ('DE',      'Allemagne',                 4.50, 3.00, 0.50),
  ('GB',      'Royaume-Uni',               5.00, 3.50, 0.50)
ON CONFLICT (country_code) DO NOTHING;
