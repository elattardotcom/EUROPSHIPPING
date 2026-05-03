"use client"

import { useState } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Phone, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Lead {
  id: string
  initials: string
  name: string
  status: "CONFIRMED" | "PENDING" | "UNREACHED" | "CANCELED" | "ERRORS"
  country: string
  countryCode: string
  orderValue: number
  currency: string
  createdAt: string
  createdTime: string
}

const mockLeads: Lead[] = [
  { id: "1", initials: "SD", name: "Sonia de Jesus freitas moreira", status: "UNREACHED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 10th, 2025", createdTime: "12:55 PM" },
  { id: "2", initials: "PL", name: "Pedro Leite-Pereira", status: "UNREACHED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 10th, 2025", createdTime: "10:10 AM" },
  { id: "3", initials: "J-", name: "Joaquim -", status: "CONFIRMED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 10th, 2025", createdTime: "9:04 AM" },
  { id: "4", initials: "RV", name: "Rui veiga", status: "UNREACHED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 9th, 2025", createdTime: "9:13 AM" },
  { id: "5", initials: "R-", name: "Rosa -", status: "CONFIRMED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 9th, 2025", createdTime: "9:01 AM" },
  { id: "6", initials: "A-", name: "Amamdio -", status: "UNREACHED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 9th, 2025", createdTime: "6:55 AM" },
  { id: "7", initials: "JA", name: "Jose Antonio Monteiro Sousa", status: "CONFIRMED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 8th, 2025", createdTime: "11:27 PM" },
  { id: "8", initials: "MF", name: "Maria Fernanda Silva", status: "PENDING", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 8th, 2025", createdTime: "8:45 PM" },
  { id: "9", initials: "CA", name: "Carlos Almeida", status: "CANCELED", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 8th, 2025", createdTime: "5:30 PM" },
  { id: "10", initials: "LM", name: "Luis Miguel Santos", status: "ERRORS", country: "Portugal", countryCode: "PT", orderValue: 69.50, currency: "EUR", createdAt: "May 8th, 2025", createdTime: "2:15 PM" },
]

function StatusBadge({ status }: { status: Lead["status"] }) {
  const styles = {
    CONFIRMED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    UNREACHED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELED: "bg-red-500/20 text-red-400 border-red-500/30",
    ERRORS: "bg-red-600/20 text-red-500 border-red-600/30",
  }

  const icons = {
    CONFIRMED: CheckCircle,
    PENDING: Clock,
    UNREACHED: Phone,
    CANCELED: XCircle,
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

export default function LeadsPage() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalItems = 34

  const toggleSelectAll = () => {
    if (selectedLeads.length === mockLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(mockLeads.map(l => l.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Leads</h1>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-64 bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <Button variant="outline" className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Export Leads
          </Button>
        </div>
      </div>

      {/* All Leads Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-medium text-white">All Leads</h2>
          <p className="text-sm text-neutral-500">You have {totalItems} leads in your pipeline.</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4 text-sm font-medium text-neutral-400 w-12">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === mockLeads.length}
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
              {mockLeads.map((lead, index) => (
                <tr 
                  key={lead.id} 
                  className={`border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors ${
                    selectedLeads.includes(lead.id) ? "bg-orange-500/5" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-medium">
                        {lead.initials}
                      </div>
                      <span className="text-sm text-white">{lead.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CountryFlag countryCode={lead.countryCode} />
                      <span className="text-sm text-neutral-300">{lead.countryCode}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white">
                      {lead.currency === "EUR" ? "€" : "$"}{lead.orderValue.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-white">{lead.createdAt}</div>
                      <div className="text-neutral-500">{lead.createdTime}</div>
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
              Showing 1 to {itemsPerPage} of {totalItems} items
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
