import { NextRequest, NextResponse } from "next/server"
import { updateOrder } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"

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
  return NextResponse.json(updated)
}
