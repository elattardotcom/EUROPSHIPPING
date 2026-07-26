"use client"

import { useState } from "react"
import { Mail, MessageCircle, Clock, Send, ChevronDown, CheckCircle } from "lucide-react"

const FAQS = [
  {
    q: "Comment suivre mon colis ?",
    a: "Vous pouvez suivre votre colis depuis l'onglet Commandes de votre tableau de bord grâce au numéro de suivi fourni.",
  },
  {
    q: "Combien de temps prend un virement ?",
    a: "Les virements sont traités sous 48h après validation de votre demande par notre équipe.",
  },
  {
    q: "Comment connecter ma boutique Shopify ?",
    a: "Allez dans Boutiques, cliquez sur « Ajouter une boutique » et suivez le flux OAuth Shopify. Cela prend moins de 2 minutes.",
  },
  {
    q: "Quels pays couvrez-vous ?",
    a: "Nous couvrons actuellement l'Espagne, l'Italie, le Portugal, la Roumanie, la Bulgarie, la Hongrie, la Grèce, la Slovaquie, la Slovénie et la République Tchèque.",
  },
  {
    q: "Comment modifier mon mode de paiement ?",
    a: "Allez dans Wallet → Méthodes de paiement pour ajouter ou mettre à jour votre IBAN, Wise ou adresse crypto.",
  },
]

export default function ContactPage() {
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ name: "", email: "", category: "", subject: "", message: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSent(true)
    setLoading(false)
  }

  const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-orange-400" />
          Assistance
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Notre équipe est disponible pour vous aider. Choisissez votre moyen de contact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — contact cards */}
        <div className="space-y-4">

          {/* Email */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Support par email</p>
              <p className="text-neutral-500 text-xs mt-0.5 mb-2">Réponse garantie sous 24h</p>
              <a href="mailto:contact@codshipeurope.com"
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors font-medium">
                contact@codshipeurope.com ↗
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">WhatsApp</p>
              <p className="text-neutral-500 text-xs mt-0.5 mb-2">Chat direct avec notre équipe support</p>
              <a href="https://wa.me/13858856423?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20avec%20CODShipEurope."
                target="_blank" rel="noopener noreferrer"
                className="text-[#25D366] text-sm hover:opacity-80 transition-opacity font-medium">
                +1 (385) 885-6423 ↗
              </a>
            </div>
          </div>

          {/* Live Chat → WhatsApp direct */}
          <a href="https://wa.me/13858856423?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20avec%20CODShipEurope."
            target="_blank" rel="noopener noreferrer"
            className="bg-neutral-900 border border-[#25D366]/20 rounded-2xl p-5 flex items-start gap-4 hover:border-[#25D366]/40 transition-colors group block">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm group-hover:text-[#25D366] transition-colors">Chat en direct</p>
                <span className="text-[10px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-2 py-0.5 rounded-full font-bold">EN LIGNE</span>
              </div>
              <p className="text-neutral-500 text-xs mt-0.5 mb-1">Discutez avec notre équipe en temps réel via WhatsApp</p>
              <p className="text-[#25D366] text-xs font-medium">Disponible 7j/7 · Réponse rapide →</p>
            </div>
          </a>

          {/* Business Hours */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <p className="text-white font-semibold text-sm">Horaires de support</p>
            </div>
            <div className="space-y-2">
              {[
                { day: "Lundi – Vendredi", hours: "9h – 18h CET" },
                { day: "Samedi",           hours: "10h – 16h CET" },
                { day: "Dimanche",         hours: "Fermé" },
              ].map(h => (
                <div key={h.day} className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">{h.day}</span>
                  <span className={h.hours === "Fermé" ? "text-neutral-600" : "text-white font-medium"}>{h.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — contact form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-5">Envoyer un message</h2>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Message envoyé !</p>
                <p className="text-neutral-500 text-sm mt-1">Nous vous répondrons sous 24h.</p>
              </div>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", category: "", subject: "", message: "" }) }}
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nom complet *</label>
                  <input type="text" placeholder="Votre nom complet" required value={form.name} onChange={set("name")} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Adresse email *</label>
                  <input type="email" placeholder="votre@email.com" required value={form.email} onChange={set("email")} className={INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Catégorie *</label>
                  <select required value={form.category} onChange={set("category")}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors">
                    <option value="">Sélectionner</option>
                    <option value="billing">Facturation & Paiements</option>
                    <option value="technical">Problème technique</option>
                    <option value="orders">Commandes & Livraison</option>
                    <option value="account">Compte</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Sujet *</label>
                  <input type="text" placeholder="Objet de votre demande" required value={form.subject} onChange={set("subject")} className={INPUT} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Message *</label>
                <textarea placeholder="Décrivez votre demande en détail…" required rows={5}
                  value={form.message} onChange={set("message")}
                  className={INPUT + " resize-none"} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : <Send className="w-4 h-4" />}
                {loading ? "Envoi en cours…" : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle className="w-4 h-4 text-orange-400" />
          <p className="text-white font-semibold">Questions fréquentes</p>
          <p className="text-neutral-600 text-xs">· Vous ne trouvez pas ? Contactez-nous !</p>
        </div>
        <div className="divide-y divide-neutral-800">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 cursor-pointer">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-white text-sm font-medium">{q}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-neutral-400 text-sm pb-4 pl-7 leading-relaxed">{a}</p>}
    </div>
  )
}
