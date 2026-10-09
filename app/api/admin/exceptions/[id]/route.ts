import { NextRequest, NextResponse } from "next/server"
import { updateExceptionStatus } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminEmail, logAdminAction } from "@/lib/audit-log"
import type { ExceptionStatus } from "@/lib/db"

const VALID_STATUS: ExceptionStatus[] = ["open", "acknowledged", "resolved"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params

  const { status } = await req.json().catch(() => ({})) as { status?: string }
  if (!status || !VALID_STATUS.includes(status as ExceptionStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const adminEmail = (await getAdminEmail()) ?? "unknown"
  const updated = await updateExceptionStatus(id, status as ExceptionStatus, adminEmail)
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 })

  await logAdminAction(adminEmail, `exception_${status}`, "operational_exception", id, { type: updated.type, entityId: updated.entityId })

  return NextResponse.json(updated)
}
