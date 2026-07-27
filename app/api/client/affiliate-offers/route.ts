import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  if (!req.cookies.get("client_id")?.value)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])
  const { data } = await sb
    .from("affiliate_offers")
    .select("*")
    .neq("status", "ended")
    .order("created_at", { ascending: false })
  return NextResponse.json(data ?? [])
}
