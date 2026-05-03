import { NextResponse }              from "next/server"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"
import { getSupabase }               from "@/lib/supabase"

export async function POST(req: Request) {
  const { storeId, shop, accessToken } = await req.json()

  if (!storeId || !shop || !accessToken) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  // Récupère tous les produits depuis l'API Shopify
  const shopifyProducts = await fetchShopifyProducts(shop, accessToken)

  // Construit les rows à upsert en base
  const rows = shopifyProducts.map((p) => {
    const { price, currency, presentmentPrices } = extractPricing(p)
    return {
      store_id:           storeId,
      shopify_id:         String(p.id),
      title:              p.title,
      image_url:          p.images?.[0]?.src ?? null,
      price,
      currency,
      presentment_prices: presentmentPrices,
      updated_at:         new Date().toISOString(),
    }
  })

  // Upsert en lot (conflit sur store_id + shopify_id)
  const { error } = await sb
    .from("products")
    .upsert(rows, { onConflict: "store_id,shopify_id" })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Met à jour la date de dernière sync sur la boutique
  await sb
    .from("stores")
    .update({ last_sync: new Date().toISOString(), status: "connected" })
    .eq("id", storeId)

  return NextResponse.json({ synced: rows.length })
}
