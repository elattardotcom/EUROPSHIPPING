import { NextResponse } from "next/server"
import { getAllLeads } from "@/lib/db"

export async function GET() {
  return NextResponse.json(await getAllLeads())
}
