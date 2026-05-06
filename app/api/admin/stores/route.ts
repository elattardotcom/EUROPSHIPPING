import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data: stores } = await sb
    .from("stores")
    .select("id, name, domain, status, last_sync, client_id")
    .order("last_sync", { ascending: false })

  const { data: clients } = await sb
    .from("clients")
    .select("id, first_name, last_name, email")

  const { data: orders } = await sb
    .from("orders")
    .select("client_id, created_at")

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const result = (stores ?? []).map(s => {
    const client = (clients ?? []).find(c => c.id === s.client_id)
    const storeOrders = (orders ?? []).filter(o => o.client_id === s.client_id)
    const ordersToday = storeOrders.filter(o => o.created_at >= todayStart).length
    return {
      id:           s.id,
      name:         s.name,
      domain:       s.domain,
      status:       s.status ?? "connected",
      lastSync:     s.last_sync,
      clientId:     s.client_id,
      clientName:   client ? `${client.first_name} ${client.last_name}`.trim() : "—",
      clientEmail:  client?.email ?? "",
      ordersToday,
      totalOrders:  storeOrders.length,
    }
  })

  return NextResponse.json(result)
}
