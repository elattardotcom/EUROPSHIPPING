import { NextResponse } from "next/server"
import { getFinanceLedger } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

// O(clients) — fetched on demand by the Finance page, not on a poll.
export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const ledger = await getFinanceLedger()
  return NextResponse.json(ledger)
}
