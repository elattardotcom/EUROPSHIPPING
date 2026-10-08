import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])
  const [offersRes, countsRes] = await Promise.all([
    sb.from("affiliate_offers").select("*").order("created_at", { ascending: false }),
    sb.from("client_product_activations").select("offer_id"),
  ])
  const countMap: Record<string, number> = {}
  for (const row of countsRes.data ?? []) {
    countMap[row.offer_id] = (countMap[row.offer_id] ?? 0) + 1
  }
  const offers = (offersRes.data ?? []).map(o => ({ ...o, activation_count: countMap[o.id] ?? 0 }))
  return NextResponse.json(offers)
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })
  const body = await req.json()
  const { data, error } = await sb.from("affiliate_offers").insert({
    name:            body.name,
    product:         body.product ?? null,
    commission:      parseFloat(body.commission ?? 0),
    commission_type: body.commission_type ?? "percent",
    description:     body.description ?? null,
    image_url:       body.image_url ?? null,
    status:          body.status ?? "active",
    cost_price:      parseFloat(body.cost_price ?? 0),
    cod_price:       parseFloat(body.cod_price ?? 0),
    category:        body.category ?? "Général",
    countries:       body.countries ?? [],
    stock_status:    body.stock_status ?? "available",
    shipping_days:   parseInt(body.shipping_days ?? 5),
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
