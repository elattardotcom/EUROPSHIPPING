import { NextRequest, NextResponse } from "next/server"
import { getSupabase }              from "@/lib/supabase"
import { readClients, writeClients } from "@/lib/clients-store"

const COUNTRY_NAMES: Record<string, string> = {
  PT: "Portugal", ES: "Espagne",  FR: "France",     MA: "Maroc",
  DZ: "Algérie",  TN: "Tunisie", IT: "Italie",      DE: "Allemagne",
  BE: "Belgique", GB: "Royaume-Uni", NL: "Pays-Bas", CH: "Suisse",
  SN: "Sénégal",  CI: "Côte d'Ivoire", LU: "Luxembourg",
}

export async function PATCH(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  if (clientId === "c1") return NextResponse.json({ error: "Compte démo non modifiable" }, { status: 403 })

  const { firstName, lastName, phone, company, countryCode, plan } = await req.json()

  const sb = getSupabase()

  if (sb) {
    const updatePayload: Record<string, unknown> = {
      last_active: new Date().toISOString(),
    }
    if (firstName   !== undefined) updatePayload.first_name   = firstName?.trim()
    if (lastName    !== undefined) updatePayload.last_name    = lastName?.trim()
    if (phone       !== undefined) updatePayload.phone        = phone?.trim() ?? ""
    if (company     !== undefined) updatePayload.company      = company?.trim() ?? ""
    if (countryCode !== undefined) {
      updatePayload.country_code = countryCode
      updatePayload.country      = COUNTRY_NAMES[countryCode] ?? countryCode
    }
    if (plan        !== undefined) updatePayload.plan         = plan

    const { data, error } = await sb
      .from("clients")
      .update(updatePayload)
      .eq("id", clientId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, client: data })
  }

  // File fallback
  const clients = readClients()
  const idx = clients.findIndex(c => c.id === clientId)
  if (idx === -1) return NextResponse.json({ error: "Client introuvable" }, { status: 404 })

  clients[idx] = {
    ...clients[idx],
    ...(firstName   !== undefined && { firstName:   firstName?.trim()  }),
    ...(lastName    !== undefined && { lastName:    lastName?.trim()   }),
    ...(phone       !== undefined && { phone:       phone?.trim()      }),
    ...(company     !== undefined && { company:     company?.trim()    }),
    ...(countryCode !== undefined && { countryCode, country: COUNTRY_NAMES[countryCode] ?? countryCode }),
    ...(plan        !== undefined && { plan }),
    lastActive:  new Date().toISOString(),
  }
  writeClients(clients)
  return NextResponse.json({ success: true, client: clients[idx] })
}
