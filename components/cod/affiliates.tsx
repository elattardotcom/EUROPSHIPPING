"use client"

import { useState } from "react"
import {
  Gift,
  Plus,
  Search,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Link2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Offer {
  id: string
  name: string
  product: string
  commission: number
  commissionType: "percent" | "fixed"
  status: "active" | "paused" | "ended"
  affiliates: number
  clicks: number
  conversions: number
  revenue: number
  currency: string
  createdAt: string
}

interface Affiliate {
  id: string
  initials: string
  name: string
  email: string
  status: "active" | "pending" | "suspended"
  earnings: number
  conversions: number
  clicks: number
  joinedAt: string
  referralCode: string
}

const mockOffers: Offer[] = [
  { id: "1", name: "Summer Fitness Offer", product: "Premium Fitness Band Pro", commission: 15, commissionType: "percent", status: "active", affiliates: 12, clicks: 1240, conversions: 87, revenue: 6090, currency: "EUR", createdAt: "Apr 1st, 2025" },
  { id: "2", name: "Smart Watch Campaign", product: "Smart Watch Elite", commission: 20, commissionType: "fixed", status: "active", affiliates: 8, clicks: 890, conversions: 54, revenue: 1080, currency: "EUR", createdAt: "Mar 15th, 2025" },
  { id: "3", name: "Earbuds Spring Promo", product: "Wireless Earbuds Max", commission: 10, commissionType: "percent", status: "paused", affiliates: 5, clicks: 340, conversions: 18, revenue: 890, currency: "EUR", createdAt: "Mar 1st, 2025" },
  { id: "4", name: "Charger Bundle Offer", product: "Portable Charger Ultra", commission: 5, commissionType: "fixed", status: "ended", affiliates: 3, clicks: 210, conversions: 29, revenue: 145, currency: "EUR", createdAt: "Feb 1st, 2025" },
]

const mockAffiliates: Affiliate[] = [
  { id: "1", initials: "ML", name: "Miguel Lima", email: "miguel@example.com", status: "active", earnings: 1240, conversions: 34, clicks: 420, joinedAt: "Mar 5th, 2025", referralCode: "MIGUEL34" },
  { id: "2", initials: "AS", name: "Ana Silva", email: "ana@example.com", status: "active", earnings: 890, conversions: 28, clicks: 310, joinedAt: "Mar 12th, 2025", referralCode: "ANA28" },
  { id: "3", initials: "RC", name: "Rui Costa", email: "rui@example.com", status: "active", earnings: 650, conversions: 19, clicks: 240, joinedAt: "Apr 2nd, 2025", referralCode: "RUI19" },
  { id: "4", initials: "JM", name: "João Martins", email: "joao@example.com", status: "pending", earnings: 0, conversions: 0, clicks: 0, joinedAt: "May 1st, 2025", referralCode: "JOAO01" },
  { id: "5", initials: "CF", name: "Carla Ferreira", email: "carla@example.com", status: "suspended", earnings: 120, conversions: 4, clicks: 55, joinedAt: "Feb 20th, 2025", referralCode: "CARLA4" },
]

function OfferStatusBadge({ status }: { status: Offer["status"] }) {
  const styles = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ended: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  }
  const icons = {
    active: CheckCircle,
    paused: Clock,
    ended: XCircle,
  }
  const labels = { active: "Active", paused: "Paused", ended: "Ended" }
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {labels[status]}
    </span>
  )
}

function AffiliateStatusBadge({ status }: { status: Affiliate["status"] }) {
  const styles = {
    active: "bg-emerald-500/20 text-emerald-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    suspended: "bg-red-500/20 text-red-400",
  }
  const labels = { active: "Active", pending: "Pending", suspended: "Suspended" }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState<"offers" | "affiliates">("offers")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const totalEarningsPaid = mockAffiliates.reduce((acc, a) => acc + a.earnings, 0)
  const totalConversions = mockAffiliates.reduce((acc, a) => acc + a.conversions, 0)
  const totalClicks = mockAffiliates.reduce((acc, a) => acc + a.clicks, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Affiliates</h1>
          <p className="text-sm text-neutral-500">Manage affiliate offers and track partner performance</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          {activeTab === "offers" ? "New Offer" : "Invite Affiliate"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Active Offers</p>
              <p className="text-2xl font-bold text-white">{mockOffers.filter(o => o.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Active Affiliates</p>
              <p className="text-2xl font-bold text-white">{mockAffiliates.filter(a => a.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Conversions</p>
              <p className="text-2xl font-bold text-white">{totalConversions}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Commissions Paid</p>
              <p className="text-2xl font-bold text-white">{totalEarningsPaid.toLocaleString()} EUR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {[
          { id: "offers", label: "Offers" },
          { id: "affiliates", label: "Affiliates" },
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

      {/* Offers Tab */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search offers..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockOffers.map((offer) => (
              <div key={offer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{offer.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{offer.product}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OfferStatusBadge status={offer.status} />
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs text-neutral-500">Affiliate Link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-orange-400 flex-1 truncate">codship.com/aff/{offer.id}-{offer.name.toLowerCase().replace(/ /g, "-")}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {offer.commission}{offer.commissionType === "percent" ? "%" : "€"}
                    </p>
                    <p className="text-xs text-neutral-500">Commission</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{offer.affiliates}</p>
                    <p className="text-xs text-neutral-500">Affiliates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{offer.clicks.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">{offer.conversions}</p>
                    <p className="text-xs text-neutral-500">Conversions</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Revenue: <span className="text-white font-medium">{offer.revenue.toLocaleString()} {offer.currency}</span></span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-white">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affiliates Tab */}
      {activeTab === "affiliates" && (
        <div className="space-y-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search affiliates..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Affiliate</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Referral Code</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Clicks</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Conversions</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Earnings</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockAffiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                            {affiliate.initials}
                          </div>
                          <div>
                            <p className="text-sm text-white">{affiliate.name}</p>
                            <p className="text-xs text-neutral-500">{affiliate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <AffiliateStatusBadge status={affiliate.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">{affiliate.referralCode}</code>
                          <button
                            onClick={() => copyCode(affiliate.referralCode)}
                            className="text-neutral-500 hover:text-white transition-colors"
                          >
                            {copiedCode === affiliate.referralCode
                              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              : <Copy className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{affiliate.clicks.toLocaleString()}</td>
                      <td className="p-4 text-sm text-neutral-300">{affiliate.conversions}</td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-emerald-400">{affiliate.earnings.toLocaleString()} EUR</span>
                      </td>
                      <td className="p-4 text-sm text-neutral-500">{affiliate.joinedAt}</td>
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
          </div>
        </div>
      )}
    </div>
  )
}
