import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

function auth(req: NextRequest) {
  return req.cookies.get("admin_session")?.value
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const updates: Record<string, unknown> = {}
  if (body.name            !== undefined) updates.name            = body.name
  if (body.product         !== undefined) updates.product         = body.product
  if (body.commission      !== undefined) updates.commission      = parseFloat(body.commission)
  if (body.commission_type !== undefined) updates.commission_type = body.commission_type
  if (body.description     !== undefined) updates.description     = body.description
  if (body.image_url       !== undefined) updates.image_url       = body.image_url
  if (body.status          !== undefined) updates.status          = body.status
  if (body.cost_price      !== undefined) updates.cost_price      = parseFloat(body.cost_price)
  if (body.cod_price       !== undefined) updates.cod_price       = parseFloat(body.cod_price)
  if (body.category        !== undefined) updates.category        = body.category
  if (body.countries       !== undefined) updates.countries       = body.countries
  if (body.stock_status    !== undefined) updates.stock_status    = body.stock_status
  if (body.shipping_days   !== undefined) updates.shipping_days   = parseInt(body.shipping_days)

  await sb.from("affiliate_offers").update(updates).eq("id", id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })
  await sb.from("affiliate_offers").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
