import { NextRequest, NextResponse } from "next/server"
import { verifyAuthDb, createAuthRecordDb } from "@/lib/auth-store"
import { getClientById }                    from "@/lib/db"

export async function PATCH(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  if (clientId === "c1") return NextResponse.json({ error: "Compte démo non modifiable" }, { status: 403 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
  }

  const client = await getClientById(clientId)
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 })

  // Verify current password
  const verified = await verifyAuthDb(client.email, currentPassword)
  if (!verified) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 })

  // Save new password
  await createAuthRecordDb(clientId, client.email, newPassword)
  return NextResponse.json({ success: true })
}
