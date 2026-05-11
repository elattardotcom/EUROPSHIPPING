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

  return NextResponse.json({ success: true, action: "approved", clientId })
}
