"use client"

import { useState } from "react"
import {
  Boxes,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  TrendingUp,
  ShoppingCart,
  Package,
  Truck,
  Eye,
  Edit,
  Trash2,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DropOffer {
  id: string
  name: string
  supplier: string
  price: number
  sellingPrice: number
  margin: number
  currency: string
  status: "active" | "paused" | "ended"
  stock: number
  orders: number
  revenue: number
  category: string
  rating: number
  shippingDays: string
  imageColor: string
}

const mockDropOffers: DropOffer[] = [
  {
    id: "1",
    name: "Premium Fitness Tracker X3",
    supplier: "ShenzhenTech",
    price: 12.50,
    sellingPrice: 69.90,
    margin: 82.1,
    currency: "EUR",
    status: "active",
    stock: 500,
    orders: 234,
    revenue: 16356,
    category: "Fitness",
    rating: 4.8,
    shippingDays: "3-5",
    imageColor: "from-orange-500 to-red-600",
  },
  {
    id: "2",
    name: "Smart LED Desk Lamp Pro",
    supplier: "GuangzhouElec",
    price: 8.90,
    sellingPrice: 44.90,
    margin: 80.2,
    currency: "EUR",
    status: "active",
    stock: 320,
    orders: 156,
    revenue: 7004,
    category: "Home & Office",
    rating: 4.6,
    shippingDays: "4-7",
    imageColor: "from-blue-500 to-cyan-600",
  },
  {
    id: "3",
    name: "Portable Massage Gun Mini",
    supplier: "WellnessGlobal",
    price: 15.00,
    sellingPrice: 79.90,
    margin: 81.2,
    currency: "EUR",
    status: "active",
    stock: 180,
    orders: 98,
    revenue: 7830,
    category: "Wellness",
    rating: 4.9,
    shippingDays: "3-5",
    imageColor: "from-purple-500 to-violet-600",
  },
  {
    id: "4",
    name: "Magnetic Phone Car Mount",
    supplier: "ShenzhenTech",
    price: 3.20,
    sellingPrice: 24.90,
    margin: 87.1,
    currency: "EUR",
    status: "paused",
    stock: 0,
    orders: 412,
    revenue: 10259,
    category: "Car Accessories",
    rating: 4.5,
    shippingDays: "5-8",
    imageColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "5",
    name: "Wireless Charging Pad 15W",
    supplier: "PowerTechCN",
    price: 5.50,
    sellingPrice: 34.90,
    margin: 84.2,
    currency: "EUR",
    status: "active",
    stock: 250,
    orders: 67,
    revenue: 2338,
    category: "Electronics",
    rating: 4.3,
    shippingDays: "4-6",
    imageColor: "from-yellow-500 to-amber-600",
  },
  {
    id: "6",
    name: "Posture Corrector Belt",
    supplier: "HealthFirst",
    price: 6.00,
    sellingPrice: 39.90,
    margin: 85.0,
    currency: "EUR",
    status: "ended",
    stock: 0,
    orders: 189,
    revenue: 7542,
    category: "Health",
    rating: 4.7,
    shippingDays: "5-7",
    imageColor: "from-rose-500 to-pink-600",
  },
]

function StatusBadge({ status }: { status: DropOffer["status"] }) {
  const styles = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ended: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  }
  const icons = { active: CheckCircle, paused: Clock, ended: XCircle }
  const labels = { active: "Active", paused: "Paused", ended: "Ended" }
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {labels[status]}
    </span>
  )
}

export default function CodDropPage() {
  const [activeTab, setActiveTab] = useState<"offers" | "catalog">("offers")
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = mockDropOffers.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = mockDropOffers.reduce((acc, o) => acc + o.revenue, 0)
  const totalOrders = mockDropOffers.reduce((acc, o) => acc + o.orders, 0)
  const activeOffers = mockDropOffers.filter(o => o.status === "active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">COD Drop</h1>
          <p className="text-sm text-neutral-500">Manage your dropshipping offers and explore new products</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Offer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Active Offers</p>
              <p className="text-2xl font-bold text-white">{activeOffers}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} EUR</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg. Margin</p>
              <p className="text-2xl font-bold text-white">
                {(mockDropOffers.reduce((acc, o) => acc + o.margin, 0) / mockDropOffers.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {[
          { id: "offers", label: "My Offers" },
          { id: "catalog", label: "Product Catalog" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-orange-500/10 text-orange-500"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder={activeTab === "offers" ? "Search offers..." : "Search catalog..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Offers Grid */}
      {activeTab === "offers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((offer) => (
            <div key={offer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
              <div className={`h-32 bg-gradient-to-br ${offer.imageColor} flex items-center justify-center relative`}>
                <Package className="w-14 h-14 text-white/30" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={offer.status} />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-white">{offer.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium text-sm">{offer.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{offer.supplier} · {offer.category}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-7 w-7">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Cost</p>
                    <p className="text-sm font-semibold text-white">€{offer.price.toFixed(2)}</p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Price</p>
                    <p className="text-sm font-semibold text-orange-400">€{offer.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Margin</p>
                    <p className="text-sm font-semibold text-emerald-400">{offer.margin}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span className={offer.stock > 0 ? "text-neutral-400" : "text-red-400"}>
                    {offer.stock > 0 ? `${offer.stock} in stock` : "Out of stock"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {offer.shippingDays} days
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-neutral-500">{offer.orders} orders</span>
                  <span className="text-emerald-400 font-medium">{offer.revenue.toLocaleString()} EUR revenue</span>
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
      )}

      {/* Catalog Tab */}
      {activeTab === "catalog" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Boxes className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Product Catalog</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Browse thousands of winning products from verified suppliers. Import them directly to your COD Drop offers with one click.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
            {[
              { title: "Verified Suppliers", desc: "All suppliers are verified and quality-checked", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/20" },
              { title: "Fast Shipping", desc: "3-7 day delivery to Portugal, Spain, France", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/20" },
              { title: "High Margins", desc: "Products with 70%+ average profit margins", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/20" },
            ].map((item) => (
              <div key={item.title} className="bg-neutral-800/50 rounded-xl p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Boxes className="w-4 h-4" />
            Browse Catalog
          </Button>
        </div>
      )}
    </div>
  )
}
