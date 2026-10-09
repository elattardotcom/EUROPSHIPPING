-- ============================================================================
-- ENTERPRISE OPERATIONS COMMAND CENTER — Step 1: operational exceptions
-- ============================================================================
-- Persisted, resolvable version of the "orders needing attention" count
-- already shown on Overview. One row per (type, entity_id) — the reconciler
-- (lib/db.ts: reconcileOperationalExceptions) upserts open exceptions for
-- orders stuck in ERROR / leads stuck UNREACHED, and auto-resolves rows
-- whose underlying condition no longer holds. Nothing here is fabricated —
-- every row traces back to a real order or lead row.
-- ============================================================================

CREATE TABLE IF NOT EXISTS operational_exceptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT        NOT NULL,                                              -- e.g. 'order_error', 'lead_stuck'
  severity    TEXT        NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  entity_type TEXT        NOT NULL,                                              -- 'order' | 'lead'
  entity_id   TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  status      TEXT        NOT NULL CHECK (status IN ('open','acknowledged','resolved')) DEFAULT 'open',
  owner_email TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_operational_exceptions_status   ON operational_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_operational_exceptions_severity ON operational_exceptions(severity);

ALTER TABLE operational_exceptions ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose — only the service-role key
-- (server-side only) may read or write this table.
DROP POLICY IF EXISTS "public_access" ON operational_exceptions;
