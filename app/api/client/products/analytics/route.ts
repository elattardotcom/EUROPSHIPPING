import { NextRequest, NextResponse } from "next/server"
import { getClientOrders, getClientLeads } from "@/lib/db"

export interface ProductStat {
  product:          string
  totalOrders:      number
  deliveredOrders:  number
  returnedOrders:   number
  pendingOrders:    number
  revenue:          number
  totalLeads:       number
  confirmedLeads:   number
  canceledLeads:    number
  deliveryRate:     number
  returnRate:       number
  confirmationRate: number
}

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const [orders, leads] = await Promise.all([
    getClientOrders(clientId),
    getClientLeads(clientId),
  ])

  const map = new Map<string, ProductStat>()

  const get = (name: string): ProductStat => {
    if (!map.has(name)) map.set(name, {
      product: name, totalOrders: 0, deliveredOrders: 0, returnedOrders: 0,
      pendingOrders: 0, revenue: 0, totalLeads: 0, confirmedLeads: 0,
      canceledLeads: 0, deliveryRate: 0, returnRate: 0, confirmationRate: 0,
    })
    return map.get(name)!
  }

  for (const o of orders) {
    const s = get(o.product)
    s.totalOrders++
    if (o.status === "DELIVERED") { s.deliveredOrders++; s.revenue += o.value }
    else if (o.status === "RETURNED") s.returnedOrders++
    else if (o.status === "PENDING" || o.status === "SHIPPED") s.pendingOrders++
  }

  for (const l of leads) {
    const s = get(l.product)
    s.totalLeads++
    if (l.status === "CONFIRMED") s.confirmedLeads++
    else if (l.status === "CANCELED") s.canceledLeads++
  }

  for (const s of map.values()) {
    s.deliveryRate     = s.totalOrders > 0 ? Math.round(s.deliveredOrders / s.totalOrders * 100) : 0
    s.returnRate       = s.totalOrders > 0 ? Math.round(s.returnedOrders  / s.totalOrders * 100) : 0
    s.confirmationRate = s.totalLeads  > 0 ? Math.round(s.confirmedLeads  / s.totalLeads  * 100) : 0
  }

  const stats = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
  return NextResponse.json(stats)
}
