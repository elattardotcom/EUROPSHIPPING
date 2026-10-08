-- ============================================================================
-- PHASE 0 FOLLOW-UP — server-side admin session store
-- ============================================================================
-- Replaces the static `admin_session=1` cookie (forgeable by anyone who
-- guesses the literal string "1") with a cryptographically random,
-- server-verified session token.
--
-- The browser only ever holds the raw random token (256 bits of entropy,
-- generated with crypto.randomBytes(32) in lib/admin-auth.ts). This table
-- stores only a SHA-256 hash of that token — never the raw value — so a
-- leaked database row cannot be replayed as a cookie, mirroring how
-- password hashes are stored.
--
-- `requireAdmin()` (lib/admin-auth.ts) hashes the incoming cookie value and
-- looks up this table via the service-role client (RLS is irrelevant here
-- since service-role bypasses it, but RLS is still enabled with no anon
-- policy for defense in depth, consistent with every other table in
-- lock_down_rls_phase0.sql).
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT        UNIQUE NOT NULL,
  admin_email TEXT       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy on purpose — only the service-role key
-- (server-side only) may read or write this table.
DROP POLICY IF EXISTS "public_access" ON admin_sessions;
