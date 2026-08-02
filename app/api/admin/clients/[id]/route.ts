import { NextRequest, NextResponse } from "next/server"
import { getClientById, getClientOrders, getClientLeads, getClientStores, getPaymentMethods } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [client, orders, leads, stores, paymentMethods] = await Promise.all([
    getClientById(id),
    getClientOrders(id),
    getClientLeads(id),
    getClientStores(id),
    getPaymentMethods(id),
  ])
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })
  return NextResponse.json({ client, orders, leads, stores, paymentMethods })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { plan, status } = await req.json()

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const payload: Record<string, string> = {}
  if (plan)   payload.plan   = plan
  if (status) payload.status = status

  const { error } = await sb.from("clients").update(payload).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send activation email when status → active
  if (status === "active") {
    const { data: client } = await sb.from("clients").select("email,first_name").eq("id", id).single()
    const apiKey  = process.env.RESEND_API_KEY
    const from    = process.env.RESEND_FROM_EMAIL ?? "CODShipEurope <contact@codshipeurope.com>"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"
    if (client?.email && apiKey && !apiKey.startsWith("re_xxx")) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from, to: [client.email],
          subject: "✅ Your CODShipEurope account is now active",
          html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">
  <tr><td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:28px 36px">
    <p style="margin:0;color:#fff;font-size:20px;font-weight:800">CODShipEurope</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px">COD Platform Europe</p>
  </td></tr>
  <tr><td style="padding:36px">
    <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700">Hello ${client.first_name ?? ""} 👋</p>
    <p style="margin:0 0 24px;color:#888;font-size:14px;line-height:1.7">Your <strong style="color:#fff">CODShipEurope</strong> account is now <strong style="color:#10b981">active</strong>. You can log in right now and start selling COD across Europe.</p>
    <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:600">Get started in 3 steps:</p>
      <p style="margin:0 0 8px;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">1.</span> Log in at codshipeurope.com</p>
      <p style="margin:0 0 8px;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">2.</span> Connect your Shopify store in 5 minutes</p>
      <p style="margin:0;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">3.</span> Your COD orders will sync automatically</p>
    </div>
    <a href="${baseUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none">Go to my dashboard →</a>
    <p style="margin:24px 0 0;color:#555;font-size:12px">Questions? <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a></p>
  </td></tr>
  <tr><td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
    <p style="margin:0;color:#444;font-size:11px">© 2025 CODShipEurope · <a href="${baseUrl}" style="color:#f97316;text-decoration:none">www.codshipeurope.com</a></p>
  </td></tr>
</table></td></tr></table></body></html>`,
        }),
      }).catch(err => console.error("[activation-email]", err))
    }
  }

  return NextResponse.json({ success: true })
}
