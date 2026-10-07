"use client"

import { CheckCircle2, Truck, PhoneCall, Wallet, Package } from "lucide-react"

const STEPS = [
  { icon: CheckCircle2, label: "Reçue",   done: true  },
  { icon: PhoneCall,    label: "Confirmée", done: true  },
  { icon: Truck,        label: "Expédiée",  done: false, active: true },
  { icon: Package,      label: "Livrée",    done: false },
]

export function ProductShowcase({ className }: { className?: string }) {
  return (
    <div className={className}>
      <style>{`
        @keyframes showcaseFloatA { 0%, 100% { transform: translateY(0) rotate(-3deg) } 50% { transform: translateY(-10px) rotate(-3deg) } }
        @keyframes showcaseFloatB { 0%, 100% { transform: translateY(0) rotate(2deg) } 50% { transform: translateY(-14px) rotate(2deg) } }
        @keyframes showcaseFloatC { 0%, 100% { transform: translateY(0) rotate(-1deg) } 50% { transform: translateY(-8px) rotate(-1deg) } }
        .showcase-a { animation: showcaseFloatA 6s ease-in-out infinite; }
        .showcase-b { animation: showcaseFloatB 7s ease-in-out infinite; animation-delay: 0.6s; }
        .showcase-c { animation: showcaseFloatC 5.5s ease-in-out infinite; animation-delay: 1.1s; }
        @keyframes showcasePulseDot { 0%, 100% { opacity: 1; transform: scale(1) } 50% { opacity: 0.4; transform: scale(0.8) } }
        .showcase-pulse { animation: showcasePulseDot 1.6s ease-in-out infinite; }
      `}</style>

      {/* Order tracking card */}
      <div className="showcase-a absolute top-0 left-0 w-[260px] rounded-2xl p-4 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-white text-xs font-bold">Suivi de commande</span>
          <span className="text-sm">🇪🇸</span>
        </div>
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 flex-1 relative">
              {i > 0 && (
                <div className="absolute top-3 right-1/2 w-full h-px"
                  style={{ background: STEPS[i - 1].done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)" }} />
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 ${s.active ? "showcase-pulse" : ""}`}
                style={{
                  background: s.done ? "rgba(16,185,129,0.18)" : s.active ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${s.done ? "rgba(16,185,129,0.4)" : s.active ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.1)"}`,
                }}>
                <s.icon className="w-3 h-3" style={{ color: s.done ? "#10b981" : s.active ? "#f97316" : "#52525b" }} />
              </div>
              <span className="text-[9px] font-medium" style={{ color: s.done || s.active ? "#a3a3a3" : "#52525b" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Call confirmation card */}
      <div className="showcase-b absolute top-[150px] right-0 w-[220px] rounded-2xl p-4 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <PhoneCall className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-xs font-bold">Appel de confirmation</p>
            <p className="text-neutral-500 text-[10px]">Call center intégré</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className="showcase-pulse rounded-full bg-indigo-400"
              style={{ width: 3, height: 6 + (i % 3) * 5, animationDelay: `${i * 0.15}s` }} />
          ))}
          <span className="text-indigo-400 text-[10px] font-medium ml-2">En cours…</span>
        </div>
      </div>

      {/* Wallet card */}
      <div className="showcase-c absolute bottom-0 left-[12%] w-[240px] rounded-2xl p-4 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="text-white text-xs font-bold">Portefeuille</span>
          </div>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-emerald-400" style={{ background: "rgba(16,185,129,0.12)" }}>
            Retrait dispo
          </span>
        </div>
        <p className="text-neutral-600 text-[10px]">Solde reversé chaque semaine, par virement, Wise ou crypto.</p>
      </div>
    </div>
  )
}
