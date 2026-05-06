import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { fetchShopifyProducts, extractPricing } from "@/lib/shopify"
import crypto from "crypto"

async function registerWebhookWithUrl(shop: string, accessToken: string, topic: string, appUrl: string) {
  const API_VERSION = "2025-01"
  const API_KEY     = process.env.SHOPIFY_API_KEY ?? "e8be12f3fba0f60638139a6e62d956ea"
  await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method:  "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type":           "application/json",
    },
    body: JSON.stringify({
      webhook: {
        topic,
        address: `${appUrl}/api/webhooks/shopify/products`,
        format:  "json",
      },
    }),
  })
}

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { storeId } = await req.json()
  if (!storeId) return NextResponse.json({ error: "storeId requis" }, { status: 400 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

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

  // Re-register webhooks using the current server URL so auto-sync works
  const origin = new URL(req.url).origin
  await Promise.allSettled([
    registerWebhookWithUrl(store.domain, store.access_token, "products/create", origin),
    registerWebhookWithUrl(store.domain, store.access_token, "products/update", origin),
    registerWebhookWithUrl(store.domain, store.access_token, "products/delete", origin),
  ])

  return NextResponse.json({ synced: rows.length })
}
