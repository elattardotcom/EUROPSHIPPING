import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  // Get client's store IDs
  const { data: stores } = await sb
    .from("stores")
    .select("id, name, domain")
    .eq("client_id", clientId)

  if (!stores || stores.length === 0) return NextResponse.json([])

  const storeIds = stores.map(s => s.id)
  const storeMap = Object.fromEntries(stores.map(s => [s.id, s]))

  const { data: products, error } = await sb
    .from("products")
    .select("*")
    .in("store_id", storeIds)
    .order("updated_at", { ascending: false })

  if (error || !products) return NextResponse.json([])

  return NextResponse.json(products.map(p => ({
    id:        p.id,
    shopifyId: p.shopify_id,
    title:     p.title,
    imageUrl:  p.image_url,
    price:     p.price,
    currency:  p.currency ?? "EUR",
    stock:     p.stock ?? null,
    storeId:   p.store_id,
    storeName: storeMap[p.store_id]?.name ?? "",
    domain:    storeMap[p.store_id]?.domain ?? "",
    updatedAt: p.updated_at,
  })))
}
