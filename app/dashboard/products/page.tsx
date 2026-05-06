"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search, RefreshCw, ShoppingBag, Plus, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shopify/ProductCard"

interface Product {
  id:        string
  shopifyId: string
  title:     string
  imageUrl:  string | null
  price:     number
  currency:  string
  stock:     number | null
  storeId:   string
  storeName: string
  domain:    string
  updatedAt: string
}

export default function ProductsPage() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [search,    setSearch]    = useState("")
  const [loading,   setLoading]   = useState(true)
  const [syncing,   setSyncing]   = useState(false)
  const [storeId,   setStoreId]   = useState<string | null>(null)
  const [notAuth,   setNotAuth]   = useState(false)
  const [noStore,   setNoStore]   = useState(false)
  const [syncError, setSyncError] = useState("")

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setSyncError("")
    try {
      const res  = await fetch("/api/client/products")
      if (res.status === 401) { setNotAuth(true); return }
      const data = await res.json()
      if (!Array.isArray(data)) { setNoStore(true); return }
      const list: Product[] = data
      setProducts(list)
      if (list.length > 0) {
        setStoreId(list[0].storeId)
        setNoStore(false)
      }
    } catch {
      setSyncError("Erreur de chargement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if stores are connected even when no products yet
  const checkStore = useCallback(async () => {
    try {
      const res = await fetch("/api/stores")
      if (!res.ok) return
      const stores = await res.json()
      if (Array.isArray(stores) && stores.length > 0) {
        setStoreId(stores[0].id)
        setNoStore(false)
      } else {
        setNoStore(true)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleSync = async () => {
    if (!storeId) return
    setSyncing(true)
    setSyncError("")
    try {
      const res = await fetch("/api/shopify/sync-store", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ storeId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSyncError(err?.error ?? "Erreur lors de la synchronisation")
      }
    } catch {
      setSyncError("Erreur réseau. Veuillez réessayer.")
    }
    await loadProducts()
    setSyncing(false)
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-neutral-500 text-sm">Chargement des produits…</p>
      </div>
    )
  }

  if (notAuth) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
        <ShoppingBag className="w-12 h-12 text-neutral-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Session expirée</h2>
        <p className="text-neutral-500 text-sm mb-6">Veuillez vous reconnecter pour voir vos produits.</p>
        <Link href="/login">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Se connecter</Button>
        </Link>
      </div>
    )
  }

  if (products.length === 0) {
    const hasStore = !!storeId

    // If we have a store but no products yet, show sync option
    if (hasStore) {
      return (
        <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
            <RefreshCw className={`w-10 h-10 text-orange-500 ${syncing ? "animate-spin" : ""}`} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Boutique connectée</h2>
          <p className="text-neutral-500 text-sm max-w-sm mb-2">
            Votre boutique Shopify est liée mais aucun produit n'a encore été synchronisé.
          </p>
          {syncError && <p className="text-red-400 text-xs mb-4">{syncError}</p>}
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-4"
          >
            {syncing
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Synchronisation…</>
              : <><RefreshCw className="w-4 h-4 mr-2" />Synchroniser les produits</>
            }
          </Button>
        </div>
      )
    }

    return (
      <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Aucune boutique connectée</h2>
        <p className="text-neutral-500 text-sm max-w-sm mb-6">
          Connectez votre boutique Shopify pour synchroniser automatiquement vos produits.
        </p>
        <Link href="/dashboard/stores">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Connecter Shopify
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produits</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {products[0]?.storeName} · {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing} variant="ghost" size="sm"
            className="text-neutral-400 hover:text-white hover:bg-white/5 border border-neutral-800">
            {syncing
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Sync…</>
              : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Synchroniser</>
            }
          </Button>
          <Link href="/dashboard/stores">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouvelle boutique
            </Button>
          </Link>
        </div>
      </div>

      {syncError && (
        <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {syncError}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Aucun produit ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={{
                id:        p.id,
                title:     p.title,
                image_url: p.imageUrl,
                price:     p.price,
                currency:  p.currency,
                stock:     p.stock,
                storeName: p.storeName,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
