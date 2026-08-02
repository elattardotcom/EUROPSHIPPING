import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

const AVATAR_COLORS = [
  "from-orange-500 to-red-600", "from-teal-500 to-emerald-600",
  "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600",
  "from-pink-500 to-rose-600", "from-indigo-500 to-purple-600",
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action, adminNote } = await req.json().catch(() => ({})) as {
    action: "approve" | "reject"
    adminNote?: string
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Service unavailable" }, { status: 503 })

  // Fetch the pending request
  const { data: regReq, error: fetchErr } = await sb
    .from("registration_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr)  return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!regReq)   return NextResponse.json({ error: "Request not found" }, { status: 404 })
  if (regReq.status !== "pending") return NextResponse.json({ error: "Already processed" }, { status: 409 })

  if (action === "reject") {
    await sb.from("registration_requests")
      .update({ status: "rejected", admin_note: adminNote ?? null })
      .eq("id", id)
    return NextResponse.json({ success: true, action: "rejected" })
  }

  // ── Approve: create the client ──────────────────────────────
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  // Insert without password_hash first (avoids "no rows returned" if column differs)
  const { error: insertErr } = await sb.from("clients").insert({
    first_name:      regReq.first_name,
    last_name:       regReq.last_name,
    email:           regReq.email,
    phone:           regReq.phone        ?? "",
    company:         regReq.company      ?? "",
    country:         regReq.country      ?? "",
    country_code:    regReq.country_code ?? "",
    plan:            "starter",
    status:          "trial",
    joined_at:       new Date().toISOString(),
    monthly_revenue: 0,
    total_revenue:   0,
    stores_count:    0,
    orders_count:    0,
    leads_count:     0,
    last_active:     new Date().toISOString(),
    avatar_color:    avatarColor,
  })

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Fetch the newly created client id
  const { data: newClient } = await sb
    .from("clients")
    .select("id")
    .eq("email", regReq.email)
    .maybeSingle()

  const clientId = newClient?.id ?? null

  if (clientId) {
    // Try storing password_hash in clients row (column added via migration)
    await sb.from("clients")
      .update({ password_hash: regReq.password_hash })
      .eq("id", clientId)

    // Always upsert into auth_credentials as fallback
    try {
      await sb.from("auth_credentials").upsert(
        { client_id: clientId, email: regReq.email, hash: regReq.password_hash },
        { onConflict: "email" }
      )
    } catch { /* table may not exist — clients.password_hash is enough */ }
  }

  // Mark request approved
  await sb.from("registration_requests")
    .update({ status: "approved", admin_note: adminNote ?? null })
    .eq("id", id)

  // Send approval email to the client
  const apiKey  = process.env.RESEND_API_KEY
  const from    = process.env.RESEND_FROM_EMAIL ?? "CODShipEurope <contact@codshipeurope.com>"
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"
  if (apiKey && !apiKey.startsWith("re_xxx")) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [regReq.email],
        subject: "✅ Your CODShipEurope account has been approved — Log in now",
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">
  <tr><td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:28px 36px">
    <p style="margin:0;color:#fff;font-size:20px;font-weight:800">CODShipEurope</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:11px;text-transform:uppercase;letter-spacing:1px">COD Platform Europe</p>
  </td></tr>
  <tr><td style="padding:36px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;width:56px;height:56px;background:rgba(16,185,129,0.1);border:2px solid rgba(16,185,129,0.3);border-radius:50%;line-height:56px;font-size:28px">✅</div>
    </div>
    <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700;text-align:center">Hello ${regReq.first_name ?? ""} !</p>
    <p style="margin:0 0 24px;color:#888;font-size:14px;line-height:1.7;text-align:center">
      Your <strong style="color:#fff">CODShipEurope</strong> account has been <strong style="color:#10b981">approved</strong>.<br/>
      You can now log in and start selling COD across Europe.
    </p>
    <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:600">🚀 Get started in 3 steps:</p>
      <p style="margin:0 0 8px;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">1.</span> Log in with your email and password</p>
      <p style="margin:0 0 8px;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">2.</span> Connect your Shopify store in 5 minutes</p>
      <p style="margin:0;color:#888;font-size:13px"><span style="color:#f97316;font-weight:700">3.</span> Launch your campaigns — orders sync automatically</p>
    </div>
    <div style="text-align:center">
      <a href="${baseUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;text-decoration:none">
        Go to my dashboard →
      </a>
    </div>
    <p style="margin:24px 0 0;color:#555;font-size:12px;text-align:center">
      Questions? <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a>
    </p>
  </td></tr>
  <tr><td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
    <p style="margin:0;color:#444;font-size:11px">© 2025 CODShipEurope · <a href="${baseUrl}" style="color:#f97316;text-decoration:none">www.codshipeurope.com</a></p>
  </td></tr>
</table></td></tr></table></body></html>`,
      }),
    }).catch(err => console.error("[approval-email]", err))
  }

  return NextResponse.json({ success: true, action: "approved", clientId })
}
