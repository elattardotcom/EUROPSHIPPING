import { NextRequest, NextResponse } from "next/server"
import { getProviders, createProvider } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminEmail, logAdminAction } from "@/lib/audit-log"

const VALID_STATUS = ["active", "inactive", "pending"]

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  return NextResponse.json(await getProviders())
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => ({}))
  const { name, serviceType, countries, status, notes } = body as {
    name?: string; serviceType?: string; countries?: unknown; status?: string; notes?: string
  }

  if (!name || !name.trim())         return NextResponse.json({ error: "Name is required" }, { status: 400 })
  if (!serviceType || !serviceType.trim()) return NextResponse.json({ error: "Service type is required" }, { status: 400 })
  if (status && !VALID_STATUS.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  if (countries !== undefined && !Array.isArray(countries)) return NextResponse.json({ error: "countries must be an array" }, { status: 400 })

  const provider = await createProvider({
    name: name.trim(),
    serviceType: serviceType.trim(),
    countries: Array.isArray(countries) ? countries.map(String) : [],
    status: status ?? "pending",
    notes,
  })
  if (!provider) return NextResponse.json({ error: "Failed to create provider" }, { status: 500 })

  const adminEmail = await getAdminEmail()
  if (adminEmail) await logAdminAction(adminEmail, "provider_create", "provider", provider.id, { name: provider.name, serviceType: provider.serviceType })

  return NextResponse.json(provider, { status: 201 })
}
