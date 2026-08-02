"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Calendar, X } from "lucide-react"
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

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function DashboardHome() {
  const [refreshKey,     setRefreshKey]     = useState(0)
  const [period,         setPeriod]         = useState<Period>("all")
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [clientName,     setClientName]     = useState("")
  const [clientInitials, setClientInitials] = useState("…")
  const [clientColor,    setClientColor]    = useState("from-teal-500 to-emerald-600")
  const [now,            setNow]            = useState(new Date())

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customStart,    setCustomStart]    = useState("")
  const [customEnd,      setCustomEnd]      = useState(todayISO())
  const [appliedStart,   setAppliedStart]   = useState("")
  const [appliedEnd,     setAppliedEnd]     = useState("")
  const pickerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const applyCustom = () => {
    if (!customStart || !customEnd) return
    setAppliedStart(customStart)
    setAppliedEnd(customEnd)
    setPeriod("custom" as Period)
    setShowDatePicker(false)
  }

  const clearCustom = () => {
    setAppliedStart("")
    setAppliedEnd("")
    setPeriod("all")
  }

  const isCustomActive = period === ("custom" as Period)

  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Period pills */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button key={p.value}
                onClick={() => { setPeriod(p.value); setAppliedStart(""); setAppliedEnd("") }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.value
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowDatePicker(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isCustomActive
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {isCustomActive ? `${fmtDate(appliedStart)} → ${fmtDate(appliedEnd)}` : "Personnalisé"}
              {isCustomActive && (
                <span onClick={(e) => { e.stopPropagation(); clearCustom() }}
                  className="ml-1 hover:text-orange-200">
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-10 z-50 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl w-72">
                <p className="text-white text-sm font-semibold mb-3">Période personnalisée</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-neutral-500 text-xs mb-1 block">Date de début</label>
                    <input
                      type="date"
                      value={customStart}
                      max={customEnd || todayISO()}
                      onChange={e => setCustomStart(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 text-xs mb-1 block">Date de fin</label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart}
                      max={todayISO()}
                      onChange={e => setCustomEnd(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={applyCustom}
                    disabled={!customStart || !customEnd}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
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

      <DashboardPage
        clientId={clientId}
        refreshKey={refreshKey}
        period={period}
        customStart={appliedStart}
        customEnd={appliedEnd}
      />
    </div>
  )
}
