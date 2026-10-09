-- ============================================================================
-- OPERATIONAL CONTROL CENTER — Phase 6: order status history
-- ============================================================================
-- Recorded going forward only, from the moment this migration is applied.
-- Existing orders have no retroactive history — the order detail page says
-- so plainly rather than fabricating a timeline for them.
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    TEXT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT        NOT NULL,
  changed_by  TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose — only the service-role key
-- (server-side only) may read or write this table.
DROP POLICY IF EXISTS "public_access" ON order_status_history;
