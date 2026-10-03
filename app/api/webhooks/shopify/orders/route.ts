import { NextResponse }      from "next/server"
import { verifyWebhookHmac } from "@/lib/shopify"
import { getSupabaseAdmin }  from "@/lib/supabase"
import { sendEmail, emailShell } from "@/lib/resend"

async function sendNewOrderEmail(opts: {
  clientEmail: string
  clientFirstName: string
  customerName: string
  product: string
  value: number
  currency: string
  country: string
}) {
  const amount = new Intl.NumberFormat("en-EU", { style: "currency", currency: opts.currency ?? "EUR" }).format(opts.value)

  const bodyHtml = `
    <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700">Hello ${opts.clientFirstName || "there"},</p>
    <p style="margin:0 0 28px;color:#888;font-size:14px;line-height:1.7">
      A new COD order just came in from your store and is waiting to be confirmed with the customer.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:28px">
      <tr style="background:rgba(255,255,255,0.03)">
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Customer</td>
        <td style="padding:14px 18px;color:#fff;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">${opts.customerName}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Product</td>
        <td style="padding:14px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${opts.product}</td>
      </tr>
      <tr style="background:rgba(255,255,255,0.03)">
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Country</td>
        <td style="padding:14px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${opts.country || "—"}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Order Value</td>
        <td style="padding:14px 18px;color:#f97316;font-size:14px;font-weight:700">${amount}</td>
      </tr>
    </table>
    <p style="margin:0;color:#555;font-size:12px;line-height:1.6">
      Confirm or process this lead from your
      <a href="https://www.codshipeurope.com/dashboard/leads" style="color:#f97316;text-decoration:none">CODShipEurope dashboard</a>.
    </p>`

  await sendEmail({
    to: opts.clientEmail,
    subject: `New COD order to confirm — ${opts.product}`,
    html: emailShell({ badgeText: "🛒 New Order Received", badgeColor: "orange", bodyHtml }),
  })
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const hmac    = req.headers.get("X-Shopify-Hmac-Sha256") ?? ""
  const shop    = req.headers.get("X-Shopify-Shop-Domain") ?? ""

  if (!hmac || !verifyWebhookHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "HMAC invalide" }, { status: 401 })
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
    .select("first_name, last_name, email")
    .eq("id", store.client_id)
    .single()

  const clientName = client ? `${client.first_name} ${client.last_name}`.trim() : ""

  // Insert as lead — confirmation moves it to orders
  const { error: upsertError } = await sb.from("leads").upsert({
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

  if (!upsertError && client?.email) {
    await sendNewOrderEmail({
      clientEmail:     client.email,
      clientFirstName: client.first_name ?? "",
      customerName,
      product,
      value,
      currency:        order.currency ?? "EUR",
      country,
    })
  }

  return NextResponse.json({ ok: true })
}
