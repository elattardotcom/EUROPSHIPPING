"use client"

import { useState, useEffect } from "react"
import { Package, Search, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  shopifyId: string
  title: string
  imageUrl: string | null
  price: number
  currency: string
  storeId: string
  storeName: string
  domain: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")

  useEffect(() => {
    fetch("/api/client/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.storeName.toLowerCase().includes(search.toLowerCase())
  )

  const stores = [...new Set(products.map(p => p.storeName))].length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-neutral-500 animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-neutral-500">Manage your COD products across all connected stores</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-neutral-900 border border-neutral-800 rounded-xl gap-4">
          <Package className="w-12 h-12 text-neutral-600" />
          <p className="text-neutral-400">No products found. Connect a Shopify store to sync your products.</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => window.location.href = "/dashboard/stores"}
          >
            Connect a Store
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-neutral-500">Manage your COD products across all connected stores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Connected Stores</p>
          <p className="text-2xl font-bold text-orange-500">{stores}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Last Sync</p>
          <p className="text-2xl font-bold text-white text-sm">
            {products[0] ? new Date(products[0].updatedAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
            <div className="aspect-video bg-neutral-800 flex items-center justify-center relative overflow-hidden">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-12 h-12 text-neutral-600" />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium mb-1 truncate">{product.title}</h3>
              <p className="text-xs text-neutral-500 mb-3">ID: {product.shopifyId}</p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-white">
                  {product.currency === "EUR" ? "€" : product.currency}{product.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                <span>{product.storeName}</span>
                <a
                  href={`https://${product.domain}/products`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View in store
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
