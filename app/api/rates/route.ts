import { NextResponse } from "next/server"

// In-memory cache: refresh once per calendar day
let cache: { date: string; rates: Record<string, number> } | null = null

export async function GET() {
  const today = new Date().toISOString().split("T")[0]

  if (cache?.date === today) {
    return NextResponse.json(cache.rates)
  }

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("upstream error")
    const data = await res.json()
    // rates is { USD: 1.08, GBP: 0.85, MAD: 10.8, ... }
    cache = { date: today, rates: data.rates as Record<string, number> }
    return NextResponse.json(cache.rates)
  } catch {
    // Return last cached rates if available, otherwise empty
    return NextResponse.json(cache?.rates ?? {}, { status: cache ? 200 : 503 })
  }
}
