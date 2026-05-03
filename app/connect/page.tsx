"use client"

import { useState } from "react"
import { Store, ArrowRight, AlertCircle, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConnectShopify() {
  const [shop,       setShop]       = useState("")
  const [clientId,   setClientId]   = useState("c1") // à remplacer par la session réelle
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Normalise le domaine : enlève https://, trailing slash, etc.
    const normalized = shop
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim()

    if (!normalized.endsWith(".myshopify.com")) {
      setError("Le domaine doit être au format : votre-boutique.myshopify.com")
      return
    }

    setLoading(true)
    // Stocke le clientId dans sessionStorage pour le récupérer dans le callback
    sessionStorage.setItem("shopify_client_id", clientId)

    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(normalized)}`
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Connecter Shopify</h1>
          <p className="text-neutral-500 text-sm mt-2">
            Entrez votre domaine Shopify pour synchroniser vos produits automatiquement
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleConnect} className="space-y-4">

            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">
                Domaine Shopify
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={shop}
                  onChange={e => setShop(e.target.value)}
                  placeholder="votre-boutique.myshopify.com"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <p className="text-xs text-neutral-600 mt-1.5">
                Format : votre-boutique.myshopify.com
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading || !shop}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11">
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connexion…</>
                : <><span>Connecter ma boutique</span><ArrowRight className="w-4 h-4 ml-2" /></>
              }
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-neutral-800 space-y-2">
            {["Synchronisation automatique des produits", "Détection du pays et de la devise", "Webhooks pour les mises à jour en temps réel"].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-neutral-700 mt-4">
          Vous serez redirigé vers Shopify pour autoriser l'accès
        </p>
      </div>
    </div>
  )
}
