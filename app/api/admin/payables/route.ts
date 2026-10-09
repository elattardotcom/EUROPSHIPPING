import { NextResponse } from "next/server"
import { getMerchantPayablesTotal } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

// O(clients) — fetched on demand by the Overview page, not on its 30s poll.
export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const total = await getMerchantPayablesTotal()
  return NextResponse.json({ total })
}
