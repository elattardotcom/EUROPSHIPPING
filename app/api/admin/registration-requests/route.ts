import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])
  const { data, error } = await sb
    .from("registration_requests")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data ?? [])
}
