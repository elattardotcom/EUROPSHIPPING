import { NextResponse } from "next/server"
import { getWithdrawals, createWithdrawal } from "@/lib/db"

export async function GET() {
  return NextResponse.json(await getWithdrawals())
}

export async function POST(req: Request) {
  const body = await req.json()
  const w = await createWithdrawal(body)
  if (!w) return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 })
  return NextResponse.json(w, { status: 201 })
}
