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
