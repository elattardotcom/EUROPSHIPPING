import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { sendEmail, emailShell, ADMIN_NOTIFICATION_EMAIL } from "@/lib/resend"

function clientId(req: NextRequest) {
  return req.cookies.get("client_id")?.value
}

async function sendActivationNotification(opts: { clientName: string; clientEmail: string; offerName: string; codPrice: number; commission: number; commissionType: string }) {
  const bodyHtml = `
    <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700">New product activation</p>
    <p style="margin:0 0 28px;color:#888;font-size:14px;line-height:1.7">
      A client just activated a product from the affiliate catalogue and is ready to start selling it.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:28px">
      <tr style="background:rgba(255,255,255,0.03)">
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Client</td>
        <td style="padding:14px 18px;color:#fff;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">${opts.clientName} (${opts.clientEmail})</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Product</td>
        <td style="padding:14px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${opts.offerName}</td>
      </tr>
      <tr style="background:rgba(255,255,255,0.03)">
        <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">COD Price / Commission</td>
        <td style="padding:14px 18px;color:#f97316;font-size:13px;font-weight:700">€${opts.codPrice.toFixed(2)} · ${opts.commission}${opts.commissionType === "percent" ? "%" : "€"}</td>
      </tr>
    </table>
    <p style="margin:0;color:#555;font-size:12px;line-height:1.6">
      Review activations in the
      <a href="https://www.codshipeurope.com/admin/affiliate-offers" style="color:#f97316;text-decoration:none">admin catalogue</a>.
    </p>`

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `Product activated — ${opts.offerName} (${opts.clientName})`,
    html: emailShell({ badgeText: "✓ Product Activated", badgeColor: "green", bodyHtml }),
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cid = clientId(req)
  if (!cid) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id: offerId } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB error" }, { status: 500 })

  const { error } = await sb.from("client_product_activations").upsert(
    { client_id: cid, offer_id: offerId },
    { onConflict: "client_id,offer_id" }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const [{ data: client }, { data: offer }] = await Promise.all([
    sb.from("clients").select("first_name, last_name, email").eq("id", cid).single(),
    sb.from("affiliate_offers").select("name, cod_price, commission, commission_type").eq("id", offerId).single(),
  ])

  if (client && offer) {
    await sendActivationNotification({
      clientName:     `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || client.email,
      clientEmail:    client.email,
      offerName:      offer.name,
      codPrice:       offer.cod_price ?? 0,
      commission:     offer.commission ?? 0,
      commissionType: offer.commission_type ?? "percent",
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cid = clientId(req)
  if (!cid) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id: offerId } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB error" }, { status: 500 })

  await sb.from("client_product_activations")
    .delete()
    .eq("client_id", cid)
    .eq("offer_id", offerId)
  return NextResponse.json({ ok: true })
}
