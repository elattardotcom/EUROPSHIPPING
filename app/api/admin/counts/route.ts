import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const sb = getSupabase()
    if (!sb) return NextResponse.json({ clients: 0, orders: 0, leads: 0, withdrawals: 0 })

    const [
      { count: clients },
      { count: orders },
      { count: leads },
      { count: withdrawals },
    ] = await Promise.all([
      sb.from("clients").select("*", { count: "exact", head: true }),
      sb.from("orders").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      sb.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
      sb.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

    return NextResponse.json({
      clients:     clients     ?? 0,
      orders:      orders      ?? 0,
      leads:       leads       ?? 0,
      withdrawals: withdrawals ?? 0,
    })
  } catch {
    return NextResponse.json({ clients: 0, orders: 0, leads: 0, withdrawals: 0 })
  }
}
