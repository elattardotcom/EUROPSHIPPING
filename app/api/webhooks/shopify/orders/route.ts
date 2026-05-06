import { NextResponse }      from "next/server"
import { verifyWebhookHmac } from "@/lib/shopify"
import { getSupabaseAdmin }  from "@/lib/supabase"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const hmac    = req.headers.get("X-Shopify-Hmac-Sha256") ?? ""
  const shop    = req.headers.get("X-Shopify-Shop-Domain") ?? ""

  if (process.env.SHOPIFY_WEBHOOK_SECRET && hmac) {
    if (!verifyWebhookHmac(rawBody, hmac)) {
      return NextResponse.json({ error: "HMAC invalide" }, { status: 401 })
    }
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ ok: true })

  const { data: store } = await sb
    .from("stores")
    .select("id, name, client_id")
    .eq("domain", shop)
    .single()

  if (!store) return NextResponse.json({ error: "Boutique inconnue" }, { status: 404 })

  const order = JSON.parse(rawBody)

  const firstName    = order.customer?.first_name ?? ""
  const lastName     = order.customer?.last_name  ?? ""
  const customerName = `${firstName} ${lastName}`.trim() || order.billing_address?.name || "Client"
  const phone        = order.customer?.phone ?? order.billing_address?.phone ?? order.shipping_address?.phone ?? ""
  const country      = order.billing_address?.country      ?? order.shipping_address?.country      ?? ""
  const countryCode  = order.billing_address?.country_code ?? order.shipping_address?.country_code ?? ""
  const product      = order.line_items?.[0]?.title ?? "Produit"
  const value        = parseFloat(order.total_price ?? "0")
  const leadId       = `shopify_${order.id}`

  const { data: client } = await sb
    .from("clients")
    .select("first_name, last_name")
    .eq("id", store.client_id)
    .single()

  const clientName = client ? `${client.first_name} ${client.last_name}`.trim() : ""

  // Insert as lead — confirmation moves it to orders
  await sb.from("leads").upsert({
    id:             leadId,
    client_id:      store.client_id,
    client_name:    clientName,
    customer_name:  customerName,
    customer_phone: phone,
    country,
    country_code:   countryCode,
    product,
    value,
    currency:       order.currency ?? "EUR",
    status:         "PENDING",
    store:          store.name,
    attempts:       0,
    created_at:     order.created_at ?? new Date().toISOString(),
  }, { onConflict: "id" })

  return NextResponse.json({ ok: true })
}
