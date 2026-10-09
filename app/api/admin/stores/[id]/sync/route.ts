import { NextRequest, NextResponse } from "next/server"
import { syncShopifyStore } from "@/lib/shopify-sync"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminEmail, logAdminAction } from "@/lib/audit-log"

export const maxDuration = 60

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params

  const origin = new URL(req.url).origin
  const result = await syncShopifyStore(id, origin)
  if (!result) return NextResponse.json({ error: "Store not found or not connected" }, { status: 404 })

  const adminEmail = await getAdminEmail()
  if (adminEmail) {
    await logAdminAction(adminEmail, "store_sync_retry", "store", id, {
      products: result.products, orders: result.orders, errors: result.errors,
    })
  }

  return NextResponse.json(result)
}
