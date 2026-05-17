import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const adminSession = req.cookies.get("admin_session")?.value
  if (!adminSession) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data } = await sb
    .from("sourcing_requests")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}
