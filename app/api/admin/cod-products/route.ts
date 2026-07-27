import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

function auth(req: NextRequest) {
  return req.cookies.get("admin_session")?.value
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])
  const { data } = await sb.from("cod_products").select("*").order("created_at", { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })
  const body = await req.json()
  const { data, error } = await sb.from("cod_products").insert({
    name:          body.name,
    supplier:      body.supplier ?? null,
    cost_price:    parseFloat(body.cost_price ?? 0),
    selling_price: parseFloat(body.selling_price ?? 0),
    stock:         parseInt(body.stock ?? 0),
    category:      body.category ?? null,
    shipping_days: body.shipping_days ?? null,
    image_url:     body.image_url ?? null,
    description:   body.description ?? null,
    status:        body.status ?? "active",
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
