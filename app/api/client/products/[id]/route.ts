import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const { stock } = await req.json()

  if (typeof stock !== "number" || stock < 0) {
    return NextResponse.json({ error: "Stock invalide" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  // Verify product belongs to this client via store
  const { data: product } = await sb
    .from("products")
    .select("id, store_id")
    .eq("id", id)
    .single()

  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })

  const { data: store } = await sb
    .from("stores")
    .select("client_id")
    .eq("id", product.store_id)
    .eq("client_id", clientId)
    .single()

  if (!store) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  await sb.from("products").update({ stock, updated_at: new Date().toISOString() }).eq("id", id)

  return NextResponse.json({ ok: true, stock })
}
