import { NextResponse } from "next/server"
import { getAllOrders } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  return NextResponse.json(await getAllOrders())
}
