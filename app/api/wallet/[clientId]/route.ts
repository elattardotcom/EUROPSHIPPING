import { NextResponse } from "next/server"
import { getBalanceSummary, getClientWithdrawals } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
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
