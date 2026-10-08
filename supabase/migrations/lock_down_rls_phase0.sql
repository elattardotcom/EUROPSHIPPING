-- ============================================================================
-- PHASE 0 SECURITY FIX — remove anonymous read/write access to sensitive tables
-- ============================================================================
--
-- CONTEXT
-- Every table below currently has a `public_access` policy that reads:
--     FOR ALL TO anon USING (true) WITH CHECK (true)
-- which means ANYONE with the public NEXT_PUBLIC_SUPABASE_ANON_KEY (shipped to
-- every browser) can read and write every row of every client's data —
-- clients, orders, leads, withdrawals, balances, password hashes, IBANs, etc.
--
-- WHY THIS IS SAFE TO APPLY
-- An audit of the codebase (see `grep -rln "getSupabase()" app/ lib/` before
-- this migration) confirmed that every server-side API route now reads/writes
-- these tables exclusively through `getSupabaseAdmin()` (the SUPABASE_SERVICE_
-- ROLE_KEY client), which bypasses RLS entirely. The ONLY remaining consumer
-- of the anon client is the browser-side Realtime hook (hooks/useSse.ts),
-- which subscribes to postgres_changes on `withdrawals` and `balances` only
-- (leads/orders were never added to the supabase_realtime publication, so
-- those listeners were already inert).
--
-- Every admin-privileged API route (/api/admin/*, /api/withdrawals/[id]) now
-- verifies an admin session server-side via requireAdmin() before touching
-- these tables. Every client-privileged route derives the caller's identity
-- from the `client_id` cookie server-side and scopes its own query — it does
-- not rely on RLS to do that scoping. So removing anon access does not break
-- any legitimate code path EXCEPT:
--
-- TRADEOFF — REALTIME WILL GO SILENT FOR ANON CLIENTS
-- Supabase Realtime's `postgres_changes` evaluates each table's RLS using the
-- role of the connection. The browser connects with the anon key (there is no
-- Supabase Auth / auth.uid() in this app's custom cookie-auth model), so once
-- anon can no longer SELECT `withdrawals`/`balances`, the live push notifications
-- on the client dashboard (wallet, withdrawals pages) and the admin withdrawals
-- page will stop arriving. There is no way to scope Realtime per-client without
-- either (a) migrating to Supabase Auth so auth.uid() exists, or (b) running a
-- custom WebSocket/SSE relay server-side — both are out of scope for this
-- emergency fix. The safe short-term mitigation is a polling fallback
-- (setInterval re-fetch via the already-authenticated REST API) on the pages
-- that relied on it; this is being added alongside this migration.
--
-- WHAT THIS MIGRATION DOES
-- For every sensitive table, anon FOR ALL policies are dropped and NOT
-- replaced — leaving RLS enabled with zero policies for anon, which means
-- anon has NO access (default-deny). No policy is granted to `authenticated`
-- either, since this app does not use Supabase Auth. All access must go
-- through the service-role key (server-side only, never shipped to browser),
-- which bypasses RLS by design.
-- ============================================================================

-- ─── Tables defined in supabase/schema.sql ─────────────────────────────────
DROP POLICY IF EXISTS "public_access" ON clients;
DROP POLICY IF EXISTS "public_access" ON balances;
DROP POLICY IF EXISTS "public_access" ON withdrawals;
DROP POLICY IF EXISTS "public_access" ON orders;
DROP POLICY IF EXISTS "public_access" ON leads;
DROP POLICY IF EXISTS "public_access" ON stores;
DROP POLICY IF EXISTS "public_access" ON auth_credentials;
DROP POLICY IF EXISTS "public_access" ON balance_adjustments;

-- ─── Tables defined in supabase/shopify_schema.sql ─────────────────────────
DROP POLICY IF EXISTS "public_access" ON products;

-- ─── Tables that exist in production but were created ad hoc (not tracked
--     in any committed schema file) — found via admin routes that read them.
--     Guarded with IF EXISTS so this migration is safe to run even if a
--     given table isn't present in a particular environment.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON payment_methods';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registration_requests') THEN
    ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON registration_requests';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_rates') THEN
    ALTER TABLE fee_rates ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON fee_rates';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cod_products') THEN
    ALTER TABLE cod_products ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON cod_products';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_offers') THEN
    ALTER TABLE affiliate_offers ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON affiliate_offers';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_product_activations') THEN
    ALTER TABLE client_product_activations ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON client_product_activations';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sourcing_requests') THEN
    ALTER TABLE sourcing_requests ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "public_access" ON sourcing_requests';
  END IF;
END $$;

-- ============================================================================
-- After this migration: anon has zero policies on every table above, so RLS
-- defaults to deny-all for anon. Every table keeps RLS enabled with no grants
-- to `anon` or `authenticated` — only the service-role key (server-side only)
-- can read/write them, which is exactly the access pattern the app already
-- uses everywhere except the Realtime hook.
-- ============================================================================
