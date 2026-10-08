import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data } = await sb
    .from("sourcing_requests")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}
