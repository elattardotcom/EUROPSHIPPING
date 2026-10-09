import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

const MAX_LIMIT = 200

export async function GET(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const action     = searchParams.get("action")
  const adminEmail = searchParams.get("adminEmail")
  const targetType = searchParams.get("targetType")
  const targetId   = searchParams.get("targetId")
  const from       = searchParams.get("from")
  const to         = searchParams.get("to")
  const limitParam = parseInt(searchParams.get("limit") ?? "100", 10)
  const limit      = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), MAX_LIMIT) : 100

  let query = sb.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)

  if (action)     query = query.eq("action", action)
  if (adminEmail) query = query.eq("admin_email", adminEmail)
  if (targetType) query = query.eq("target_type", targetType)
  if (targetId)   query = query.eq("target_id", targetId)
  if (from)       query = query.gte("created_at", from)
  if (to)         query = query.lte("created_at", to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
