import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "No Supabase admin client" })

  // 1. Get first client
  const { data: first } = await sb.from("clients").select("id, email, last_login_at").limit(1).maybeSingle()
  if (!first) return NextResponse.json({ error: "No clients found" })

  const before = first.last_login_at

  // 2. Write now
  const now = new Date().toISOString()
  const { error: writeErr } = await sb
    .from("clients")
    .update({ last_login_at: now })
    .eq("id", first.id)

  // 3. Read back immediately
  const { data: after } = await sb
    .from("clients")
    .select("id, email, last_login_at")
    .eq("id", first.id)
    .single()

  // 4. Read all clients
  const { data: allClients } = await sb
    .from("clients")
    .select("id, email, last_login_at")

  return NextResponse.json({
    client_id: first.id,
    email: first.email,
    before_update: before,
    write_error: writeErr?.message ?? null,
    after_update: after?.last_login_at ?? null,
    write_persisted: after?.last_login_at === now,
    all_clients: allClients,
  })
}
