import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

// Test manual: insère un lead fictif pour vérifier que la table leads accepte les données
export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" })

  // Vérifie la structure de la table leads
  const { data: cols, error: colErr } = await sb
    .from("leads")
    .select("*")
    .limit(0)

  // Essaie d'insérer un lead test
  const testId = `test_${Date.now()}`
  const { data: inserted, error: insertErr } = await sb.from("leads").insert({
    id:             testId,
    client_id:      "627b7f0b-1efe-4754-952d-74195ad0d346",
    client_name:    "imad samir",
    customer_name:  "Test Client",
    customer_phone: "+33600000000",
    country:        "France",
    country_code:   "FR",
    product:        "Test Product",
    value:          59.80,
    currency:       "EUR",
    status:         "PENDING",
    store:          "qx9cbf-1y",
    attempts:       0,
    created_at:     new Date().toISOString(),
  }).select()

  // Nettoie le test
  if (!insertErr) {
    await sb.from("leads").delete().eq("id", testId)
  }

  return NextResponse.json({
    insertResult: inserted,
    insertError:  insertErr?.message ?? null,
    colError:     colErr?.message ?? null,
  })
}
