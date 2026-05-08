import { getSupabase, getSupabaseAdmin } from "./supabase"
import { ALL_ORDERS, MOCK_CLIENT, MOCK_ADMIN_ORDERS, MOCK_ADMIN_LEADS, MOCK_STORES } from "./mock-data"
import { readWithdrawals, writeWithdrawals, readAdjustments, writeAdjustments } from "./store"
import { readPaymentMethods, writePaymentMethods } from "./payment-methods-store"
import { readClients, writeClients as _wc } from "./clients-store"

/* ── Types ─────────────────────────────────────────────────────────────── */

export type Plan        = "starter" | "pro" | "enterprise"
export type UserStatus  = "active" | "suspended" | "trial" | "cancelled"
export type LeadStatus  = "CONFIRMED" | "PENDING" | "UNREACHED" | "CANCELED" | "ERROR"
export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "ERROR"
export type StoreStatus = "connected" | "syncing" | "error"
export type WithdrawalStatus   = "pending" | "approved" | "rejected"
export type PaymentMethodType  = "bank" | "wise" | "crypto"

export interface PaymentMethod {
  id:              string
  clientId:        string
  type:            PaymentMethodType
  label:           string
  // Bank (IBAN)
  iban?:           string
  bic?:            string
  accountHolder?:  string
  // Wise
  wiseEmail?:      string
  wiseCurrency?:   string
  // Crypto
  cryptoNetwork?:  string   // "BTC" | "ETH" | "USDT-TRC20" | "USDT-ERC20" | "BNB"
  cryptoAddress?:  string
  isDefault:       boolean
  createdAt:       string
}

export interface BalanceAdjustment {
  id:        string
  clientId:  string
  amount:    number   // positive = credit, negative = debit
  reason:    string
  createdAt: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  country: string
  countryCode: string
  plan: Plan
  status: UserStatus
  joinedAt: string
  monthlyRevenue: number
  totalRevenue: number
  storesCount: number
  ordersCount: number
  leadsCount: number
  lastActive: string
  avatarColor: string
}

export interface AdminOrder {
  id: string
  clientId: string
  clientName: string
  customerName: string
  customerPhone: string
  country: string
  countryCode: string
  product: string
  value: number
  currency: string
  status: OrderStatus
  store: string
  trackingNumber?: string
  createdAt: string
}

export interface AdminLead {
  id: string
  clientId: string
  clientName: string
  customerName: string
  customerPhone: string
  country: string
  countryCode: string
  product: string
  value: number
  currency: string
  status: LeadStatus
  store: string
  createdAt: string
}

export interface AdminStore {
  id: string
  clientId: string
  name: string
  domain: string
  status: StoreStatus
  country: string
  ordersToday: number
  totalOrders: number
  currency: string
  lastSync: string
}

export interface Withdrawal {
  id:                  string
  clientId:            string
  clientName:          string
  clientEmail:         string
  amount:              number
  currency:            string
  iban:                string
  status:              WithdrawalStatus
  requestedAt:         string
  processedAt?:        string
  adminNote?:          string
  paymentMethodType?:  PaymentMethodType
  paymentDetails?:     string  // JSON: method-specific details
}

/* ── Mappers ────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapClient = (r: any): Client => ({
  id:             r.id,
  firstName:      r.first_name,
  lastName:       r.last_name,
  email:          r.email,
  phone:          r.phone ?? "",
  company:        r.company ?? "",
  country:        r.country ?? "",
  countryCode:    r.country_code ?? "",
  plan:           r.plan,
  status:         r.status,
  joinedAt:       r.joined_at ?? "",
  monthlyRevenue: r.monthly_revenue ?? 0,
  totalRevenue:   r.total_revenue ?? 0,
  storesCount:    r.stores_count ?? 0,
  ordersCount:    r.orders_count ?? 0,
  leadsCount:     r.leads_count ?? 0,
  lastActive:     r.last_active ?? "",
  avatarColor:    r.avatar_color ?? "from-indigo-500 to-purple-600",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOrder = (r: any): AdminOrder => ({
  id:             r.id,
  clientId:       r.client_id,
  clientName:     r.client_name ?? "",
  customerName:   r.customer_name ?? "",
  customerPhone:  r.customer_phone ?? "",
  country:        r.country ?? "",
  countryCode:    r.country_code ?? "",
  product:        r.product ?? "",
  value:          r.value ?? 0,
  currency:       r.currency ?? "EUR",
  status:         r.status,
  store:          r.store ?? "",
  trackingNumber: r.tracking_number ?? undefined,
  createdAt:      r.created_at ?? "",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapLead = (r: any): AdminLead => ({
  id:            r.id,
  clientId:      r.client_id,
  clientName:    r.client_name ?? "",
  customerName:  r.customer_name ?? "",
  customerPhone: r.customer_phone ?? "",
  country:       r.country ?? "",
  countryCode:   r.country_code ?? "",
  product:       r.product ?? "",
  value:         r.value ?? 0,
  currency:      r.currency ?? "EUR",
  status:        r.status,
  store:         r.store ?? "",
  createdAt:     r.created_at ?? "",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStore = (r: any): AdminStore => ({
  id:          r.id,
  clientId:    r.client_id,
  name:        r.name ?? "",
  domain:      r.domain ?? "",
  status:      r.status,
  country:     r.country ?? "",
  ordersToday: r.orders_today ?? 0,
  totalOrders: r.total_orders ?? 0,
  currency:    r.currency ?? "EUR",
  lastSync:    r.last_sync ?? "",
})

const frDate = (iso?: string | null): string => {
  if (!iso) return new Date().toLocaleString("fr-FR", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit",
  }).replace(",", " à")
  return new Date(iso).toLocaleString("fr-FR", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit",
  }).replace(",", " à")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapWithdrawal = (r: any): Withdrawal => ({
  id:                  r.id,
  clientId:            r.client_id,
  clientName:          r.client_name ?? "",
  clientEmail:         r.client_email ?? "",
  amount:              r.amount ?? 0,
  currency:            r.currency ?? "EUR",
  iban:                r.iban ?? "",
  status:              r.status,
  requestedAt:         frDate(r.requested_at),
  processedAt:         r.processed_at ? frDate(r.processed_at) : undefined,
  adminNote:           r.admin_note ?? undefined,
  paymentMethodType:   r.payment_method_type ?? undefined,
  paymentDetails:      r.payment_details ?? undefined,
})

/* ── Clients ────────────────────────────────────────────────────────────── */

const PLAN_PRICE: Record<string, number> = { starter: 29, pro: 59, enterprise: 89 }
const AVATAR_COLORS = [
  "from-orange-500 to-red-600", "from-teal-500 to-emerald-600",
  "from-blue-500 to-cyan-600",  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
]

export async function getClients(): Promise<Client[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return []
  try {
    const [clientsRes, ordersRes, leadsRes, storesRes] = await Promise.all([
      sb.from("clients").select("*"),
      sb.from("orders").select("client_id"),
      sb.from("leads").select("client_id"),
      sb.from("stores").select("client_id"),
    ])
    const orders = ordersRes.data ?? []
    const leads  = leadsRes.data  ?? []
    const stores = storesRes.data ?? []
    return (clientsRes.data ?? []).map((r, i) => ({
      id:             r.id,
      firstName:      r.first_name  ?? "",
      lastName:       r.last_name   ?? "",
      email:          r.email       ?? "",
      phone:          r.phone       ?? "",
      company:        r.company     ?? "",
      country:        r.country     ?? "",
      countryCode:    r.country_code ?? "",
      plan:           r.plan        ?? "starter",
      status:         r.status      ?? "active",
      joinedAt:       r.created_at  ?? r.joined_at ?? "",
      monthlyRevenue: PLAN_PRICE[r.plan ?? "starter"] ?? 29,
      totalRevenue:   PLAN_PRICE[r.plan ?? "starter"] ?? 29,
      storesCount:    stores.filter(s => s.client_id === r.id).length,
      ordersCount:    orders.filter(o => o.client_id === r.id).length,
      leadsCount:     leads.filter(l  => l.client_id === r.id).length,
      lastActive:     r.last_active ?? "",
      avatarColor:    AVATAR_COLORS[i % AVATAR_COLORS.length],
    }))
  } catch { return [] }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const sb = getSupabaseAdmin()
    if (!sb) {
      const file = readClients()
      return file.find(c => c.id === id) ?? (id === "c1" ? MOCK_CLIENT : null)
    }
    const { data, error } = await sb.from("clients").select("*").eq("id", id).single()
    if (error) throw error
    return data ? mapClient(data) : (id === "c1" ? MOCK_CLIENT : null)
  } catch {
    const file = readClients()
    return file.find(c => c.id === id) ?? (id === "c1" ? MOCK_CLIENT : null)
  }
}

/* ── Orders ─────────────────────────────────────────────────────────────── */

export async function getAllOrders(): Promise<AdminOrder[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapOrder)
  } catch { return [] }
}

export async function getClientOrders(clientId: string): Promise<AdminOrder[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("orders").select("*").eq("client_id", clientId).order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapOrder)
  } catch { return [] }
}

/* ── Leads ──────────────────────────────────────────────────────────────── */

export async function getAllLeads(): Promise<AdminLead[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("leads").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapLead)
  } catch { return [] }
}

export async function getClientLeads(clientId: string): Promise<AdminLead[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("leads").select("*").eq("client_id", clientId).order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapLead)
  } catch { return [] }
}

/* ── Stores ─────────────────────────────────────────────────────────────── */

export async function getClientStores(clientId: string): Promise<AdminStore[]> {
  try {
    const sb = getSupabaseAdmin(); if (!sb) return []
    const { data, error } = await sb.from("stores").select("*").eq("client_id", clientId)
    if (error) throw error
    return (data ?? []).map(mapStore)
  } catch { return [] }
}

/* ── File-backed withdrawal store (used when Supabase is not configured) ──── */

function memCreate(payload: Omit<Withdrawal, "id" | "status" | "requestedAt" | "processedAt" | "adminNote">): Withdrawal {
  const list = readWithdrawals()
  const w: Withdrawal = {
    id:          String(Date.now()),
    clientId:    payload.clientId,
    clientName:  payload.clientName,
    clientEmail: payload.clientEmail,
    amount:      payload.amount,
    currency:    payload.currency,
    iban:        payload.iban,
    status:      "pending",
    requestedAt: frDate(new Date().toISOString()),
  }
  list.unshift(w)
  writeWithdrawals(list)
  return w
}

/* ── Withdrawals ────────────────────────────────────────────────────────── */

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return readWithdrawals()
  try {
    const { data, error } = await sb.from("withdrawals").select("*").order("requested_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapWithdrawal)
  } catch { return readWithdrawals() }
}

export async function getClientWithdrawals(clientId: string): Promise<Withdrawal[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return readWithdrawals().filter(w => w.clientId === clientId)
  try {
    const { data, error } = await sb.from("withdrawals").select("*").eq("client_id", clientId).order("requested_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapWithdrawal)
  } catch { return readWithdrawals().filter(w => w.clientId === clientId) }
}

/* Gross revenue = sum of all DELIVERED orders for this client */
async function getDeliveredRevenue(clientId: string): Promise<number> {
  if (clientId === "c1") {
    const raw = ALL_ORDERS.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.orderValue, 0)
    return Math.round(raw * 100) / 100
  }
  const sb = getSupabaseAdmin()
  if (!sb) return 0
  try {
    const { data } = await sb.from("orders").select("value").eq("client_id", clientId).eq("status", "DELIVERED")
    const raw = (data ?? []).reduce((s: number, r: { value: number }) => s + (r.value ?? 0), 0)
    return Math.round(raw * 100) / 100
  } catch { return 0 }
}

export interface BalanceSummary {
  grossRevenue: number
  adjustments:  number
  approved:     number
  pending:      number
  available:    number
}

export async function getClientAdjustments(clientId: string): Promise<BalanceAdjustment[]> {
  const sb = getSupabaseAdmin()
  if (sb) {
    try {
      const { data } = await sb
        .from("balance_adjustments")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
      if (data) return data.map((r: Record<string, unknown>) => ({
        id:        r.id as string,
        clientId:  r.client_id as string,
        amount:    r.amount as number,
        reason:    (r.reason as string) ?? "",
        createdAt: r.created_at as string,
      }))
    } catch {}
  }
  return readAdjustments().filter(a => a.clientId === clientId)
}

export async function createAdjustment(
  clientId: string, amount: number, reason: string,
): Promise<BalanceAdjustment> {
  const adj: BalanceAdjustment = {
    id:        `adj_${Date.now()}`,
    clientId,
    amount:    Math.round(amount * 100) / 100,
    reason,
    createdAt: new Date().toISOString(),
  }
  const sb = getSupabaseAdmin()
  if (sb) {
    try {
      const { data } = await sb
        .from("balance_adjustments")
        .insert({ client_id: clientId, amount: adj.amount, reason })
        .select()
        .single()
      if (data) return { id: data.id, clientId: data.client_id, amount: data.amount, reason: data.reason ?? "", createdAt: data.created_at }
    } catch {}
  }
  const list = readAdjustments()
  list.unshift(adj)
  writeAdjustments(list)
  return adj
}

export async function getBalanceSummary(clientId: string): Promise<BalanceSummary> {
  const [grossRevenue, adjList] = await Promise.all([
    getDeliveredRevenue(clientId),
    getClientAdjustments(clientId),
  ])
  const sb = getSupabaseAdmin()

  const rows: { amount: number; status: string }[] = sb
    ? await sb.from("withdrawals").select("amount, status").eq("client_id", clientId)
        .then(r => r.data ?? []).catch(() => readWithdrawals().filter(w => w.clientId === clientId))
    : readWithdrawals().filter(w => w.clientId === clientId)

  const adjustments = Math.round(adjList.reduce((s, a) => s + a.amount, 0) * 100) / 100
  const approved    = Math.round(rows.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0) * 100) / 100
  const pending     = Math.round(rows.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0) * 100) / 100
  const available   = Math.round(Math.max(0, grossRevenue + adjustments - approved - pending) * 100) / 100
  return { grossRevenue, adjustments, approved, pending, available }
}

export async function getBalance(clientId: string): Promise<number> {
  return (await getBalanceSummary(clientId)).available
}

export async function createWithdrawal(
  payload: Omit<Withdrawal, "id" | "status" | "requestedAt" | "processedAt" | "adminNote">
): Promise<Withdrawal | null> {
  const summary = await getBalanceSummary(payload.clientId)
  if (payload.amount > summary.available) return null

  const sb = getSupabaseAdmin()
  if (!sb) return memCreate(payload)

  const base = {
    client_id:    payload.clientId,
    client_name:  payload.clientName,
    client_email: payload.clientEmail,
    amount:       payload.amount,
    currency:     payload.currency,
    iban:         payload.iban,
  }

  try {
    // Try with payment method columns (requires migration)
    const { data, error } = await sb.from("withdrawals").insert({
      ...base,
      payment_method_type: payload.paymentMethodType ?? null,
      payment_details:     payload.paymentDetails    ?? null,
    }).select().single()

    if (!error && data) return mapWithdrawal(data)

    // Fallback: insert without new columns (migration not yet run)
    const { data: data2, error: error2 } = await sb.from("withdrawals").insert(base).select().single()
    if (!error2 && data2) return mapWithdrawal(data2)

    return memCreate(payload)
  } catch { return memCreate(payload) }
}

export async function processWithdrawal(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<Withdrawal | null> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    const list = readWithdrawals()
    const idx = list.findIndex(w => w.id === id && w.status === "pending")
    if (idx === -1) return null
    list[idx] = { ...list[idx], status, adminNote, processedAt: frDate(new Date().toISOString()) }
    writeWithdrawals(list)
    return list[idx]
  }
  try {
    const { data: existing, error: fetchErr } = await sb.from("withdrawals").select("*").eq("id", id).single()
    if (fetchErr || !existing || existing.status !== "pending") return null
    const { data, error } = await sb
      .from("withdrawals")
      .update({ status, admin_note: adminNote ?? null, processed_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error || !data) return null
    return mapWithdrawal(data)
  } catch { return null }
}

/* ── Payment methods ────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPaymentMethod = (r: any): PaymentMethod => ({
  id:             r.id,
  clientId:       r.client_id,
  type:           r.type,
  label:          r.label ?? "",
  iban:           r.iban           ?? undefined,
  bic:            r.bic            ?? undefined,
  accountHolder:  r.account_holder ?? undefined,
  wiseEmail:      r.wise_email     ?? undefined,
  wiseCurrency:   r.wise_currency  ?? undefined,
  cryptoNetwork:  r.crypto_network ?? undefined,
  cryptoAddress:  r.crypto_address ?? undefined,
  isDefault:      r.is_default     ?? false,
  createdAt:      r.created_at     ?? new Date().toISOString(),
})

export async function getPaymentMethods(clientId: string): Promise<PaymentMethod[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return readPaymentMethods().filter(m => m.clientId === clientId)
  try {
    const { data, error } = await sb
      .from("payment_methods")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    if (error || !data) return readPaymentMethods().filter(m => m.clientId === clientId)
    return data.map(mapPaymentMethod)
  } catch { return readPaymentMethods().filter(m => m.clientId === clientId) }
}

export async function createPaymentMethod(
  payload: Omit<PaymentMethod, "id" | "createdAt">
): Promise<PaymentMethod | null> {
  const sb = getSupabaseAdmin()
  const now = new Date().toISOString()

  if (!sb) {
    const list = readPaymentMethods()
    // Unset default on others if this is default
    if (payload.isDefault) {
      list.forEach(m => { if (m.clientId === payload.clientId) m.isDefault = false })
    }
    const newMethod: PaymentMethod = { ...payload, id: `pm_${Date.now()}`, createdAt: now }
    list.push(newMethod)
    writePaymentMethods(list)
    return newMethod
  }
  try {
    if (payload.isDefault) {
      await sb.from("payment_methods").update({ is_default: false }).eq("client_id", payload.clientId)
    }
    const { data, error } = await sb.from("payment_methods").insert({
      client_id:      payload.clientId,
      type:           payload.type,
      label:          payload.label,
      iban:           payload.iban           ?? null,
      bic:            payload.bic            ?? null,
      account_holder: payload.accountHolder  ?? null,
      wise_email:     payload.wiseEmail      ?? null,
      wise_currency:  payload.wiseCurrency   ?? null,
      crypto_network: payload.cryptoNetwork  ?? null,
      crypto_address: payload.cryptoAddress  ?? null,
      is_default:     payload.isDefault,
      created_at:     now,
    }).select().single()
    if (error) {
      console.error("[createPaymentMethod] supabase error:", JSON.stringify(error))
      return null
    }
    if (!data) return null
    return mapPaymentMethod(data)
  } catch (e) {
    console.error("[createPaymentMethod] exception:", e)
    return null
  }
}

export async function deletePaymentMethod(id: string, clientId: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    const list = readPaymentMethods()
    const idx  = list.findIndex(m => m.id === id && m.clientId === clientId)
    if (idx === -1) return false
    list.splice(idx, 1)
    writePaymentMethods(list)
    return true
  }
  try {
    const { error } = await sb.from("payment_methods").delete().eq("id", id).eq("client_id", clientId)
    return !error
  } catch { return false }
}

export async function setDefaultPaymentMethod(id: string, clientId: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    const list = readPaymentMethods()
    list.forEach(m => { if (m.clientId === clientId) m.isDefault = m.id === id })
    writePaymentMethods(list)
    return true
  }
  try {
    await sb.from("payment_methods").update({ is_default: false }).eq("client_id", clientId)
    const { error } = await sb.from("payment_methods").update({ is_default: true }).eq("id", id).eq("client_id", clientId)
    return !error
  } catch { return false }
}

/* ── Admin stats ────────────────────────────────────────────────────────── */

export async function getAdminStats() {
  const [clients, orders, leads] = await Promise.all([getClients(), getAllOrders(), getAllLeads()])
  const mrr   = clients.filter(c => c.status === "active").reduce((s, c) => s + c.monthlyRevenue, 0)
  const active = clients.filter(c => c.status === "active").length
  return { totalClients: clients.length, activeClients: active, totalOrders: orders.length, totalLeads: leads.length, mrr }
}
