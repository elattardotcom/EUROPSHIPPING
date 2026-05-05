import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { canAddStore } from "@/lib/plan-limits"

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { domain, accessToken } = await req.json()
  if (!domain || !accessToken) {
    return NextResponse.json({ error: "Domaine et clé API requis" }, { status: 400 })
  }

  const cleanDomain = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")

  if (!cleanDomain.includes(".myshopify.com")) {
    return NextResponse.json({ error: "Le domaine doit se terminer par .myshopify.com" }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "Base de données non configurée" }, { status: 500 })

  // Check plan store limit
  const { data: clientRow } = await sb.from("clients").select("plan").eq("id", clientId).single()
  const plan = clientRow?.plan ?? "starter"

  const { count: existingCount } = await sb
    .from("stores")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)

  if (!canAddStore(plan, existingCount ?? 0)) {
    const limits: Record<string, number> = { starter: 1, pro: 3 }
    const max = limits[plan] ?? 1
    return NextResponse.json({
      error: `Votre plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} est limité à ${max} boutique${max > 1 ? "s" : ""}. Passez à un plan supérieur pour en ajouter davantage.`,
      upgrade: true,
    }, { status: 403 })
  }

  const storeName = cleanDomain.replace(".myshopify.com", "")

  const { data: store, error: storeErr } = await sb
    .from("stores")
    .upsert(
      {
        client_id:    clientId,
        name:         storeName,
        domain:       cleanDomain,
        status:       "connected",
        access_token: accessToken.trim(),
        last_sync:    null,
      },
      { onConflict: "domain" },
    )
    .select("id, name, domain")
    .single()

  if (storeErr || !store) {
    return NextResponse.json({ error: storeErr?.message ?? "Erreur sauvegarde boutique" }, { status: 500 })
  }

  // Déclenche la sync des produits en arrière-plan
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:3000`
  fetch(`${appUrl}/api/shopify/sync`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ storeId: store.id, shop: cleanDomain, accessToken: accessToken.trim() }),
  }).catch(() => {})

  return NextResponse.json({ store })
}
