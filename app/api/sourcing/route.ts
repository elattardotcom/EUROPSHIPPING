import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data } = await sb
    .from("sourcing_requests")
    .select("id,product_name,reference_url,quantity,budget_eur,notes,status,created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const body = await req.json()
  const { product_name, reference_url, quantity, budget_eur, notes } = body

  if (!product_name?.trim()) {
    return NextResponse.json({ error: "Nom du produit requis" }, { status: 400 })
  }

  const { data: client } = await sb.from("clients").select("first_name,last_name").eq("id", clientId).single()
  const client_name = client ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() : ""

  const { error } = await sb.from("sourcing_requests").insert({
    client_id: clientId,
    client_name,
    product_name: product_name.trim(),
    reference_url: reference_url ?? null,
    quantity: quantity ?? null,
    budget_eur: budget_eur ?? null,
    notes: notes ?? null,
    status: "PENDING",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
