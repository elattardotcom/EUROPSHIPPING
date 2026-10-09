-- ============================================================================
-- ADMIN DASHBOARD UPGRADE — Phase 3: providers + fulfillment/tracking
-- ============================================================================
-- Provider-neutral structure: no specific provider (e.g. Beeping) is assumed
-- connected. Every row starts with api_status = 'not_connected' and nothing
-- here fabricates a live integration — see app/admin/providers/page.tsx and
-- app/admin/fulfillment/page.tsx for the honest "not yet connected" UI this
-- schema backs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS providers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  service_type TEXT        NOT NULL,                                   -- e.g. 'fulfillment', 'last_mile', 'call_center'
  countries    JSONB       DEFAULT '[]',                                -- array of ISO country codes served
  status       TEXT        CHECK (status IN ('active','inactive','pending')) DEFAULT 'pending',  -- commercial status
  api_status   TEXT        CHECK (api_status IN ('not_connected','connected','error')) DEFAULT 'not_connected',
  last_sync_at TIMESTAMPTZ,
  last_error   TEXT,
  config       JSONB,                                                   -- server-only credentials/config — never selected by any route a browser calls directly
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_id      UUID REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_error   TEXT;

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose — only the service-role key
-- (server-side only) may read or write this table, matching every other
-- table locked down in lock_down_rls_phase0.sql.
DROP POLICY IF EXISTS "public_access" ON providers;
