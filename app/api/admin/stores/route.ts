import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  // last_sync_status/last_error may not exist yet (pre-migration) — fall
  // back to the base columns rather than erroring the whole page.
  let stores: { id: string; name: string; domain: string; status: string; last_sync: string; client_id: string; last_sync_status?: string; last_error?: string }[] | null = null
  {
    const { data, error } = await sb
      .from("stores")
      .select("id, name, domain, status, last_sync, client_id, last_sync_status, last_error")
      .order("last_sync", { ascending: false })
    if (error) {
      const fallback = await sb
        .from("stores")
        .select("id, name, domain, status, last_sync, client_id")
        .order("last_sync", { ascending: false })
      stores = fallback.data
    } else {
      stores = data
    }
  }

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
      lastSyncStatus: s.last_sync_status ?? null,
      lastError:      s.last_error ?? null,
    }
  })

  return NextResponse.json(result)
}
