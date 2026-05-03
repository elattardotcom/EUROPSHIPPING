import { NextRequest, NextResponse } from "next/server"
import { getClientById, getClientOrders, getClientLeads, getClientStores } from "@/lib/db"
import { getSupabase } from "@/lib/supabase"
import { readClients, writeClients } from "@/lib/clients-store"

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

  const sb = getSupabase()
  if (sb) {
    const payload: Record<string, string> = {}
    if (plan)   payload.plan   = plan
    if (status) payload.status = status
    const { error } = await sb.from("clients").update(payload).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  const clients = readClients()
  const idx = clients.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ error: "Client introuvable" }, { status: 404 })
  if (plan)   clients[idx].plan   = plan
  if (status) clients[idx].status = status
  writeClients(clients)
  return NextResponse.json({ success: true })
}
