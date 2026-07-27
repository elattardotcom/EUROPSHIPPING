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
  if (body.name          !== undefined) updates.name          = body.name
  if (body.supplier      !== undefined) updates.supplier      = body.supplier
  if (body.cost_price    !== undefined) updates.cost_price    = parseFloat(body.cost_price)
  if (body.selling_price !== undefined) updates.selling_price = parseFloat(body.selling_price)
  if (body.stock         !== undefined) updates.stock         = parseInt(body.stock)
  if (body.category      !== undefined) updates.category      = body.category
  if (body.shipping_days !== undefined) updates.shipping_days = body.shipping_days
  if (body.image_url     !== undefined) updates.image_url     = body.image_url
  if (body.description   !== undefined) updates.description   = body.description
  if (body.status        !== undefined) updates.status        = body.status

  await sb.from("cod_products").update(updates).eq("id", id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })
  await sb.from("cod_products").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
