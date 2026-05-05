import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré", url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "non défini" })

  const { data: clients, error: ce } = await sb.from("clients").select("id, email").limit(5)
  const { data: wd,      error: we } = await sb.from("withdrawals").select("id, status").limit(5)

  return NextResponse.json({
    supabase: "connecté",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    clients:  ce ? { error: ce.message } : clients,
    withdrawals: we ? { error: we.message } : wd,
  })
}
