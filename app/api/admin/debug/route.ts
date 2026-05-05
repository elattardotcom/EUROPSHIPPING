import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non configuré" })

  const { data: clients }  = await sb.from("clients").select("id, email").limit(5)
  const { data: stores, error: se }   = await sb.from("stores").select("id, name, domain, status, client_id").limit(10)
  const { data: products, error: pe } = await sb.from("products").select("id, title, store_id").limit(10)

  return NextResponse.json({
    supabase: "connecté",
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    clients,
    stores:   se ? { error: se.message } : stores,
    products: pe ? { error: pe.message } : products,
  })
}
