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

  // Fetch the request
  const { data: req_, error: fetchErr } = await sb
    .from("registration_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchErr || !req_) return NextResponse.json({ error: "Request not found" }, { status: 404 })
  if (req_.status !== "pending") return NextResponse.json({ error: "Already processed" }, { status: 409 })

  if (action === "reject") {
    await sb.from("registration_requests").update({ status: "rejected", admin_note: adminNote ?? null }).eq("id", id)
    return NextResponse.json({ success: true, action: "rejected" })
  }

  // Approve: create the client account
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const { data: client, error: clientErr } = await sb.from("clients").insert({
    first_name:      req_.first_name,
    last_name:       req_.last_name,
    email:           req_.email,
    phone:           req_.phone        ?? "",
    company:         req_.company      ?? "",
    country:         req_.country      ?? "",
    country_code:    req_.country_code ?? "",
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
    password_hash:   req_.password_hash,
  }).select().single()

  if (clientErr || !client) {
    return NextResponse.json({ error: clientErr?.message ?? "Failed to create client" }, { status: 500 })
  }

  // password_hash is already stored in the clients row (inserted above)
  // Also upsert into auth_credentials table as a fallback index
  try {
    await sb.from("auth_credentials").upsert(
      { client_id: client.id, email: req_.email, hash: req_.password_hash },
      { onConflict: "email" }
    )
  } catch { /* table may not exist */ }

  // Mark request approved
  await sb.from("registration_requests").update({ status: "approved", admin_note: adminNote ?? null }).eq("id", id)

  return NextResponse.json({ success: true, action: "approved", clientId: client.id })
}
