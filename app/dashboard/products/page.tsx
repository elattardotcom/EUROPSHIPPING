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
  storeId:   string
  storeName: string
  domain:    string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search,   setSearch]   = useState("")
  const [loading,  setLoading]  = useState(true)
  const [syncing,  setSyncing]  = useState(false)
  const [storeId,  setStoreId]  = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/client/products")
      const data = await res.json()
      const list: Product[] = Array.isArray(data) ? data : []
      setProducts(list)
      if (list.length > 0) setStoreId(list[0].storeId)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleSync = async () => {
    if (!storeId) return
    setSyncing(true)
    await fetch("/api/shopify/sync-store", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ storeId }),
    }).catch(() => {})
    await loadProducts()
    setSyncing(false)
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Produits</h1>
        <p className="text-neutral-500 text-sm mb-8">Connectez votre boutique Shopify pour voir vos produits</p>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
            <ShoppingBag className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucun produit synchronisé</h2>
          <p className="text-neutral-500 text-sm max-w-sm mb-6">
            Connectez votre boutique Shopify pour synchroniser automatiquement vos produits.
          </p>
          <Link href="/dashboard/stores">
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produits</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {products[0]?.storeName} · {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {storeId && (
            <Button onClick={handleSync} disabled={syncing} variant="ghost" size="sm"
              className="text-neutral-400 hover:text-white hover:bg-white/5 border border-neutral-800">
              {syncing
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Sync…</>
                : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Synchroniser</>
              }
            </Button>
          )}
          <Link href="/dashboard/stores">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouvelle boutique
            </Button>
          </Link>
        </div>
      </div>

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
                id:                 p.id,
                title:              p.title,
                image_url:          p.imageUrl,
                price:              p.price,
                currency:           p.currency,
                presentment_prices: [],
              }}
              countryCode="FR"
              currencyCode={p.currency}
            />
          ))}
        </div>
      )}
    </div>
  )
}
