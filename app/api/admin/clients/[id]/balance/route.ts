import { NextRequest, NextResponse } from "next/server"
import { createAdjustment, getClientAdjustments } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params
  const adjustments = await getClientAdjustments(id)
  return NextResponse.json(adjustments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await params
  const { amount, type, reason } = await req.json()

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
  }
  if (!type || !["credit", "debit"].includes(type)) {
    return NextResponse.json({ error: "Type invalide (credit ou debit)" }, { status: 400 })
  }

  const finalAmount = type === "credit" ? Math.abs(Number(amount)) : -Math.abs(Number(amount))
  const adj = await createAdjustment(id, finalAmount, reason ?? "")
  console.log(`[audit] balance_adjustment client=${id} amount=${finalAmount} reason=${JSON.stringify(reason ?? "")} at=${new Date().toISOString()}`)
  return NextResponse.json(adj)
}
