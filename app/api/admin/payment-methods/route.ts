import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Service unavailable" }, { status: 503 })

  const { data, error } = await sb
    .from("payment_methods")
    .select(`
      id, client_id, type, label,
      iban, bic, account_holder,
      wise_email, wise_currency,
      crypto_network, crypto_address,
      is_default, created_at
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch client names
  const clientIds = [...new Set((data ?? []).map(r => r.client_id))]
  const { data: clients } = await sb
    .from("clients")
    .select("id, first_name, last_name, email")
    .in("id", clientIds)

  const clientMap = new Map((clients ?? []).map(c => [
    c.id,
    { name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(), email: c.email ?? "" }
  ]))

  const result = (data ?? []).map(r => ({
    id:            r.id,
    clientId:      r.client_id,
    clientName:    clientMap.get(r.client_id)?.name  ?? "—",
    clientEmail:   clientMap.get(r.client_id)?.email ?? "—",
    type:          r.type,
    label:         r.label,
    iban:          r.iban           ?? null,
    bic:           r.bic            ?? null,
    accountHolder: r.account_holder ?? null,
    wiseEmail:     r.wise_email     ?? null,
    wiseCurrency:  r.wise_currency  ?? null,
    cryptoNetwork: r.crypto_network ?? null,
    cryptoAddress: r.crypto_address ?? null,
    isDefault:     r.is_default     ?? false,
    createdAt:     r.created_at     ?? null,
  }))

  return NextResponse.json(result)
}
