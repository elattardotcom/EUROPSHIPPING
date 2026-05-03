"use client"

import { useEffect, useState, useCallback } from "react"
import { getClientIdFromCookie } from "@/lib/client-cookie"
import Link from "next/link"
import { Search, RefreshCw, ShoppingBag, Plus, Loader2, AlertCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shopify/ProductCard"
import { getSupabase } from "@/lib/supabase"
import type { PresentmentPrice } from "@/lib/shopify"

interface Product {
  id:                 string
  title:              string
  image_url:          string | null
  price:              number
  currency:           string
  presentment_prices: PresentmentPrice[]
}

interface Store {
  id:          string
  name:        string
  domain:      string
  status:      string
  last_sync:   string | null
  access_token: string | null
}

export default function ProductsPage() {
  const [products,    setProducts]    = useState<Product[]>([])
  const [store,       setStore]       = useState<Store | null>(null)
  const [countryCode, setCountryCode] = useState("FR")
  const [currencyCode,setCurrencyCode]= useState("EUR")
  const [search,      setSearch]      = useState("")
  const [loading,     setLoading]     = useState(true)
  const [syncing,     setSyncing]     = useState(false)
  const [error,       setError]       = useState("")
  const [clientId,    setClientId]    = useState(getClientIdFromCookie)

  // Détection du pays via l'IP
  useEffect(() => {
    fetch("/api/geo")
      .then(r => r.json())
      .then(d => { setCountryCode(d.countryCode); setCurrencyCode(d.currencyCode) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(c => { if (c?.id) setClientId(c.id) })
      .catch(() => {})
  }, [])

  // Charge les produits depuis Supabase
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    const sb = getSupabase()
    if (!sb) { setLoading(false); return }

    // Récupère la boutique connectée du client
    const { data: storeData } = await sb
      .from("stores")
      .select("id, name, domain, status, last_sync, access_token")
      .eq("client_id", clientId)
      .eq("status", "connected")
      .not("access_token", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    setStore(storeData ?? null)

    if (!storeData) { setLoading(false); return }

    // Récupère les produits de cette boutique
    const { data: productData, error: pErr } = await sb
      .from("products")
      .select("id, title, image_url, price, currency, presentment_prices")
      .eq("store_id", storeData.id)
      .order("created_at", { ascending: false })

    if (pErr) setError(pErr.message)
    setProducts(productData ?? [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Re-sync manuelle depuis l'API Shopify
  const handleSync = async () => {
    if (!store?.access_token) return
    setSyncing(true)
    await fetch("/api/shopify/sync", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ storeId: store.id, shop: store.domain, accessToken: store.access_token }),
    }).catch(() => {})
    await loadProducts()
    setSyncing(false)
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  /* ── Pas de boutique connectée ── */
  if (!loading && !store) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Produits</h1>
        <p className="text-neutral-500 text-sm mb-8">Connectez votre boutique Shopify pour voir vos produits</p>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
            <ShoppingBag className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucune boutique connectée</h2>
          <p className="text-neutral-500 text-sm max-w-sm mb-6">
            Connectez votre boutique Shopify pour synchroniser automatiquement vos produits.
          </p>
          <Link href="/connect">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Connecter Shopify
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produits</h1>
          {store && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {store.name} · {products.length} produit{products.length !== 1 ? "s" : ""}
              {store.last_sync && (
                <span className="ml-2 text-neutral-700">
                  · Sync {new Date(store.last_sync).toLocaleDateString("fr-FR")}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {store?.access_token && (
            <Button onClick={handleSync} disabled={syncing} variant="ghost" size="sm"
              className="text-neutral-400 hover:text-white hover:bg-white/5 border border-neutral-800">
              {syncing
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Sync…</>
                : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Synchroniser</>
              }
            </Button>
          )}
          <Link href="/connect">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouvelle boutique
            </Button>
          </Link>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Connexion réussie */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("connected") === "1" && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm">
            Boutique connectée avec succès ! Vos produits sont en cours de synchronisation.
          </p>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Grille produits */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">
            {search ? "Aucun produit ne correspond à votre recherche." : "Aucun produit synchronisé."}
          </p>
          {!search && store?.access_token && (
            <Button onClick={handleSync} variant="ghost" size="sm" className="mt-3 text-orange-400 hover:text-orange-300">
              Lancer la synchronisation
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              countryCode={countryCode}
              currencyCode={currencyCode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
