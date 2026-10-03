import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const cid = req.cookies.get("client_id")?.value
  if (!cid) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const [offersRes, activationsRes] = await Promise.all([
    sb.from("affiliate_offers").select("*").neq("status", "ended").order("created_at", { ascending: false }),
    sb.from("client_product_activations").select("offer_id").eq("client_id", cid),
  ])

  const activatedIds = new Set((activationsRes.data ?? []).map(a => a.offer_id))
  const offers = (offersRes.data ?? []).map(o => ({ ...o, activated: activatedIds.has(o.id) }))
  return NextResponse.json(offers)
}
