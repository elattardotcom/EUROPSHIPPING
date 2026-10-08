"use client"

import type { Lang } from "@/lib/landing-translations"

const FACTS = [
  "🇪🇺 10 European markets covered",
  "📞 Native-language call confirmation",
  "🚚 24–48h COD delivery",
  "💰 Weekly payout — every Monday",
  "🛒 Shopify integration in 5 minutes",
  "📦 European warehouses, no storage fees",
  "💳 Bank, Wise or crypto withdrawals",
]

export function LiveTicker(_props: { lang: Lang }) {
  const doubled = [...FACTS, ...FACTS]

  return (
    <div className="border-b border-white/[0.04] overflow-hidden py-2.5" style={{ background: "rgba(16,185,129,0.04)" }}>
      <div className="marquee-track flex items-center whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs text-neutral-500 px-6 flex items-center gap-3">
            {item}
            <span className="text-white/10">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
