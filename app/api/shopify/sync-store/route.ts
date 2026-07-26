import { NextRequest, NextResponse }                          from "next/server"
import { getSupabaseAdmin }                                    from "@/lib/supabase"
import { fetchShopifyProducts, fetchShopifyOrders, extractPricing } from "@/lib/shopify"

export const maxDuration = 60

const API_VERSION = "2025-01"

async function registerWebhookWithUrl(shop: string, accessToken: string, topic: string, appUrl: string) {
  const path = topic.startsWith("orders/") ? "orders" : "products"
  await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ webhook: { topic, address: `${appUrl}/api/webhooks/shopify/${path}`, format: "json" } }),
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
    .from("stores").select("id, domain, access_token, client_id")
    .eq("id", storeId).eq("client_id", clientId).single()

  if (!store?.access_token) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })

  const { data: client } = await sb
    .from("clients").select("first_name, last_name").eq("id", clientId).single()
  const clientName = client ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() : ""

  // ── Sync produits ─────────────────────────────────────────────────────────
  let productsSynced = 0
  try {
    const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)
    const rows = shopifyProducts.filter(p => p.title).map(p => {
      const { price, currency } = extractPricing(p)
      return {
        store_id: store.id, shopify_id: String(p.id), title: p.title,
        image_url: p.images?.[0]?.src ?? null, price, currency,
        updated_at: new Date().toISOString(),
      }
    })
    if (rows.length > 0) {
      await sb.from("products").upsert(rows, { onConflict: "store_id,shopify_id" })
      const validIds = rows.map(r => r.shopify_id)
      await sb.from("products").delete().eq("store_id", store.id).not("shopify_id", "in", `(${validIds.join(",")})`)
    } else {
      await sb.from("products").delete().eq("store_id", store.id)
    }
    productsSynced = rows.length
  } catch { /* silent */ }

  // ── Sync historique commandes ─────────────────────────────────────────────
  let ordersSynced = 0
  try {
    const orders    = await fetchShopifyOrders(store.domain, store.access_token)
    const storeName = store.domain.replace(".myshopify.com", "")
    const leadRows  = orders.map(order => {
      const customer  = order.customer  as Record<string, string> | undefined
      const billing   = order.billing_address  as Record<string, string> | undefined
      const shipping  = order.shipping_address as Record<string, string> | undefined
      const lineItems = order.line_items as Array<{ title: string }> | undefined
      const fn = customer?.first_name ?? ""
      const ln = customer?.last_name  ?? ""
      return {
        id:             `shopify_${order.id}`,
        client_id:      clientId,
        client_name:    clientName,
        customer_name:  `${fn} ${ln}`.trim() || billing?.name || "Client",
        customer_phone: customer?.phone ?? billing?.phone ?? shipping?.phone ?? "",
        country:        billing?.country      ?? shipping?.country      ?? "",
        country_code:   billing?.country_code ?? shipping?.country_code ?? "",
        product:        lineItems?.[0]?.title ?? "Produit",
        value:          parseFloat((order.total_price as string) ?? "0"),
        currency:       (order.currency as string) ?? "EUR",
        status:         "PENDING",
        store:          storeName,
        attempts:       0,
        created_at:     (order.created_at as string) ?? new Date().toISOString(),
      }
    })
    const CHUNK = 100
    for (let i = 0; i < leadRows.length; i += CHUNK) {
      await sb.from("leads").upsert(leadRows.slice(i, i + CHUNK), { onConflict: "id" })
    }
    ordersSynced = leadRows.length
  } catch { /* silent */ }

  await sb.from("stores").update({ last_sync: new Date().toISOString() }).eq("id", storeId)

  // Enregistre les webhooks
  const origin = new URL(req.url).origin
  await Promise.allSettled([
    registerWebhookWithUrl(store.domain, store.access_token, "products/create", origin),
    registerWebhookWithUrl(store.domain, store.access_token, "products/update", origin),
    registerWebhookWithUrl(store.domain, store.access_token, "products/delete", origin),
    registerWebhookWithUrl(store.domain, store.access_token, "orders/create",   origin),
  ])

  return NextResponse.json({ products: productsSynced, orders: ordersSynced })
}
