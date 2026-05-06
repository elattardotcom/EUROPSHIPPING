import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "not_authenticated" }, { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ products: [], hasStore: false })

  const { data: stores } = await sb
    .from("stores")
    .select("id, name, domain, access_token")
    .eq("client_id", clientId)

  const hasStore = !!(stores && stores.length > 0)

  if (!hasStore) return NextResponse.json({ products: [], hasStore: false })

  const storeIds = stores!.map(s => s.id)
  const storeMap = Object.fromEntries(stores!.map(s => [s.id, s]))

  const { data: products } = await sb
    .from("products")
    .select("*")
    .in("store_id", storeIds)
    .order("updated_at", { ascending: false })

  const list = products ?? []

  return NextResponse.json({
    hasStore: true,
    stores: stores!.map(s => ({ id: s.id, name: s.name, domain: s.domain })),
    products: list.map(p => ({
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
    })),
  })
}
