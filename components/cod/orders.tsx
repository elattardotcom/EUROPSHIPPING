"use client"

import { useState } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Truck, CheckCircle, XCircle, Clock, AlertCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  initials: string
  name: string
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "ERRORS"
  country: string
  countryCode: string
  orderValue: number
  currency: string
  createdAt: string
  createdTime: string
  trackingNumber?: string
}

const mockOrders: Order[] = [
  { id: "1", initials: "JA", name: "Jose Antonio Monteiro Sous", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 9th, 2025", createdTime: "5:02 PM", trackingNumber: "PT123456789" },
  { id: "2", initials: "J-", name: "Jose -", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 9th, 2025", createdTime: "4:57 PM" },
  { id: "3", initials: "JT", name: "Joao Tavares", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 7th, 2025", createdTime: "5:38 PM" },
  { id: "4", initials: "JS", name: "Juliano Silva Lopes", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 7th, 2025", createdTime: "5:33 PM" },
  { id: "5", initials: "J-", name: "Joao -", status: "ERRORS", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 6th, 2025", createdTime: "2:09 PM" },
  { id: "6", initials: "ET", name: "Edson Teodoro da Silva", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 6th, 2025", createdTime: "2:07 PM" },
  { id: "7", initials: "DF", name: "delfim Faustino", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 6th, 2025", createdTime: "2:03 PM" },
  { id: "8", initials: "AL", name: "Adilson lopes cardoso", status: "SHIPPED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 6th, 2025", createdTime: "1:45 PM", trackingNumber: "PT987654321" },
]

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    SHIPPED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DELIVERED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    RETURNED: "bg-red-500/20 text-red-400 border-red-500/30",
    ERRORS: "bg-red-600/20 text-red-500 border-red-600/30",
  }

  const icons = {
    PENDING: Clock,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    RETURNED: XCircle,
    ERRORS: AlertCircle,
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}

function CountryFlag({ countryCode }: { countryCode: string }) {
  const flags: Record<string, string> = {
    PT: "🇵🇹",
    ES: "🇪🇸",
    FR: "🇫🇷",
    DE: "🇩🇪",
    IT: "🇮🇹",
  }
  return <span className="text-lg">{flags[countryCode] || "🏳️"}</span>
}

export default function OrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalItems = 8

  const toggleSelectAll = () => {
    if (selectedOrders.length === mockOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(mockOrders.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Orders</h1>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-64 bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <Button variant="outline" className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-2">
            <Package className="w-4 h-4" />
            Bulk Actions
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Export Orders
          </Button>
        </div>
      </div>

      {/* All Orders Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-medium text-white">All Orders</h2>
          <p className="text-sm text-neutral-500">You have {totalItems} orders in your pipeline.</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4 text-sm font-medium text-neutral-400 w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === mockOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Country</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Order Value</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Created</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors ${
                    selectedOrders.includes(order.id) ? "bg-orange-500/5" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-medium">
                        {order.initials}
                      </div>
                      <span className="text-sm text-white">{order.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CountryFlag countryCode={order.countryCode} />
                      <span className="text-sm text-neutral-300">{order.countryCode}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white">
                      {order.currency === "EUR" ? "€" : "$"}{order.orderValue.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-white">{order.createdAt}</div>
                      <div className="text-neutral-500">{order.createdTime}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-neutral-400">
              Showing 1 to {totalItems} of {totalItems} items
            </span>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
