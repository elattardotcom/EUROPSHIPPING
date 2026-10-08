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
--
-- Every table is guarded with an information_schema existence check before
-- being touched: the live database was found to diverge from the committed
-- schema.sql (e.g. `auth_credentials` was never actually created — the app
-- falls back to clients.password_hash), so this migration must not assume
-- any table listed in schema.sql actually exists in production.
-- ============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- tables defined in supabase/schema.sql
    'clients', 'balances', 'withdrawals', 'orders', 'leads', 'stores',
    'auth_credentials', 'balance_adjustments',
    -- table defined in supabase/shopify_schema.sql
    'products',
    -- tables that exist in production but were created ad hoc (not tracked
    -- in any committed schema file) — found via admin routes that read them
    'payment_methods', 'registration_requests', 'fee_rates', 'cod_products',
    'affiliate_offers', 'client_product_activations', 'sourcing_requests'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "public_access" ON %I', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- After this migration: anon has zero policies on every table above, so RLS
-- defaults to deny-all for anon. Every table keeps RLS enabled with no grants
-- to `anon` or `authenticated` — only the service-role key (server-side only)
-- can read/write them, which is exactly the access pattern the app already
-- uses everywhere except the Realtime hook.
-- ============================================================================
