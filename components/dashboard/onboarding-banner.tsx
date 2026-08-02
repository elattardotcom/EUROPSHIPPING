"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle, Circle, X, ArrowRight, Zap } from "lucide-react"

interface Step {
  id:    string
  label: string
  done:  boolean
  href:  string
}

export function OnboardingBanner() {
  const [visible,  setVisible]  = useState(false)
  const [steps,    setSteps]    = useState<Step[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("onboarding_dismissed") === "1") return

    Promise.all([
      fetch("/api/stores").then(r => r.json()).catch(() => []),
      fetch("/api/client/leads").then(r => r.json()).catch(() => []),
      fetch("/api/client/orders").then(r => r.json()).catch(() => []),
    ]).then(([stores, leads, orders]) => {
      const hasStore   = Array.isArray(stores) && stores.length > 0
      const hasLead    = Array.isArray(leads)  && leads.length  > 0
      const hasOrder   = Array.isArray(orders) && orders.length > 0

      const s: Step[] = [
        { id: "store",  label: "Connecter votre première boutique Shopify", done: hasStore,  href: "/dashboard/stores"  },
        { id: "lead",   label: "Recevoir votre premier lead confirmé",       done: hasLead,   href: "/dashboard/leads"   },
        { id: "order",  label: "Obtenir votre première commande livrée",     done: hasOrder,  href: "/dashboard/orders"  },
      ]

      setSteps(s)
      const allDone = s.every(x => x.done)
      if (!allDone) setVisible(true)
      setLoading(false)
    })
  }, [])

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem("onboarding_dismissed", "1") } catch {}
  }

  if (loading || !visible) return null

  const doneCount = steps.filter(s => s.done).length
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="mb-6 bg-neutral-900 border border-orange-500/25 rounded-2xl p-5 relative">
      <button onClick={dismiss} className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-400 transition-colors">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Démarrage — {doneCount}/{steps.length} complété</p>
        </div>
        <div className="ml-auto text-orange-400 font-bold text-sm">{pct}%</div>
      </div>

      <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-4 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(135deg,#f97316,#dc2626)" }} />
      </div>

      <div className="space-y-2">
        {steps.map(step => (
          <Link key={step.id} href={step.done ? "#" : step.href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${step.done ? "opacity-50 cursor-default" : "hover:bg-neutral-800"}`}>
            {step.done
              ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              : <Circle      className="w-4 h-4 text-neutral-600   flex-shrink-0" />
            }
            <span className={`text-sm ${step.done ? "line-through text-neutral-600" : "text-neutral-300"}`}>{step.label}</span>
            {!step.done && <ArrowRight className="w-3.5 h-3.5 text-orange-500 ml-auto" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
