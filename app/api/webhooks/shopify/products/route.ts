import { NextResponse }                  from "next/server"
import { verifyWebhookHmac, extractPricing } from "@/lib/shopify"
import { getSupabaseAdmin }              from "@/lib/supabase"

export async function POST(req: Request) {
  // Lit le body brut AVANT de le parser (nécessaire pour la vérification HMAC)
  const rawBody = await req.text()
  const hmac    = req.headers.get("X-Shopify-Hmac-Sha256") ?? ""
  const topic   = req.headers.get("X-Shopify-Topic") ?? ""
  const shop    = req.headers.get("X-Shopify-Shop-Domain") ?? ""

  // Vérifie la signature HMAC seulement si le secret est configuré
  if (process.env.SHOPIFY_WEBHOOK_SECRET && hmac) {
    if (!verifyWebhookHmac(rawBody, hmac)) {
      return NextResponse.json({ error: "HMAC invalide" }, { status: 401 })
    }
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ ok: true }) // ignore si pas de DB

  // Récupère l'ID de la boutique depuis Supabase
  const { data: store } = await sb
    .from("stores")
    .select("id")
    .eq("domain", shop)
    .single()

  if (!store) {
    return NextResponse.json({ error: "Boutique inconnue" }, { status: 404 })
  }

  const product = JSON.parse(rawBody)

  if (topic === "products/delete") {
    // Supprime le produit de la base
    await sb
      .from("products")
      .delete()
      .eq("store_id", store.id)
      .eq("shopify_id", String(product.id))

    return NextResponse.json({ ok: true })
  }

  // products/create ou products/update : upsert
  const { price, currency, presentmentPrices } = extractPricing(product)

  await sb.from("products").upsert({
    store_id:           store.id,
    shopify_id:         String(product.id),
    title:              product.title,
    image_url:          product.images?.[0]?.src ?? null,
    price,
    currency,
    presentment_prices: presentmentPrices,
    updated_at:         new Date().toISOString(),
  }, { onConflict: "store_id,shopify_id" })

  return NextResponse.json({ ok: true })
}
