import { NextResponse }           from "next/server"
import { fetchShopifyOrders }     from "@/lib/shopify"
import { getSupabaseAdmin }        from "@/lib/supabase"

export async function POST(req: Request) {
  const { storeId, shop, accessToken, clientId, clientName } = await req.json()

  if (!storeId || !shop || !accessToken || !clientId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const orders = await fetchShopifyOrders(shop, accessToken)

  const rows = orders.map((order) => {
    const customer  = order.customer  as Record<string, string> | undefined
    const billing   = order.billing_address  as Record<string, string> | undefined
    const shipping  = order.shipping_address as Record<string, string> | undefined
    const lineItems = order.line_items as Array<{ title: string }> | undefined

    const firstName    = customer?.first_name ?? ""
    const lastName     = customer?.last_name  ?? ""
    const customerName = `${firstName} ${lastName}`.trim() || billing?.name || "Client"
    const phone        = customer?.phone ?? billing?.phone ?? shipping?.phone ?? ""
    const country      = billing?.country      ?? shipping?.country      ?? ""
    const countryCode  = billing?.country_code ?? shipping?.country_code ?? ""
    const product      = lineItems?.[0]?.title ?? "Produit"
    const value        = parseFloat((order.total_price as string) ?? "0")
    const storeName    = shop.replace(".myshopify.com", "")

    return {
      id:             `shopify_${order.id}`,
      client_id:      clientId,
      client_name:    clientName ?? "",
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
    }
  })

  if (rows.length === 0) return NextResponse.json({ synced: 0 })

  // Batch upsert in chunks of 100 to avoid payload limits
  const CHUNK = 100
  for (let i = 0; i < rows.length; i += CHUNK) {
    await sb.from("leads").upsert(rows.slice(i, i + CHUNK), { onConflict: "id" })
  }

  return NextResponse.json({ synced: rows.length })
}
