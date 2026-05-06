import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

// Supprime les webhooks dupliqués ou mal configurés sur Shopify
export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" })

  const { data: stores } = await sb
    .from("stores")
    .select("id, domain, access_token")

  const results = []

  for (const store of stores ?? []) {
    if (!store.access_token) continue

    const res = await fetch(
      `https://${store.domain}/admin/api/2025-01/webhooks.json`,
      { headers: { "X-Shopify-Access-Token": store.access_token } }
    )
    if (!res.ok) continue

    const { webhooks } = await res.json()
    const deleted: number[] = []

    // Pour chaque topic, garder uniquement le webhook avec la bonne adresse
    const correctBase = "https://europs-shipping.vercel.app"
    const toDelete = (webhooks as { id: number; topic: string; address: string }[]).filter(w => {
      const wrongEndpoint = w.topic === "orders/create" && w.address.includes("/api/webhooks/shopify/products")
      const wrongDomain   = !w.address.startsWith(correctBase)
      return wrongEndpoint || wrongDomain
    })

    for (const w of toDelete) {
      await fetch(
        `https://${store.domain}/admin/api/2025-01/webhooks/${w.id}.json`,
        {
          method:  "DELETE",
          headers: { "X-Shopify-Access-Token": store.access_token },
        }
      )
      deleted.push(w.id)
    }

    results.push({ domain: store.domain, deleted })
  }

  return NextResponse.json({ ok: true, results })
}
