-- Per-country fee breakdown, stored at withdrawal creation time (alongside
-- the existing aggregate gross_amount/fee_delivery/... columns) so historical
-- invoices stay accurate even if fee rates change later.
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS country_breakdown JSONB;
