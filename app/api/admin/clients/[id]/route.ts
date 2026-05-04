import { NextRequest, NextResponse } from "next/server"
import { getClientById, getClientOrders, getClientLeads, getClientStores } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [client, orders, leads, stores] = await Promise.all([
    getClientById(id),
    getClientOrders(id),
    getClientLeads(id),
    getClientStores(id),
  ])
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })
  return NextResponse.json({ client, orders, leads, stores })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { plan, status } = await req.json()

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const payload: Record<string, string> = {}
  if (plan)   payload.plan   = plan
  if (status) payload.status = status

  const { error } = await sb.from("clients").update(payload).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
