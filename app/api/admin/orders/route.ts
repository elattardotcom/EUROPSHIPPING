import { NextResponse } from "next/server"
import { getAllOrders } from "@/lib/db"

export async function GET() {
  return NextResponse.json(await getAllOrders())
}
