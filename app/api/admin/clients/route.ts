import { NextResponse } from "next/server"
import { getClients } from "@/lib/db"

export async function GET() {
  return NextResponse.json(await getClients())
}
