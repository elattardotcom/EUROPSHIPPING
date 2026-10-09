import { NextRequest, NextResponse } from "next/server"
import { updateProvider, deleteProvider } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminEmail, logAdminAction } from "@/lib/audit-log"

const VALID_STATUS = ["active", "inactive", "pending"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params

  const body = await req.json().catch(() => ({}))
  const { name, serviceType, countries, status, notes } = body as {
    name?: string; serviceType?: string; countries?: unknown; status?: string; notes?: string
  }

  if (status && !VALID_STATUS.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  if (countries !== undefined && !Array.isArray(countries)) return NextResponse.json({ error: "countries must be an array" }, { status: 400 })

  const provider = await updateProvider(id, {
    name, serviceType, status, notes,
    countries: Array.isArray(countries) ? countries.map(String) : undefined,
  })
  if (!provider) return NextResponse.json({ error: "Update failed" }, { status: 500 })

  const adminEmail = await getAdminEmail()
  if (adminEmail) await logAdminAction(adminEmail, "provider_update", "provider", id, { name, serviceType, status })

  return NextResponse.json(provider)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params
  const ok = await deleteProvider(id)
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 })

  const adminEmail = await getAdminEmail()
  if (adminEmail) await logAdminAction(adminEmail, "provider_delete", "provider", id)

  return NextResponse.json({ success: true })
}
