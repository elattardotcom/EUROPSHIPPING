import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" })

  const { data: stores } = await sb
    .from("stores")
    .select("id, domain, access_token, client_id")

  const results = await Promise.all((stores ?? []).map(async (store) => {
    if (!store.access_token) return { domain: store.domain, error: "no access_token" }

    const res = await fetch(
      `https://${store.domain}/admin/api/2025-01/webhooks.json`,
      { headers: { "X-Shopify-Access-Token": store.access_token } }
    )
    if (!res.ok) return { domain: store.domain, error: `Shopify ${res.status}` }

    const data = await res.json()
    return {
      domain:   store.domain,
      webhooks: (data.webhooks ?? []).map((w: { id: number; topic: string; address: string }) => ({
        id:      w.id,
        topic:   w.topic,
        address: w.address,
      })),
    }
  }))

  return NextResponse.json(results)
}
