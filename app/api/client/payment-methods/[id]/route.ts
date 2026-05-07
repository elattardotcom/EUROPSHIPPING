import { NextRequest, NextResponse } from "next/server"
import { deletePaymentMethod, setDefaultPaymentMethod } from "@/lib/db"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  const ok = await deletePaymentMethod(params.id, clientId)
  if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  const { isDefault } = await req.json()
  if (isDefault) {
    const ok = await setDefaultPaymentMethod(params.id, clientId)
    if (!ok) return NextResponse.json({ error: "Erreur" }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
