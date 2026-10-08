import { NextRequest, NextResponse } from "next/server"
import { getBalanceSummary, getClientWithdrawals } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const cookieClientId = req.cookies.get("client_id")?.value
  if (!cookieClientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  if (cookieClientId !== clientId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  const [summary, withdrawals] = await Promise.all([
    getBalanceSummary(clientId),
    getClientWithdrawals(clientId),
  ])
  return NextResponse.json({
    balance:      summary.available,   // backward-compat
    grossRevenue: summary.grossRevenue,
    approved:     summary.approved,
    pending:      summary.pending,
    withdrawals,
  })
}
