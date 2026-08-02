import { NextRequest, NextResponse } from "next/server"
import { updateOrder } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase"

const VALID_STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "RETURNED", "ERROR"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const { status, trackingNumber } = body as { status?: string; trackingNumber?: string }

  if (status && !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updated = await updateOrder(id, {
    status:         status as OrderStatus | undefined,
    trackingNumber: trackingNumber,
  })

  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 })

  // If returned → increment stock back
  if (status === "RETURNED") {
    try {
      const sb = getSupabaseAdmin()
      if (sb) {
        const { data: order } = await sb.from("orders").select("client_id, product").eq("id", id).single()
        if (order?.client_id && order?.product) {
          const { data: stores } = await sb.from("stores").select("id").eq("client_id", order.client_id)
          if (stores?.length) {
            const storeIds = stores.map((s: { id: string }) => s.id)
            const { data: product } = await sb
              .from("products").select("id, stock")
              .in("store_id", storeIds)
              .ilike("title", order.product)
              .single()
            if (product && product.stock !== null) {
              await sb.from("products").update({ stock: (product.stock as number) + 1 }).eq("id", product.id)
            }
          }
        }
      }
    } catch { /* silent */ }
  }

  return NextResponse.json(updated)
}
