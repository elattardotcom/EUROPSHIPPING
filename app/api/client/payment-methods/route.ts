import { NextRequest, NextResponse } from "next/server"
import { getPaymentMethods, createPaymentMethod } from "@/lib/db"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  const methods = await getPaymentMethods(clientId)
  return NextResponse.json(methods)
}

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  console.log("[payment-methods POST] clientId from cookie:", clientId ?? "MISSING")
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await req.json()
  const { type, label, iban, bic, accountHolder, wiseEmail, wiseCurrency, cryptoNetwork, cryptoAddress, isDefault } = body

  if (!type || !label) return NextResponse.json({ error: "Type et libellé requis" }, { status: 400 })
  if (type === "bank"   && !iban)          return NextResponse.json({ error: "IBAN requis"           }, { status: 400 })
  if (type === "wise"   && !wiseEmail)     return NextResponse.json({ error: "Email Wise requis"      }, { status: 400 })
  if (type === "crypto" && (!cryptoNetwork || !cryptoAddress))
    return NextResponse.json({ error: "Réseau et adresse crypto requis" }, { status: 400 })

  const method = await createPaymentMethod({
    clientId, type, label,
    iban:          iban          ?? undefined,
    bic:           bic           ?? undefined,
    accountHolder: accountHolder ?? undefined,
    wiseEmail:     wiseEmail     ?? undefined,
    wiseCurrency:  wiseCurrency  ?? undefined,
    cryptoNetwork: cryptoNetwork ?? undefined,
    cryptoAddress: cryptoAddress ?? undefined,
    isDefault:     isDefault     ?? false,
  })

  if (!method) {
    console.error("[payment-methods POST] createPaymentMethod returned null for clientId:", clientId)
    return NextResponse.json({ error: "Erreur lors de la création — vérifiez les logs serveur" }, { status: 500 })
  }
  console.log("[payment-methods POST] created method id:", method.id)
  return NextResponse.json(method, { status: 201 })
}
