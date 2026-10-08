import { NextRequest, NextResponse } from "next/server"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"
import { getSupabaseAdmin }               from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { storeId } = await req.json()
  if (!storeId) return NextResponse.json({ error: "storeId requis" }, { status: 400 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  // Verify the store belongs to this client and use its own stored token —
  // never trust a client-supplied shop/accessToken for a privileged mutation.
  const { data: store } = await sb
    .from("stores").select("id, domain, access_token, client_id")
    .eq("id", storeId).eq("client_id", clientId).single()

  if (!store?.access_token) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })

  // Récupère tous les produits depuis l'API Shopify
  const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)

  // Construit les rows à upsert en base
  const rows = shopifyProducts.map((p) => {
    const { price, currency } = extractPricing(p)
    return {
      store_id:   storeId,
      shopify_id: String(p.id),
      title:      p.title,
      image_url:  p.images?.[0]?.src ?? null,
      price,
      currency,
      updated_at: new Date().toISOString(),
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
