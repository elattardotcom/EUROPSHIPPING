import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { MOCK_CLIENT }     from "@/lib/mock-data"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value

  if (!clientId || clientId === "c1") {
    return NextResponse.json(MOCK_CLIENT)
  }

  const sb = getSupabaseAdmin()
  if (sb) {
    const { data } = await sb.from("clients").select("*").eq("id", clientId).single()
    if (data) {
      return NextResponse.json({
        id:          data.id,
        firstName:   data.first_name   ?? "",
        lastName:    data.last_name    ?? "",
        email:       data.email        ?? "",
        phone:       data.phone        ?? "",
        company:     data.company      ?? "",
        country:     data.country      ?? "",
        countryCode: data.country_code ?? "",
        plan:        data.plan         ?? "starter",
        status:      data.status       ?? "trial",
        avatarColor: data.avatar_color ?? "from-orange-500 to-red-600",
      })
    }
  }

  // Client ID is set but not found anywhere — session is stale
  return NextResponse.json({ error: "Session invalide" }, { status: 401 })
}
