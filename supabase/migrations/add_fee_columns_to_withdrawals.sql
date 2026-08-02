-- Store fee breakdown on each withdrawal for invoice PDF and audit
ALTER TABLE withdrawals
  ADD COLUMN IF NOT EXISTS gross_amount     NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_delivery     NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_return       NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_call_center  NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_total        NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivered_count  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS returned_count   INTEGER DEFAULT 0;
