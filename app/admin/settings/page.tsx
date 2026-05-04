"use client"

import { useState } from "react"
import { Shield, Key, Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminSettings() {
  const [showPwd, setShowPwd] = useState(false)
  const [saved,   setSaved]   = useState(false)

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres admin</h1>
        <p className="text-neutral-500 text-sm mt-1">Configuration du panneau d'administration</p>
      </div>

      {/* Credentials info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Accès administrateur</p>
            <p className="text-neutral-500 text-xs">Les credentials sont gérés via les variables d'environnement</p>
          </div>
        </div>

        <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono">ADMIN_EMAIL</span>
            <span className="text-neutral-600">→</span>
            <span className="text-white">soufianeattar7@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono">ADMIN_PASSWORD</span>
            <span className="text-neutral-600">→</span>
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors">
              {showPwd ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span className="font-mono">{showPwd ? "Shipping20262027" : "••••••••••••••"}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-600">
          Pour modifier les credentials, changez les variables <code className="text-orange-400">ADMIN_EMAIL</code> et <code className="text-orange-400">ADMIN_PASSWORD</code> dans votre fichier <code className="text-neutral-400">.env.local</code> (local) ou dans les settings Vercel (production).
        </p>
      </div>

      {/* Session */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <p className="text-white font-semibold text-sm mb-1">Session</p>
        <p className="text-neutral-500 text-xs mb-4">La session admin expire après 8 heures.</p>
        <Button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" })
            window.location.href = "/admin/login"
          }}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm"
        >
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
