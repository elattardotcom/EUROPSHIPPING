import { NextRequest, NextResponse } from "next/server"
import { getClientAdjustments } from "@/lib/db"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })
  const adjustments = await getClientAdjustments(clientId)
  return NextResponse.json(adjustments)
}
