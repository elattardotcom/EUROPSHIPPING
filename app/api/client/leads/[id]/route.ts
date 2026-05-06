import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ["CONFIRMED", "PENDING", "UNREACHED", "CANCELED", "ERROR"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  // Verify lead belongs to this client
  const { data: lead } = await sb
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientId)
    .single()

  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 })

  // Update attempts if UNREACHED
  const updates: Record<string, unknown> = { status }
  if (status === "UNREACHED") {
    updates.attempts = (lead.attempts ?? 0) + 1
  }

  await sb.from("leads").update(updates).eq("id", id)

  // If confirmed → create order
  if (status === "CONFIRMED") {
    const orderId = `order_${id}`
    await sb.from("orders").upsert({
      id:             orderId,
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
