import { NextRequest, NextResponse } from "next/server"
import { readClients }  from "@/lib/clients-store"
import { getSupabase }  from "@/lib/supabase"
import { MOCK_CLIENT }  from "@/lib/mock-data"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value

  if (!clientId || clientId === "c1") {
    return NextResponse.json(MOCK_CLIENT)
  }

  const sb = getSupabase()
  if (sb) {
    const { data } = await sb.from("clients").select("*").eq("id", clientId).single()
    if (data) {
      return NextResponse.json({
        id:          data.id,
        firstName:   data.first_name  ?? "",
        lastName:    data.last_name   ?? "",
        email:       data.email       ?? "",
        phone:       data.phone       ?? "",
        company:     data.company     ?? "",
        country:     data.country     ?? "",
        countryCode: data.country_code ?? "",
        plan:        data.plan        ?? "starter",
        status:      data.status      ?? "active",
        avatarColor: data.avatar_color ?? "from-orange-500 to-red-600",
      })
    }
  }

  const client = readClients().find(c => c.id === clientId)
  return NextResponse.json(client ?? MOCK_CLIENT)
}
