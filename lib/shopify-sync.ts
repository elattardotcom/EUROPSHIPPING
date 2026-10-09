import { getSupabaseAdmin } from "./supabase"
import { fetchShopifyProducts, fetchShopifyOrders, extractPricing } from "./shopify"

const API_VERSION = "2025-01"

async function registerWebhookWithUrl(shop: string, accessToken: string, topic: string, appUrl: string) {
  const path = topic.startsWith("orders/") ? "orders" : "products"
  await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ webhook: { topic, address: `${appUrl}/api/webhooks/shopify/${path}`, format: "json" } }),
  })
}

export interface SyncResult {
  products: number
  orders:   number
  errors:   string[]
}

/**
 * Core Shopify sync for one store — shared by the merchant-triggered route
 * (app/api/shopify/sync-store) and the admin retry route
 * (app/api/admin/stores/[id]/sync), so the two never drift. Persists
 * last_sync_status/last_error on the store row either way, which is what
 * makes integration health on /admin/stores possible — previously a
 * failure only came back in the response body and was never recorded.
 */
export async function syncShopifyStore(storeId: string, webhookOrigin?: string): Promise<SyncResult | null> {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data: store } = await sb
    .from("stores").select("id, domain, access_token, client_id")
    .eq("id", storeId).single()
  if (!store?.access_token) return null

  const { data: client } = await sb
    .from("clients").select("first_name, last_name").eq("id", store.client_id).single()
  const clientName = client ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() : ""

  let productsSynced = 0
  const errors: string[] = []
  try {
    const shopifyProducts = await fetchShopifyProducts(store.domain, store.access_token)
    const rows = shopifyProducts.filter(p => p.title).map(p => {
      const { price, currency } = extractPricing(p)
      const stock = p.variants?.reduce((sum, v) => sum + (v.inventory_quantity ?? 0), 0) ?? null
      return {
        store_id: store.id, shopify_id: String(p.id), title: p.title,
        image_url: p.images?.[0]?.src ?? null, price, currency, stock,
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
  } catch (err) {
    errors.push(`products: ${err instanceof Error ? err.message : String(err)}`)
  }

  let ordersSynced = 0
  try {
    const since     = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const orders    = await fetchShopifyOrders(store.domain, store.access_token, since)
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
        client_id:      store.client_id,
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
  } catch (err) {
    errors.push(`orders: ${err instanceof Error ? err.message : String(err)}`)
  }

  const nowIso = new Date().toISOString()
  try {
    if (errors.length === 0) {
      await sb.from("stores").update({
        last_sync: nowIso, last_sync_status: "success", last_error: null,
      }).eq("id", storeId)
    } else {
      await sb.from("stores").update({
        last_sync_status: "error", last_error: errors.join("; "),
      }).eq("id", storeId)
    }
  } catch { /* last_sync_status/last_error columns may not exist yet */ }

  if (webhookOrigin) {
    await Promise.allSettled([
      registerWebhookWithUrl(store.domain, store.access_token, "products/create", webhookOrigin),
      registerWebhookWithUrl(store.domain, store.access_token, "products/update", webhookOrigin),
      registerWebhookWithUrl(store.domain, store.access_token, "products/delete", webhookOrigin),
      registerWebhookWithUrl(store.domain, store.access_token, "orders/create",   webhookOrigin),
    ])
  }

  return { products: productsSynced, orders: ordersSynced, errors }
}
