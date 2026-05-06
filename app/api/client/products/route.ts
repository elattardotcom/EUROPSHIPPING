import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "not_authenticated" }, { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data: stores } = await sb
    .from("stores")
    .select("id, name, domain, access_token")
    .eq("client_id", clientId)

  if (!stores || stores.length === 0) return NextResponse.json([])

  const storeIds = stores.map(s => s.id)
  const storeMap = Object.fromEntries(stores.map(s => [s.id, s]))

  let { data: products } = await sb
    .from("products")
    .select("*")
    .in("store_id", storeIds)
    .order("updated_at", { ascending: false })

  // If no products in DB but store is connected, auto-sync from Shopify
  if (!products || products.length === 0) {
    for (const store of stores) {
      if (!store.access_token) continue
      try {
        const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)
        if (shopifyProducts.length === 0) continue
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
        await sb.from("products").upsert(rows, { onConflict: "store_id,shopify_id" })
        await sb.from("stores").update({ last_sync: new Date().toISOString() }).eq("id", store.id)
      } catch {
        // Sync failed — continue to next store, return whatever is in DB
      }
    }
    // Re-fetch after auto-sync
    const result = await sb
      .from("products")
      .select("*")
      .in("store_id", storeIds)
      .order("updated_at", { ascending: false })
    products = result.data ?? []
  }

  if (!products || products.length === 0) return NextResponse.json([])

  return NextResponse.json(products.map(p => ({
    id:        p.id,
    shopifyId: p.shopify_id,
    title:     p.title,
    imageUrl:  p.image_url,
    price:     p.price,
    currency:  p.currency ?? "EUR",
    stock:     p.stock ?? null,
    storeId:   p.store_id,
    storeName: storeMap[p.store_id]?.name ?? "",
    domain:    storeMap[p.store_id]?.domain ?? "",
    updatedAt: p.updated_at,
  })))
}
