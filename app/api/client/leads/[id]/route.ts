import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

async function adjustStock(sb: SupabaseClient, clientId: string, productTitle: string, delta: number) {
  try {
    const { data: stores } = await sb.from("stores").select("id").eq("client_id", clientId)
    if (!stores?.length) return
    const storeIds = stores.map(s => s.id)

    const { data: product } = await sb
      .from("products")
      .select("id, stock")
      .in("store_id", storeIds)
      .ilike("title", productTitle)
      .single()

    if (!product || product.stock === null) return

    const newStock = Math.max(0, (product.stock as number) + delta)
    await sb.from("products").update({ stock: newStock }).eq("id", product.id)
  } catch { /* silent — stock adjustment is best-effort */ }
}

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

  // If confirmed → create order + decrement stock
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

    // Decrement stock on matching product
    await adjustStock(sb, clientId, lead.product, -1)
  }

  return NextResponse.json({ ok: true, status })
}
