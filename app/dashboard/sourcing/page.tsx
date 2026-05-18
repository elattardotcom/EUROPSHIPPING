"use client"

import { useState, useEffect } from "react"
import { Search, Send, CheckCircle, Clock, Package, Link2, AlertCircle, Loader2, ChevronDown, ImageIcon, X } from "lucide-react"

const STATUS_CFG = {
  PENDING:   { label: "En attente",   cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  PROCESSING:{ label: "En traitement",cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  SHIPPED:   { label: "Expédié",      cls: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  RECEIVED:  { label: "Reçu",         cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  CANCELED:  { label: "Annulé",       cls: "text-red-400 bg-red-500/10 border-red-500/20" },
}

interface SourcingRequest {
  id: string
  product_name: string
  reference_url: string | null
  quantity: number
  budget_eur: number | null
  notes: string | null
  admin_reply: string | null
  image_url: string | null
  status: keyof typeof STATUS_CFG
  created_at: string
}

const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/60 transition-all"

function SectionNum({ n, color }: { n: string; color: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-black tracking-widest flex-shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>{n}</span>
  )
}

export default function SourcingPage() {
  const [requests,    setRequests]    = useState<SourcingRequest[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [showList,    setShowList]    = useState(false)
  const [sent,        setSent]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [formErr,     setFormErr]     = useState("")
  const [showForm,    setShowForm]    = useState(false)
  const [imageFile,   setImageFile]   = useState<File | null>(null)
  const [dragOver,    setDragOver]    = useState(false)

  const [form, setForm] = useState({
    product_name: "", reference_url: "", quantity: "", budget_eur: "",
    destination: "", shipping: "", notes: "",
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  function resetForm() {
    setForm({ product_name: "", reference_url: "", quantity: "", budget_eur: "", destination: "", shipping: "", notes: "" })
    setImageFile(null)
    setFormErr("")
  }

  async function loadRequests() {
    setListLoading(true)
    const d = await fetch("/api/sourcing").then(r => r.json()).catch(() => [])
    setRequests(Array.isArray(d) ? d : [])
    setListLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormErr("")

    const shippingLabel =
      form.shipping === "air"  ? "Fret aérien ✈️" :
      form.shipping === "sea"  ? "Fret maritime 🚢" :
      form.shipping === "road" ? "Transport routier 🚛" : ""

    try {
      const fd = new FormData()
      fd.append("product_name",  form.product_name.trim())
      fd.append("reference_url", form.reference_url || "")
      fd.append("quantity",      form.quantity || "")
      fd.append("budget_eur",    form.budget_eur || "")
      fd.append("destination",   form.destination || "")
      fd.append("shipping",      shippingLabel)
      fd.append("notes",         form.notes || "")
      if (imageFile) fd.append("image", imageFile)

      const res = await fetch("/api/sourcing", { method: "POST", body: fd })
      if (res.ok) {
        setSent(true)
        setShowForm(false)
        resetForm()
        loadRequests()
      } else {
        const d = await res.json().catch(() => ({}))
        setFormErr(d.error ?? `Erreur ${res.status} — veuillez réessayer.`)
      }
    } catch {
      setFormErr("Erreur réseau — veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) setImageFile(file)
  }

  const SHIPPING_OPTS = [
    { value:"air",  icon:"✈️", label:"Fret aérien",       badge:"Le plus rapide", badgeCls:"text-orange-400 bg-orange-500/10 border-orange-500/25", desc:"Idéal pour les commandes urgentes ou légères.",     delay:"10–15 jours" },
    { value:"sea",  icon:"🚢", label:"Fret maritime",      badge:"Meilleur prix",  badgeCls:"text-blue-400 bg-blue-500/10 border-blue-500/25",       desc:"Idéal pour les grandes quantités à moindre coût.",  delay:"30–45 jours" },
    { value:"road", icon:"🚛", label:"Transport routier",  badge:"Équilibré",      badgeCls:"text-teal-400 bg-teal-500/10 border-teal-500/25",       desc:"Pour les pays européens proches.",                  delay:"20–30 jours" },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-teal-400" />
            Sourcing Produit
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Trouvez vos fournisseurs et recevez vos produits directement en entrepôt.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setSent(false) }}
          className="inline-flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", boxShadow: "0 4px 16px rgba(20,184,166,0.25)" }}
        >
          <Send className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:"🌏", label:"Fournisseurs vérifiés", sub:"Chine, Turquie, Europe" },
          { icon:"✅", label:"Contrôle qualité",      sub:"Inspection avant envoi" },
          { icon:"🚀", label:"Livraison rapide",       sub:"Direct en entrepôt" },
          { icon:"📊", label:"Suivi en temps réel",    sub:"Depuis votre dashboard" },
        ].map(b => (
          <div key={b.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{b.icon}</div>
            <p className="text-white text-xs font-bold">{b.label}</p>
            <p className="text-neutral-600 text-[10px] mt-0.5">{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Success message */}
      {sent && (
        <div className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">Demande envoyée !</p>
            <p className="text-neutral-500 text-xs">Notre équipe va analyser votre demande et vous recontacter rapidement.</p>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">

          {/* Form header */}
          <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-teal-400" />
              <p className="text-white font-semibold text-sm">Nouvelle demande de sourcing</p>
            </div>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }}
              className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* ── 01 Informations produit ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SectionNum n="01" color="#14b8a6" />
                <p className="text-white font-bold text-xs uppercase tracking-widest">Informations produit</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom du produit *</label>
                  <input type="text" required
                    placeholder="Ex: Montre smartwatch X4 noire, Sac à main femme, etc."
                    value={form.product_name} onChange={set("product_name")} className={INPUT} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" /> Lien produit
                    </label>
                    <span className="text-[10px] text-neutral-600">Alibaba, AliExpress, 1688…</span>
                  </div>
                  <input type="url"
                    placeholder="https://alibaba.com/... ou AliExpress, 1688 URL"
                    value={form.reference_url} onChange={set("reference_url")} className={INPUT} />
                </div>

                {/* Drag & drop image */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-neutral-400">Image produit</label>
                    <span className="text-[10px] text-neutral-600">Requis si pas de lien</span>
                  </div>
                  {imageFile ? (
                    <div className="flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <p className="text-teal-300 text-sm flex-1 truncate">{imageFile.name}</p>
                      <button type="button" onClick={() => setImageFile(null)}
                        className="w-6 h-6 rounded-md bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <X className="w-3 h-3 text-neutral-400" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("sourcing-file-input")?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragOver
                          ? "border-teal-500/50 bg-teal-500/5"
                          : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/30"
                      }`}
                    >
                      <ImageIcon className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-400 text-sm">
                        Déposer une image ici ou{" "}
                        <span className="text-teal-400 font-medium">parcourir</span>
                      </p>
                      <p className="text-neutral-600 text-xs mt-1">JPG, PNG, WEBP — max 15 Mo</p>
                      <input id="sourcing-file-input" type="file" accept="image/*" className="hidden"
                        onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 02 Détails commande ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SectionNum n="02" color="#f97316" />
                <p className="text-white font-bold text-xs uppercase tracking-widest">Détails commande</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Budget cible (€/unité)</label>
                  <input type="number" step="0.01" min={0} placeholder="0.00"
                    value={form.budget_eur} onChange={set("budget_eur")} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Quantité souhaitée</label>
                  <input type="number" min={1} placeholder="#"
                    value={form.quantity} onChange={set("quantity")} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Pays de destination</label>
                  <select value={form.destination} onChange={set("destination")} className={INPUT}>
                    <option value="">Sélectionner…</option>
                    <option value="Espagne">🇪🇸 Espagne</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Italie">🇮🇹 Italie</option>
                    <option value="Roumanie">🇷🇴 Roumanie</option>
                    <option value="Bulgarie">🇧🇬 Bulgarie</option>
                    <option value="Hongrie">🇭🇺 Hongrie</option>
                    <option value="Grèce">🇬🇷 Grèce</option>
                    <option value="Slovaquie">🇸🇰 Slovaquie</option>
                    <option value="Slovénie">🇸🇮 Slovénie</option>
                    <option value="Rép. Tchèque">🇨🇿 Rép. Tchèque</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── 03 Mode d'expédition ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SectionNum n="03" color="#8b5cf6" />
                <p className="text-white font-bold text-xs uppercase tracking-widest">Mode d&apos;expédition</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SHIPPING_OPTS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, shipping: opt.value }))}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      form.shipping === opt.value
                        ? "border-teal-500/50 bg-teal-500/10"
                        : "border-neutral-700 bg-neutral-800/30 hover:border-neutral-600"
                    }`}
                  >
                    {form.shipping === opt.value && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeCls}`}>{opt.badge}</span>
                    </div>
                    <p className="text-white font-bold text-sm mb-1.5">{opt.label}</p>
                    <p className="text-neutral-500 text-[11px] leading-relaxed mb-3">{opt.desc}</p>
                    <p className="text-neutral-600 text-[10px] font-semibold uppercase tracking-wider">
                      Délai estimé: {opt.delay}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── 04 Notes ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SectionNum n="04" color="#10b981" />
                <p className="text-white font-bold text-xs uppercase tracking-widest">Notes complémentaires</p>
              </div>
              <textarea
                placeholder="Couleur, taille, packaging, délai souhaité, instructions spéciales…"
                rows={4} value={form.notes} onChange={set("notes")}
                className={INPUT + " resize-none"} />
            </div>

            {formErr && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{formErr}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-neutral-800">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 font-bold text-sm text-white px-7 py-3 rounded-xl transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", boxShadow: "0 4px 16px rgba(20,184,166,0.25)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Envoi…" : "Envoyer la demande"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                className="text-sm text-neutral-500 hover:text-white border border-neutral-700 px-5 py-3 rounded-xl transition-all hover:border-neutral-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My requests */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowList(s => !s)}
          className="w-full px-5 py-4 border-b border-neutral-800 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <p className="text-white font-semibold text-sm">Mes demandes</p>
            {requests.length > 0 && (
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showList ? "rotate-180" : ""}`} />
        </button>

        {showList && (
          listLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center">
              <AlertCircle className="w-6 h-6 text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">Aucune demande pour l&apos;instant</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {requests.map(r => {
                const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING
                return (
                  <div key={r.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-4">
                      {r.image_url && (
                        <img src={r.image_url} alt={r.product_name}
                          className="w-10 h-10 rounded-lg object-cover border border-neutral-700 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{r.product_name}</p>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          {r.quantity ? `${r.quantity} unités` : ""}{r.budget_eur ? ` · €${r.budget_eur}/u` : ""}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                      <span className="text-neutral-600 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {r.admin_reply && (
                      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3">
                        <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-1">Réponse de l&apos;équipe</p>
                        <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{r.admin_reply}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
