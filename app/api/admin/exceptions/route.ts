import { NextRequest, NextResponse } from "next/server"
import { getOperationalExceptions, reconcileOperationalExceptions } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import type { ExceptionSeverity, ExceptionStatus } from "@/lib/db"

const VALID_STATUS: ExceptionStatus[] = ["open", "acknowledged", "resolved"]
const VALID_SEVERITY: ExceptionSeverity[] = ["low", "medium", "high", "critical"]

export async function GET(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  // Keep the table in sync with real order/lead state on every read —
  // cheap (two existing list queries), no separate cron needed.
  await reconcileOperationalExceptions()

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get("status")
  const severity = searchParams.get("severity")

  const filters: { status?: ExceptionStatus; severity?: ExceptionSeverity } = {}
  if (status && VALID_STATUS.includes(status as ExceptionStatus)) filters.status = status as ExceptionStatus
  if (severity && VALID_SEVERITY.includes(severity as ExceptionSeverity)) filters.severity = severity as ExceptionSeverity

  return NextResponse.json(await getOperationalExceptions(filters))
}
