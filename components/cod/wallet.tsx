"use client"

import { useState } from "react"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Building2,
  Euro,
  Calendar,
  FileText,
  Eye,
  MoreHorizontal,
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "payout"
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
  description: string
  reference: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: "paid" | "pending" | "overdue"
  date: string
  dueDate: string
  description: string
}

const transactions: Transaction[] = [
  { id: "1", type: "deposit", amount: 1250.00, status: "completed", date: "May 10th, 2025", description: "Order Payout - Batch #1247", reference: "TXN-2025-001247" },
  { id: "2", type: "withdrawal", amount: 500.00, status: "completed", date: "May 9th, 2025", description: "Bank Transfer - IBAN ***4521", reference: "WTH-2025-000892" },
  { id: "3", type: "deposit", amount: 890.50, status: "completed", date: "May 8th, 2025", description: "Order Payout - Batch #1246", reference: "TXN-2025-001246" },
  { id: "4", type: "withdrawal", amount: 1000.00, status: "pending", date: "May 8th, 2025", description: "Bank Transfer - IBAN ***4521", reference: "WTH-2025-000891" },
  { id: "5", type: "deposit", amount: 2340.00, status: "completed", date: "May 7th, 2025", description: "Order Payout - Batch #1245", reference: "TXN-2025-001245" },
  { id: "6", type: "withdrawal", amount: 750.00, status: "failed", date: "May 6th, 2025", description: "Bank Transfer - IBAN ***4521", reference: "WTH-2025-000890" },
  { id: "7", type: "deposit", amount: 1567.25, status: "completed", date: "May 5th, 2025", description: "Order Payout - Batch #1244", reference: "TXN-2025-001244" },
]

const invoices: Invoice[] = [
  { id: "1", number: "INV-2025-0047", amount: 89.00, status: "paid", date: "May 1st, 2025", dueDate: "May 15th, 2025", description: "Monthly Platform Fee - May 2025" },
  { id: "2", number: "INV-2025-0046", amount: 156.50, status: "paid", date: "Apr 1st, 2025", dueDate: "Apr 15th, 2025", description: "Monthly Platform Fee + SMS Pack - April 2025" },
  { id: "3", number: "INV-2025-0045", amount: 89.00, status: "paid", date: "Mar 1st, 2025", dueDate: "Mar 15th, 2025", description: "Monthly Platform Fee - March 2025" },
  { id: "4", number: "INV-2025-0044", amount: 89.00, status: "paid", date: "Feb 1st, 2025", dueDate: "Feb 15th, 2025", description: "Monthly Platform Fee - February 2025" },
  { id: "5", number: "INV-2025-0043", amount: 234.00, status: "paid", date: "Jan 1st, 2025", dueDate: "Jan 15th, 2025", description: "Monthly Platform Fee + Extra Storage - January 2025" },
]

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "invoices" | "withdraw">("overview")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const balance = 3847.75
  const pendingBalance = 1000.00
  const totalEarnings = 28450.50
  const totalWithdrawn = 24602.75

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {status === "paid" ? "Paid" : "Completed"}
          </span>
        )
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case "failed":
      case "overdue":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            {status === "overdue" ? "Overdue" : "Failed"}
          </span>
        )
      default:
        return null
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
      case "withdrawal":
      case "payout":
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />
      default:
        return <Wallet className="w-4 h-4 text-neutral-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Wallet</h1>
          <p className="text-neutral-500">Manage your balance, withdrawals and invoices</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          onClick={() => setShowWithdrawModal(true)}
        >
          <ArrowUpRight className="w-4 h-4" />
          Request Withdrawal
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-sm font-medium">Available Balance</p>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-orange-400">EUR</span></p>
          <p className="text-neutral-500 text-sm mt-2">Ready for withdrawal</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-sm font-medium">Pending Balance</p>
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{pendingBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-neutral-500">EUR</span></p>
          <p className="text-neutral-500 text-sm mt-2">Processing withdrawals</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-sm font-medium">Total Earnings</p>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalEarnings.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-neutral-500">EUR</span></p>
          <p className="text-neutral-500 text-sm mt-2">All time earnings</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neutral-400 text-sm font-medium">Total Withdrawn</p>
            <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalWithdrawn.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-neutral-500">EUR</span></p>
          <p className="text-neutral-500 text-sm mt-2">Successfully withdrawn</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "transactions", label: "Transactions" },
          { id: "invoices", label: "Invoices" },
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300" onClick={() => setActiveTab("transactions")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.type === "deposit" ? "bg-emerald-500/10" : "bg-orange-500/10"
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description}</p>
                      <p className="text-neutral-500 text-xs">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
                      {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Quick Withdrawal</h3>
            <div className="space-y-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Bank Account</p>
                    <p className="text-neutral-500 text-xs">IBAN: PT50 **** **** **** **** 4521</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                </div>
              </div>
              
              <div>
                <label className="text-neutral-400 text-sm mb-2 block">Amount to withdraw</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                </div>
                <p className="text-neutral-500 text-xs mt-2">Available: {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR</p>
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(amount.toString())}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
                  >
                    {amount} EUR
                  </button>
                ))}
                <button
                  onClick={() => setWithdrawAmount(balance.toString())}
                  className="flex-1 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm transition-colors"
                >
                  Max
                </button>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Request Withdrawal
              </Button>

              <p className="text-neutral-500 text-xs text-center">
                Withdrawals are processed within 1-3 business days
              </p>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Invoices</h3>
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300" onClick={() => setActiveTab("invoices")}>
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-neutral-500 text-sm border-b border-neutral-800">
                    <th className="pb-3 font-medium">Invoice</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {invoices.slice(0, 3).map((invoice) => (
                    <tr key={invoice.id} className="text-sm">
                      <td className="py-4">
                        <span className="text-orange-400 font-medium">{invoice.number}</span>
                      </td>
                      <td className="py-4 text-neutral-300">{invoice.description}</td>
                      <td className="py-4 text-neutral-400">{invoice.date}</td>
                      <td className="py-4 text-white font-medium">{invoice.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR</td>
                      <td className="py-4">{getStatusBadge(invoice.status)}</td>
                      <td className="py-4">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                          <Download className="w-4 h-4" />
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

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-white font-semibold">All Transactions</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-64"
                />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-neutral-500 text-sm border-b border-neutral-800">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-sm hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${
                        tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {getTransactionIcon(tx.type)}
                        <span className="capitalize text-xs font-medium">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-neutral-300">{tx.description}</td>
                    <td className="py-4 text-neutral-500 font-mono text-xs">{tx.reference}</td>
                    <td className="py-4 text-neutral-400">{tx.date}</td>
                    <td className="py-4">
                      <span className={`font-semibold ${tx.type === "deposit" ? "text-emerald-400" : "text-orange-400"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                      </span>
                    </td>
                    <td className="py-4">{getStatusBadge(tx.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-center pt-4 border-t border-neutral-800 mt-4">
            <p className="text-neutral-500 text-sm">Showing 1 to {transactions.length} of {transactions.length} transactions</p>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-white font-semibold">All Invoices</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 w-64"
                />
              </div>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-neutral-500 text-sm border-b border-neutral-800">
                  <th className="pb-3 font-medium">Invoice Number</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Issue Date</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="text-sm hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-500" />
                        <span className="text-orange-400 font-medium">{invoice.number}</span>
                      </div>
                    </td>
                    <td className="py-4 text-neutral-300">{invoice.description}</td>
                    <td className="py-4 text-neutral-400">{invoice.date}</td>
                    <td className="py-4 text-neutral-400">{invoice.dueDate}</td>
                    <td className="py-4 text-white font-semibold">{invoice.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR</td>
                    <td className="py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-center pt-4 border-t border-neutral-800 mt-4">
            <p className="text-neutral-500 text-sm">Showing 1 to {invoices.length} of {invoices.length} invoices</p>
          </div>
        </div>
      )}
    </div>
  )
}
