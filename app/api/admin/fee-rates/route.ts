import { NextRequest, NextResponse } from "next/server"
import { getFeeRates, upsertFeeRate, deleteFeeRate } from "@/lib/db"

export async function GET() {
  const rates = await getFeeRates()
  return NextResponse.json(rates)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { countryCode, countryName, deliveryFee, returnFee, callCenterFee } = body
  if (!countryCode || !countryName) return NextResponse.json({ error: "Champs requis" }, { status: 400 })
  const rate = await upsertFeeRate(
    String(countryCode).toUpperCase(),
    String(countryName),
    parseFloat(deliveryFee) || 0,
    parseFloat(returnFee)   || 0,
    parseFloat(callCenterFee) || 0,
  )
  if (!rate) return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  return NextResponse.json(rate)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const countryCode = searchParams.get("code")
  if (!countryCode) return NextResponse.json({ error: "Code manquant" }, { status: 400 })
  const ok = await deleteFeeRate(countryCode)
  if (!ok) return NextResponse.json({ error: "Impossible de supprimer" }, { status: 400 })
  return NextResponse.json({ ok: true })
}
