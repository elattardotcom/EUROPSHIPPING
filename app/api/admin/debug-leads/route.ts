import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" })

  const { data: leads, error } = await sb
    .from("leads")
    .select("id, client_id, customer_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: stores } = await sb
    .from("stores")
    .select("id, domain, client_id, name")

  const { data: clients } = await sb
    .from("clients")
    .select("id, first_name, last_name")

  return NextResponse.json({ leads, leadsError: error?.message, stores, clients })
}
