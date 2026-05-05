import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { storeId } = await req.json()
  if (!storeId) return NextResponse.json({ error: "storeId requis" }, { status: 400 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  // Vérifies que le store appartient bien au client
  const { data: store } = await sb
    .from("stores")
    .select("id, domain, access_token")
    .eq("id", storeId)
    .eq("client_id", clientId)
    .single()

  if (!store?.access_token) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })
  }

  const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)

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

  const { error } = await sb
    .from("products")
    .upsert(rows, { onConflict: "store_id,shopify_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb
    .from("stores")
    .update({ last_sync: new Date().toISOString() })
    .eq("id", storeId)

  return NextResponse.json({ synced: rows.length })
}
