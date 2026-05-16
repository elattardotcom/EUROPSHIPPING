import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

const VALID = ["CONFIRMED", "PENDING", "UNREACHED", "CANCELED", "ERROR"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSession = req.cookies.get("admin_session")?.value
  if (!adminSession) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const { data: lead } = await sb.from("leads").select("*").eq("id", id).single()
  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 })

  const updates: Record<string, unknown> = { status }
  if (status === "UNREACHED") updates.attempts = (lead.attempts ?? 0) + 1

  await sb.from("leads").update(updates).eq("id", id)

  if (status === "CONFIRMED") {
    await sb.from("orders").upsert({
      id:             `order_${id}`,
      client_id:      lead.client_id,
      client_name:    lead.client_name,
      customer_name:  lead.customer_name,
      customer_phone: lead.customer_phone,
      country:        lead.country,
      country_code:   lead.country_code,
      product:        lead.product,
      value:          lead.value,
      currency:       lead.currency ?? "EUR",
      status:         "PENDING",
      store:          lead.store,
      created_at:     new Date().toISOString(),
    }, { onConflict: "id" })
  }

  return NextResponse.json({ ok: true, status })
}
