import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"

export async function GET(req: NextRequest) {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré" })

  const cookieClientId = req.cookies.get("client_id")?.value ?? null

  const { data: stores }   = await sb.from("stores").select("id, name, domain, status, client_id, access_token").limit(10)
  const { data: products } = await sb.from("products").select("id, title, store_id, shopify_id").limit(50)

  const myStores   = stores?.filter(s => s.client_id === cookieClientId) ?? []
  const myStoreIds = myStores.map(s => s.id)
  const myProducts = products?.filter(p => myStoreIds.includes(p.store_id)) ?? []

  // Always do a live Shopify fetch for the first store to compare
  let shopifyLive: { count: number; titles: string[]; error?: string } | null = null
  let forceSyncResult: { synced?: number; error?: string } | null = null

  if (myStores.length > 0 && myStores[0].access_token) {
    const store = myStores[0]
    try {
      const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)
      shopifyLive = {
        count:  shopifyProducts.length,
        titles: shopifyProducts.map(p => p.title),
      }

      // Force upsert everything from Shopify to DB
      if (shopifyProducts.length > 0) {
        const rows = shopifyProducts.map((p) => {
          const { price, currency, presentmentPrices } = extractPricing(p)
          return {
            store_id:           store.id,
            shopify_id:         String(p.id),
            title:              p.title,
            image_url:          p.images?.[0]?.src ?? null,
            price,
            currency,
            presentment_prices: presentmentPrices,
            updated_at:         new Date().toISOString(),
          }
        })
        const { error: upsertErr } = await sb.from("products")
          .upsert(rows, { onConflict: "store_id,shopify_id" })
        forceSyncResult = upsertErr ? { error: upsertErr.message } : { synced: rows.length }
      }
    } catch (e: unknown) {
      shopifyLive = { count: 0, titles: [], error: String(e) }
    }
  }

  // Re-fetch products after force sync
  const { data: productsAfter } = await sb.from("products")
    .select("id, title, store_id, shopify_id")
    .in("store_id", myStoreIds.length > 0 ? myStoreIds : ["none"])

  return NextResponse.json({
    cookieClientId,
    myStores:       myStores.map(s => ({ id: s.id, name: s.name, domain: s.domain, hasToken: !!s.access_token })),
    dbProductsBefore: myProducts.map(p => p.title),
    shopifyLive,
    forceSyncResult,
    dbProductsAfter: productsAfter?.map(p => p.title) ?? [],
    diagnosis:
      myStores.length === 0           ? "❌ Aucune boutique pour ce client_id" :
      !myStores[0].access_token       ? "❌ access_token manquant" :
      shopifyLive?.error              ? `❌ Erreur Shopify: ${shopifyLive.error}` :
      shopifyLive?.count === 0        ? "⚠️ Shopify retourne 0 produit" :
      forceSyncResult?.error          ? `❌ Erreur upsert: ${forceSyncResult.error}` :
                                        `✅ ${shopifyLive?.count} produit(s) Shopify → ${productsAfter?.length} en DB`,
  })
}
