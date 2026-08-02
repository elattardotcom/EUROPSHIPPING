import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "No Supabase admin client" })

  // Read clients with last_login_at
  const { data, error: readErr } = await sb
    .from("clients")
    .select("id, email, last_login_at")
    .limit(10)

  // Try updating one row to test if column exists
  const { data: first } = await sb.from("clients").select("id").limit(1).maybeSingle()
  let updateResult: unknown = "no clients found"
  if (first) {
    const { error: updateErr } = await sb
      .from("clients")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", first.id)
    updateResult = updateErr ? { error: updateErr.message, code: updateErr.code } : "OK"
  }

  return NextResponse.json({ clients: data, readError: readErr?.message ?? null, updateResult })
}
