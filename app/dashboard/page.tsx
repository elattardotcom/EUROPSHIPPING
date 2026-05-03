"use client"

import { useState, useEffect } from "react"
import { Store, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardPage from "@/components/cod/dashboard"
import { getClientIdFromCookie } from "@/lib/client-cookie"

export default function DashboardHome() {
  const [lastUpdated,    setLastUpdated]    = useState(new Date())
  const [clientId,       setClientId]       = useState(getClientIdFromCookie)
  const [clientName,     setClientName]     = useState("")
  const [clientInitials, setClientInitials] = useState("…")
  const [clientColor,    setClientColor]    = useState("from-teal-500 to-emerald-600")

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

  const formatTime = (date: Date) =>
    [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map(n => n.toString().padStart(2, "0"))
      .join(":")

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${clientColor} rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
            {clientInitials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Bienvenue{clientName ? `, ${clientName}` : ""} !
            </h1>
            <p className="text-neutral-500 text-sm">Voici votre aperçu des opérations du jour</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Store className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">CODShip Enterprise</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <RefreshCw className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">Mis à jour : {formatTime(lastUpdated)}</span>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            onClick={() => setLastUpdated(new Date())}
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <DashboardPage clientId={clientId} />
    </div>
  )
}
