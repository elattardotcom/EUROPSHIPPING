import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id } = await params

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: "Base de données non configurée" }, { status: 500 })

  // Verify the store belongs to this client before deleting
  const { data: store } = await sb.from("stores").select("id").eq("id", id).eq("client_id", clientId).single()
  if (!store) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 })

  const { error } = await sb.from("stores").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
