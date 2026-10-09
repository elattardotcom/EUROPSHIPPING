-- ============================================================================
-- ENTERPRISE OPERATIONS COMMAND CENTER — Step 4: integration health
-- ============================================================================
-- Shopify sync failures previously only came back in the API response body
-- and were never persisted, so admin had no way to see a broken store sync
-- without the merchant reporting it. syncShopifyStore() (lib/shopify-sync.ts)
-- now writes these columns on every sync, success or failure.
-- ============================================================================

ALTER TABLE stores ADD COLUMN IF NOT EXISTS last_sync_status TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS last_error        TEXT;
