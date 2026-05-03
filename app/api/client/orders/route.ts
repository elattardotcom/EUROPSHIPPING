import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { ALL_ORDERS }  from "@/lib/mock-data"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })

  // Demo client always gets mock data
  if (clientId === "c1") return NextResponse.json(ALL_ORDERS)

  const sb = getSupabase()
  if (!sb) return NextResponse.json([])

  try {
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) throw error

    const orders = (data ?? []).map((r) => {
      const dt = r.created_at ? new Date(r.created_at) : null
      return {
        id:             r.id,
        name:           r.customer_name   ?? "",
        phone:          r.customer_phone  ?? "",
        country:        r.country         ?? "",
        countryCode:    r.country_code    ?? "",
        product:        r.product         ?? "",
        orderValue:     r.value           ?? 0,
        status:         r.status,
        store:          r.store           ?? "",
        trackingNumber: r.tracking_number ?? undefined,
        createdAt:      dt ? dt.toLocaleDateString("fr-FR") : "",
        createdTime:    dt ? dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "",
      }
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json([])
  }
}
