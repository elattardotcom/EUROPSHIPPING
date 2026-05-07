import { NextRequest, NextResponse } from "next/server"
import { consumeResetToken } from "@/lib/reset-tokens-store"
import { createAuthRecordDb } from "@/lib/auth-store"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
  }

  const record = consumeResetToken(token)
  if (!record) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 })
  }

  await createAuthRecordDb(record.clientId, record.email, password)
  return NextResponse.json({ success: true })
}
