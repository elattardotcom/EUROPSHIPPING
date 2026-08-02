import { NextRequest, NextResponse } from "next/server"
import { getInvoicePreview } from "@/lib/db"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const preview = await getInvoicePreview(clientId)
  return NextResponse.json(preview)
}
