import { NextRequest, NextResponse } from "next/server"
import { getPaymentMethods } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  const methods = await getPaymentMethods(clientId)
  return NextResponse.json(methods)
}

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await req.json()
  const { type, label, iban, bic, accountHolder, wiseEmail, wiseCurrency, cryptoNetwork, cryptoAddress, isDefault } = body

  if (!type || !label) return NextResponse.json({ error: "Type et libellé requis" }, { status: 400 })
  if (type === "bank"   && !iban)      return NextResponse.json({ error: "IBAN requis" }, { status: 400 })
  if (type === "wise"   && !wiseEmail) return NextResponse.json({ error: "Email Wise requis" }, { status: 400 })
  if (type === "crypto" && (!cryptoNetwork || !cryptoAddress))
    return NextResponse.json({ error: "Réseau et adresse crypto requis" }, { status: 400 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Supabase non disponible" }, { status: 500 })

  const now = new Date().toISOString()

  try {
    if (isDefault) {
      await sb.from("payment_methods").update({ is_default: false }).eq("client_id", clientId)
    }

    const { data, error } = await sb.from("payment_methods").insert({
      client_id:      clientId,
      type,
      label,
      iban:           iban           ?? null,
      bic:            bic            ?? null,
      account_holder: accountHolder  ?? null,
      wise_email:     wiseEmail      ?? null,
      wise_currency:  wiseCurrency   ?? null,
      crypto_network: cryptoNetwork  ?? null,
      crypto_address: cryptoAddress  ?? null,
      is_default:     isDefault      ?? false,
      created_at:     now,
    }).select().single()

    if (error) {
      console.error("[payment-methods POST] supabase error:", JSON.stringify(error))
      return NextResponse.json({ error: `Supabase: ${error.message} (code ${error.code})` }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: "Aucune donnée retournée" }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error("[payment-methods POST] exception:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
