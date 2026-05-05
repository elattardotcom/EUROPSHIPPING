import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré" })

  const { data: clients }  = await sb.from("clients").select("id, email").limit(5)
  const { data: stores, error: se }   = await sb.from("stores").select("id, name, domain, status, client_id, access_token").limit(10)
  const { data: products, error: pe } = await sb.from("products").select("id, title, store_id").limit(10)

  // Auto-sync first store if products empty
  let syncResult = null
  if ((!products || products.length === 0) && stores && stores.length > 0) {
    const store = stores[0]
    if (store.access_token) {
      try {
        const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)
        const rows = shopifyProducts.map((p) => {
          const { price, currency } = extractPricing(p)
          return {
            store_id:   store.id,
            shopify_id: String(p.id),
            title:      p.title,
            image_url:  p.images?.[0]?.src ?? null,
            price,
            currency,
            updated_at: new Date().toISOString(),
          }
        })
        const { error: upsertErr } = await sb.from("products")
          .upsert(rows, { onConflict: "store_id,shopify_id" })
        syncResult = upsertErr ? { error: upsertErr.message } : { synced: rows.length }
      } catch (e: unknown) {
        syncResult = { error: String(e) }
      }
    }
  }

  return NextResponse.json({
    supabase: "connecté",
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    clients,
    stores:   se ? { error: se.message } : stores?.map(s => ({ ...s, access_token: s.access_token ? "✓" : "missing" })),
    products: pe ? { error: pe.message } : products,
    syncResult,
  })
}
