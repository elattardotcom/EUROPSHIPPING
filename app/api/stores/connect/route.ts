import { NextRequest, NextResponse }              from "next/server"
import { getSupabaseAdmin }                        from "@/lib/supabase"
import { canAddStore }                             from "@/lib/plan-limits"
import { fetchShopifyProducts, fetchShopifyOrders, extractPricing } from "@/lib/shopify"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { domain, accessToken } = await req.json()
  if (!domain || !accessToken) {
    return NextResponse.json({ error: "Domaine et clé API requis" }, { status: 400 })
  }

  const cleanDomain = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")

  if (!cleanDomain.includes(".myshopify.com")) {
    return NextResponse.json({ error: "Le domaine doit se terminer par .myshopify.com" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Base de données non configurée" }, { status: 500 })

  const { data: clientRow } = await sb
    .from("clients")
    .select("plan, first_name, last_name")
    .eq("id", clientId)
    .single()

  const plan = clientRow?.plan ?? "starter"

  const { count: existingCount } = await sb
    .from("stores")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)

  if (!canAddStore(plan, existingCount ?? 0)) {
    const limits: Record<string, number> = { starter: 1, pro: 3 }
    const max = limits[plan] ?? 1
    return NextResponse.json({
      error: `Votre plan est limité à ${max} boutique${max > 1 ? "s" : ""}. Passez à un plan supérieur.`,
      upgrade: true,
    }, { status: 403 })
  }

  const storeName  = cleanDomain.replace(".myshopify.com", "")
  const clientName = clientRow ? `${clientRow.first_name ?? ""} ${clientRow.last_name ?? ""}`.trim() : ""
  const token      = accessToken.trim()

  const { data: store, error: storeErr } = await sb
    .from("stores")
    .upsert({
      client_id:    clientId,
      name:         storeName,
      domain:       cleanDomain,
      status:       "connected",
      access_token: token,
      last_sync:    null,
    }, { onConflict: "domain" })
    .select("id, name, domain")
    .single()

  if (storeErr || !store) {
    return NextResponse.json({ error: storeErr?.message ?? "Erreur sauvegarde boutique" }, { status: 500 })
  }

  const debug: Record<string, unknown> = {}

  // ── Sync produits ────────────────────────────────────────────────────────
  try {
    const shopifyProducts = await fetchShopifyProducts(cleanDomain, token)
    debug.products_fetched = shopifyProducts.length
    const productRows = shopifyProducts.map(p => {
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
    if (productRows.length > 0) {
      const { error: pe } = await sb.from("products").upsert(productRows, { onConflict: "store_id,shopify_id" })
      debug.products_error = pe?.message ?? null
    }
    await sb.from("stores").update({ last_sync: new Date().toISOString() }).eq("id", store.id)
  } catch (e) { debug.products_exception = String(e) }

  // ── Sync commandes historiques ───────────────────────────────────────────
  try {
    const orders = await fetchShopifyOrders(cleanDomain, token)
    debug.orders_fetched = orders.length
    const leadRows = orders.map(order => {
      const customer  = order.customer  as Record<string, string> | undefined
      const billing   = order.billing_address  as Record<string, string> | undefined
      const shipping  = order.shipping_address as Record<string, string> | undefined
      const lineItems = order.line_items as Array<{ title: string }> | undefined
      const firstName    = customer?.first_name ?? ""
      const lastName     = customer?.last_name  ?? ""
      const customerName = `${firstName} ${lastName}`.trim() || billing?.name || "Client"
      return {
        id:             `shopify_${order.id}`,
        client_id:      clientId,
        client_name:    clientName,
        customer_name:  customerName,
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
      const { error: le } = await sb.from("leads").upsert(leadRows.slice(i, i + CHUNK), { onConflict: "id" })
      if (le) { debug.leads_error = le.message; break }
    }
    debug.leads_inserted = leadRows.length
  } catch (e) { debug.orders_exception = String(e) }

  return NextResponse.json({ store, debug })
}
