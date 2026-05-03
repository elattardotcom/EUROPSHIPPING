import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })

  const sb = getSupabase()
  if (!sb) return NextResponse.json([])

  const { data } = await sb
    .from("stores")
    .select("id, name, domain, status, last_sync, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}
