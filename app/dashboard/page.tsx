"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import DashboardPage from "@/components/cod/dashboard"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import type { Period } from "@/components/cod/dashboard"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"

const PERIODS: { label: string; value: Period }[] = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours",     value: "7d"    },
  { label: "30 jours",    value: "30d"   },
  { label: "Tout",        value: "all"   },
]

function greeting(name: string) {
  const h = new Date().getHours()
  const prefix = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir"
  return name ? `${prefix}, ${name}` : prefix
}

export default function DashboardHome() {
  const [refreshKey,     setRefreshKey]     = useState(0)
  const [period,         setPeriod]         = useState<Period>("all")
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [clientName,     setClientName]     = useState("")
  const [clientInitials, setClientInitials] = useState("…")
  const [clientColor,    setClientColor]    = useState("from-teal-500 to-emerald-600")
  const [now,            setNow]            = useState(new Date())

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(c => {
        if (!c?.id) return
        setClientId(c.id)
        setClientName(c.firstName ?? "")
        setClientInitials(((c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")).toUpperCase() || "?")
        setClientColor(c.avatarColor ?? "from-teal-500 to-emerald-600")
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <OnboardingBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 bg-gradient-to-br ${clientColor} rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg`}>
            {clientInitials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{greeting(clientName)}</h1>
            <p className="text-neutral-500 text-xs capitalize">{dateStr} · {timeStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period pills */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.value
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl border border-neutral-800 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DashboardPage clientId={clientId} refreshKey={refreshKey} period={period} />
    </div>
  )
}
