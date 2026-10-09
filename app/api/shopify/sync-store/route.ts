import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin }          from "@/lib/supabase"
import { syncShopifyStore }          from "@/lib/shopify-sync"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { storeId } = await req.json()
  if (!storeId) return NextResponse.json({ error: "storeId requis" }, { status: 400 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const { data: store } = await sb
    .from("stores").select("id, client_id")
    .eq("id", storeId).eq("client_id", clientId).single()
  if (!store) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })

  const origin = new URL(req.url).origin
  const result = await syncShopifyStore(storeId, origin)
  if (!result) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })

  return NextResponse.json(result)
}
