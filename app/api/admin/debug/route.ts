import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"

export async function GET(req: NextRequest) {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré" })

  const cookieClientId = req.cookies.get("client_id")?.value ?? null

  const { data: clients }  = await sb.from("clients").select("id, email").limit(10)
  const { data: stores }   = await sb.from("stores").select("id, name, domain, status, client_id, access_token").limit(10)
  const { data: products } = await sb.from("products").select("id, title, store_id").limit(20)

  const myStores   = stores?.filter(s => s.client_id === cookieClientId) ?? []
  const myStoreIds = myStores.map(s => s.id)
  const myProducts = products?.filter(p => myStoreIds.includes(p.store_id)) ?? []

  // Auto-sync: if cookie client has a store but no products, sync now
  let syncResult = null
  if (myStores.length > 0 && myProducts.length === 0) {
    const store = myStores[0]
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
    cookieClientId,
    allClients:  clients,
    allStores:   stores?.map(s => ({ ...s, access_token: s.access_token ? "✓" : "missing" })),
    allProducts: products,
    myStores:    myStores.map(s => ({ ...s, access_token: s.access_token ? "✓" : "missing" })),
    myProducts,
    syncResult,
    diagnosis: myStores.length === 0
      ? "❌ Aucune boutique pour ce client_id cookie"
      : myProducts.length === 0 && !syncResult
        ? "❌ Boutique trouvée mais aucun produit"
        : syncResult
          ? `🔄 Sync lancée: ${JSON.stringify(syncResult)}`
          : `✅ ${myProducts.length} produit(s) trouvé(s)`,
  })
}
