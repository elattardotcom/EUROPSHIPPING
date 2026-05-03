import { NextRequest, NextResponse } from "next/server"
import { verifyAuthDb }  from "@/lib/auth-store"
import { getClientById } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const clientId = await verifyAuthDb(normalizedEmail, password)
    if (!clientId) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    const client = await getClientById(clientId)
    if (!client) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 })
    }

    const res = NextResponse.json({ success: true, clientId, client })
    res.cookies.set("client_id", clientId, { path: "/", maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
