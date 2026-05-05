import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré" })

  const { data: clients, error: ce } = await sb.from("clients").select("id, email").limit(3)
  const { data: adj,     error: ae } = await sb.from("balance_adjustments").select("*").limit(3)

  // Test insert
  const { data: inserted, error: ie } = await sb
    .from("balance_adjustments")
    .insert({ client_id: "test", amount: 1, reason: "debug test" })
    .select().single()

  // Clean up test
  if (inserted?.id) await sb.from("balance_adjustments").delete().eq("id", inserted.id)

  return NextResponse.json({
    supabase: "connecté",
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    clients:  ce ? { error: ce.message } : clients,
    balance_adjustments_read:   ae ? { error: ae.message } : adj,
    balance_adjustments_insert: ie ? { error: ie.message } : "OK",
  })
}
