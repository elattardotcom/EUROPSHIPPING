import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

const VALID = ["PENDING", "PROCESSING", "SHIPPED", "RECEIVED", "CANCELED"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSession = req.cookies.get("admin_session")?.value
  if (!adminSession) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status, admin_reply } = body

  if (status !== undefined && !VALID.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (admin_reply !== undefined) updates.admin_reply = admin_reply

  await sb.from("sourcing_requests").update(updates).eq("id", id)
  return NextResponse.json({ ok: true })
}
