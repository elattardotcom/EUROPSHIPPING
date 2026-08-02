import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ ok: true })

  const { data: client } = await sb
    .from("clients")
    .select("id, first_name, last_name")
    .eq("id", clientId)
    .single()

  if (!client) return NextResponse.json({ error: "Client inconnu" }, { status: 404 })

  const shop = req.headers.get("X-Shopify-Shop-Domain") ?? "shopify"

  let order: Record<string, unknown>
  try {
    order = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const firstName   = (order.customer as Record<string, string>)?.first_name ?? ""
  const lastName    = (order.customer as Record<string, string>)?.last_name  ?? ""
  const billing     = order.billing_address  as Record<string, string> | undefined
  const shipping    = order.shipping_address as Record<string, string> | undefined
  const addr        = shipping ?? billing

  const customerName = `${firstName} ${lastName}`.trim() || addr?.name || "Client"
  const phone        = (order.customer as Record<string, string>)?.phone ?? billing?.phone ?? shipping?.phone ?? ""
  const country      = addr?.country      ?? ""
  const countryCode  = addr?.country_code ?? ""
  const address      = addr?.address1     ?? ""
  const city         = addr?.city         ?? ""
  const zip          = addr?.zip          ?? ""

  const lineItems    = order.line_items as Array<{ title: string; quantity?: number }> | undefined
  const product      = lineItems?.[0]?.title ?? "Produit"
  const quantity     = lineItems?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 1
  const value        = parseFloat((order.total_price as string) ?? "0")
  const clientName   = `${client.first_name} ${client.last_name}`.trim()
  const orderId      = order.id as string | number
  const leadId       = `shopify_${orderId}`
  const storeName    = shop.replace(".myshopify.com", "")

  // ── Duplicate detection ──────────────────────────────────────────────────
  // Same phone + same product already received in the last 5 minutes = duplicate
  const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: dupes } = await sb
    .from("leads")
    .select("id")
    .eq("client_id", clientId)
    .eq("customer_phone", phone)
    .eq("product", product)
    .gte("created_at", windowStart)
    .neq("id", leadId)
    .limit(1)

  const isDuplicate = (dupes?.length ?? 0) > 0
  const status      = isDuplicate ? "ERROR" : "PENDING"

  await sb.from("leads").upsert({
    id:             leadId,
    client_id:      clientId,
    client_name:    clientName,
    customer_name:  customerName,
    customer_phone: phone,
    country,
    country_code:   countryCode,
    address,
    city,
    zip,
    product,
    quantity,
    value,
    currency:       (order.currency as string) ?? "EUR",
    status,
    is_duplicate:   isDuplicate,
    store:          storeName,
    attempts:       0,
    created_at:     (order.created_at as string) ?? new Date().toISOString(),
  }, { onConflict: "id" })

  return NextResponse.json({ ok: true, isDuplicate })
}
