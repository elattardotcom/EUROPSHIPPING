"use client"

import { useState } from "react"
import { Package, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  currency: string
  stock: number
  status: "active" | "draft" | "out_of_stock"
  store: string
  image: string
  orders: number
}

const mockProducts: Product[] = [
  { id: "1", name: "Premium Fitness Band Pro", sku: "FBP-001", price: 69.50, currency: "EUR", stock: 245, status: "active", store: "Main Store Portugal", image: "/placeholder.svg", orders: 156 },
  { id: "2", name: "Smart Watch Elite", sku: "SWE-002", price: 129.00, currency: "EUR", stock: 89, status: "active", store: "Main Store Portugal", image: "/placeholder.svg", orders: 98 },
  { id: "3", name: "Wireless Earbuds Max", sku: "WEM-003", price: 49.90, currency: "EUR", stock: 0, status: "out_of_stock", store: "Store Spain", image: "/placeholder.svg", orders: 234 },
  { id: "4", name: "Portable Charger Ultra", sku: "PCU-004", price: 39.90, currency: "EUR", stock: 567, status: "active", store: "Store Spain", image: "/placeholder.svg", orders: 445 },
  { id: "5", name: "LED Desk Lamp Smart", sku: "LDS-005", price: 54.90, currency: "EUR", stock: 34, status: "active", store: "Store France", image: "/placeholder.svg", orders: 67 },
  { id: "6", name: "Massage Gun Pro", sku: "MGP-006", price: 89.90, currency: "EUR", stock: 12, status: "draft", store: "Main Store Portugal", image: "/placeholder.svg", orders: 0 },
]

function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    active: "bg-emerald-500/20 text-emerald-400",
    draft: "bg-neutral-500/20 text-neutral-400",
    out_of_stock: "bg-red-500/20 text-red-400",
  }

  const labels = {
    active: "Active",
    draft: "Draft",
    out_of_stock: "Out of Stock",
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function ProductsPage() {
  const [products] = useState(mockProducts)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-neutral-500">Manage your COD products across all connected stores</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Active Products</p>
          <p className="text-2xl font-bold text-emerald-500">{products.filter(p => p.status === "active").length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-500">{products.filter(p => p.status === "out_of_stock").length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm text-neutral-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white">{products.reduce((acc, p) => acc + p.orders, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-64 bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <Button variant="outline" className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
            <div className="aspect-video bg-neutral-800 flex items-center justify-center relative">
              <Package className="w-12 h-12 text-neutral-600" />
              <div className="absolute top-3 right-3">
                <ProductStatusBadge status={product.status} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-medium mb-1">{product.name}</h3>
                  <p className="text-xs text-neutral-500">SKU: {product.sku}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-white">
                  {product.currency === "EUR" ? "€" : "$"}{product.price.toFixed(2)}
                </span>
                <span className={`text-sm ${product.stock > 0 ? "text-neutral-400" : "text-red-500"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                <span>{product.store}</span>
                <span>{product.orders} orders</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white gap-1">
                  <Eye className="w-3 h-3" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white gap-1">
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
