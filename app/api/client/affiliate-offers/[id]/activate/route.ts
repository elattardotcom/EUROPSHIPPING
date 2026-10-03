import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

function clientId(req: NextRequest) {
  return req.cookies.get("client_id")?.value
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cid = clientId(req)
  if (!cid) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id: offerId } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB error" }, { status: 500 })

  const { error } = await sb.from("client_product_activations").upsert(
    { client_id: cid, offer_id: offerId },
    { onConflict: "client_id,offer_id" }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cid = clientId(req)
  if (!cid) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id: offerId } = await params
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB error" }, { status: 500 })

  await sb.from("client_product_activations")
    .delete()
    .eq("client_id", cid)
    .eq("offer_id", offerId)
  return NextResponse.json({ ok: true })
}
