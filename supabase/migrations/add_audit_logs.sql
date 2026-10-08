-- ============================================================================
-- ADMIN DASHBOARD UPGRADE — Phase 1: audit log for sensitive admin actions
-- ============================================================================
-- Records who did what to which resource, for accountability on financial and
-- account-state mutations (merchant suspension, registration approval, wallet
-- adjustments, withdrawal decisions). Service-role only — same deny-by-default
-- pattern as every other table locked down in lock_down_rls_phase0.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  target_type TEXT        NOT NULL,
  target_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target      ON audit_logs(target_type, target_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose — only the service-role key
-- (server-side only) may read or write this table.
DROP POLICY IF EXISTS "public_access" ON audit_logs;
