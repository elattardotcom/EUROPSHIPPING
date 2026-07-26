import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ ok: true })

  // Verify client exists
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

  const firstName    = (order.customer as Record<string, string>)?.first_name ?? ""
  const lastName     = (order.customer as Record<string, string>)?.last_name  ?? ""
  const billing      = order.billing_address  as Record<string, string> | undefined
  const shipping     = order.shipping_address as Record<string, string> | undefined
  const customerName = `${firstName} ${lastName}`.trim() || billing?.name || "Client"
  const phone        = (order.customer as Record<string, string>)?.phone ?? billing?.phone ?? shipping?.phone ?? ""
  const country      = billing?.country      ?? shipping?.country      ?? ""
  const countryCode  = billing?.country_code ?? shipping?.country_code ?? ""
  const lineItems    = order.line_items as Array<{ title: string }> | undefined
  const product      = lineItems?.[0]?.title ?? "Produit"
  const value        = parseFloat((order.total_price as string) ?? "0")
  const clientName   = `${client.first_name} ${client.last_name}`.trim()
  const orderId      = order.id as string | number
  const leadId       = `shopify_${orderId}`
  const storeName    = shop.replace(".myshopify.com", "")

  await sb.from("leads").upsert({
    id:             leadId,
    client_id:      clientId,
    client_name:    clientName,
    customer_name:  customerName,
    customer_phone: phone,
    country,
    country_code:   countryCode,
    product,
    value,
    currency:       (order.currency as string) ?? "EUR",
    status:         "PENDING",
    store:          storeName,
    attempts:       0,
    created_at:     (order.created_at as string) ?? new Date().toISOString(),
  }, { onConflict: "id" })

  return NextResponse.json({ ok: true })
}
