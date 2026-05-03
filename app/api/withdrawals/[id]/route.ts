import { NextResponse } from "next/server"
import { processWithdrawal } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status, adminNote } = await req.json()

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const w = await processWithdrawal(id, status, adminNote)
  if (!w) return NextResponse.json({ error: "Not found or already processed" }, { status: 404 })

  return NextResponse.json(w)
}
