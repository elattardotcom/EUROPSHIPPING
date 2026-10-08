"use client"

import { useEffect, useState } from "react"
import { Plus, Save, Loader2, Star, Trash2, Building2, AlertCircle, CheckCircle } from "lucide-react"
import type { PaymentMethod, PaymentMethodType } from "@/lib/db"
import { WiseLogo, BinanceLogo, PaymentMethodIcon } from "@/components/wallet/shared"

const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
      type === "success"
        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
        : "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  )
}

export function PaymentMethodsManager({ onChanged }: { onChanged?: () => void }) {
  const [methods,      setMethods]      = useState<PaymentMethod[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [formType,     setFormType]     = useState<PaymentMethodType>("bank")
  const [label,        setLabel]        = useState("")
  const [iban,         setIban]         = useState("")
  const [bic,          setBic]          = useState("")
  const [holder,       setHolder]       = useState("")
  const [wiseEmail,    setWiseEmail]    = useState("")
  const [wiseCurrency, setWiseCurrency] = useState("USD")
  const [cryptoNet,    setCryptoNet]    = useState("USDT-TRC20")
  const [cryptoAddr,   setCryptoAddr]   = useState("")
  const [isDefault,    setIsDefault]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [msg,          setMsg]          = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/client/payment-methods")
      if (res.ok) setMethods(await res.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function save() {
    setMsg(null)
    setSaving(true)
    try {
      const body: Record<string, unknown> = { type: formType, label: label.trim(), isDefault }
      if (formType === "bank")   { body.iban = iban.trim(); body.bic = bic.trim(); body.accountHolder = holder.trim() }
      if (formType === "wise")   { body.wiseEmail = wiseEmail.trim(); body.wiseCurrency = wiseCurrency }
      if (formType === "crypto") { body.cryptoNetwork = cryptoNet; body.cryptoAddress = cryptoAddr.trim() }
      const res = await fetch("/api/client/payment-methods", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      setMsg({ type: "success", text: "Method added successfully." })
      setShowForm(false)
      setLabel(""); setIban(""); setBic(""); setHolder("")
      setWiseEmail(""); setCryptoAddr(""); setIsDefault(false)
      await load()
      onChanged?.()
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Server error" })
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    setDeletingId(id)
    await fetch(`/api/client/payment-methods/${id}`, { method: "DELETE" })
    setDeletingId(null)
    await load()
    onChanged?.()
  }

  async function setDefault(id: string) {
    await fetch(`/api/client/payment-methods/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }),
    })
    await load()
    onChanged?.()
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Payment method</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Save your payout details to speed up your withdrawals</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Add
          </button>
        )}
      </div>

      {msg && <Alert type={msg.type} msg={msg.text} />}

      {showForm && (
        <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-medium text-sm">New method</p>
            <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white text-xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { id: "bank",   label: "Bank transfer", sub: "IBAN / BIC" },
              { id: "wise",   label: "Wise",          sub: "Wise email" },
              { id: "crypto", label: "Crypto",        sub: "BTC / ETH / USDT" },
            ] as { id: PaymentMethodType; label: string; sub: string }[]).map(t => (
              <button key={t.id} onClick={() => setFormType(t.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  formType === t.id
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}>
                {t.id === "wise"   ? <WiseLogo size={22} />
                  : t.id === "crypto" ? <BinanceLogo size={22} />
                  : <Building2 className="w-5 h-5" />}
                <span className="text-xs font-semibold">{t.label}</span>
                <span className="text-[10px] text-neutral-500">{t.sub}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Label *</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Main account"
              className={INPUT} />
          </div>

          {formType === "bank" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">IBAN *</label>
                <input value={iban} onChange={e => setIban(e.target.value)} placeholder="PT50 0002 0000 0001 2345 6781 4"
                  className={INPUT + " font-mono"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium mb-1.5 block">BIC / SWIFT</label>
                  <input value={bic} onChange={e => setBic(e.target.value)} placeholder="CGDIPTPL"
                    className={INPUT + " font-mono"} />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Account holder</label>
                  <input value={holder} onChange={e => setHolder(e.target.value)} placeholder="Full name"
                    className={INPUT} />
                </div>
              </div>
            </div>
          )}

          {formType === "wise" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Wise email *</label>
                <input type="email" value={wiseEmail} onChange={e => setWiseEmail(e.target.value)} placeholder="you@email.com"
                  className={INPUT} />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Preferred currency</label>
                <select value={wiseCurrency} onChange={e => setWiseCurrency(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500">
                  {["USD","EUR","GBP","MAD","CAD","AUD"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {formType === "crypto" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Network *</label>
                <select value={cryptoNet} onChange={e => setCryptoNet(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500">
                  {["USDT-TRC20","USDT-ERC20","BTC","ETH","BNB","USDC-ERC20"].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Wallet address *</label>
                <input value={cryptoAddr} onChange={e => setCryptoAddr(e.target.value)} placeholder="0x... or T..."
                  className={INPUT + " font-mono text-xs"} />
                <p className="text-[11px] text-amber-400/70 mt-1.5">⚠ Double-check the address — crypto transfers are irreversible</p>
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-orange-500" />
            <span className="text-sm text-neutral-300">Set as default method</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving || !label.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-orange-500 animate-spin" /></div>
      ) : methods.length === 0 && !showForm ? (
        <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl">
          <Building2 className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm font-medium">No payment method saved</p>
          <p className="text-neutral-600 text-xs mt-1">Add your IBAN, Wise, or crypto address</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map(m => (
            <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              m.isDefault ? "border-orange-500/30 bg-orange-500/5" : "border-neutral-800 bg-neutral-800/40"
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  m.type === "bank" ? "bg-blue-500/15" : "bg-transparent"
                }`}>
                  {m.type === "bank" ? <Building2 className="w-4 h-4 text-blue-400" /> : <PaymentMethodIcon type={m.type} size={28} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{m.label}</p>
                    {m.isDefault && (
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/20 px-1.5 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5 truncate font-mono">
                    {m.type === "bank"   && (m.iban   ? `IBAN: ${m.iban.slice(0,4)} •••• ${m.iban.replace(/\s/g,"").slice(-4)}` : "")}
                    {m.type === "wise"   && (m.wiseEmail   ? `${m.wiseEmail} · ${m.wiseCurrency ?? "USD"}` : "")}
                    {m.type === "crypto" && (m.cryptoAddress ? `${m.cryptoNetwork} · ${m.cryptoAddress.slice(0,8)}...${m.cryptoAddress.slice(-6)}` : "")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!m.isDefault && (
                  <button onClick={() => setDefault(m.id)}
                    className="text-xs text-neutral-500 hover:text-orange-400 px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors"
                    title="Set as default">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => remove(m.id)} disabled={deletingId === m.id}
                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  {deletingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
