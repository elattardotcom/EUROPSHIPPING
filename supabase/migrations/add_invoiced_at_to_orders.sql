-- Add invoice tracking to orders table
-- Run this in the Supabase SQL editor once, before deploying the fee calculation feature

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ DEFAULT NULL;

-- Mark ALL existing completed orders as already invoiced (grandfather clause)
-- This prevents retroactive fee charges on historical orders
UPDATE orders
SET invoiced_at = NOW()
WHERE status IN ('DELIVERED', 'RETURNED')
  AND invoiced_at IS NULL;
