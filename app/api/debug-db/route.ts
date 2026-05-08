import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "No Supabase client" })

  // Test 1: can we read the payment_methods table?
  const { data: rows, error: readErr } = await sb
    .from("payment_methods")
    .select("id")
    .limit(1)

  // Test 2: try a minimal insert
  const { data: inserted, error: insertErr } = await sb
    .from("payment_methods")
    .insert({
      client_id:  "debug_test",
      type:       "bank",
      label:      "Debug Test",
      is_default: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  // Clean up if insert succeeded
  if (inserted?.id) {
    await sb.from("payment_methods").delete().eq("id", inserted.id)
  }

  return NextResponse.json({
    supabaseUrl:   process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(hardcoded default)",
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    readError:     readErr  ? JSON.stringify(readErr)  : null,
    insertError:   insertErr ? JSON.stringify(insertErr) : null,
    insertOk:      !!inserted,
  })
}
