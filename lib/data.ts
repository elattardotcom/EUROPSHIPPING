/* ─── Types ─────────────────────────────────────────────────────────── */

export type Plan     = "starter" | "pro" | "enterprise"
export type UserStatus = "active" | "suspended" | "trial" | "cancelled"
export type LeadStatus  = "CONFIRMED" | "PENDING" | "UNREACHED" | "CANCELED" | "ERROR"
export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "ERROR"
export type StoreStatus = "connected" | "syncing" | "error"

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  countryCode: string
  company: string
  plan: Plan
  status: UserStatus
  joinedAt: string
  trialEndsAt?: string
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

/* ─── Clients ────────────────────────────────────────────────────────── */

export const CLIENTS: Client[] = [
  {
    id: "c1", firstName: "Soufiane", lastName: "Attar",    email: "soufiane@codshipeurope.com", phone: "+351 912 000 001",
    country: "Portugal",   countryCode: "PT", company: "CODShip Enterprise",
    plan: "enterprise", status: "active",    joinedAt: "1 Jan 2025",
    monthlyRevenue: 89,  totalRevenue: 356,  storesCount: 3, ordersCount: 156, leadsCount: 347, lastActive: "À l'instant",
    avatarColor: "from-orange-500 to-red-600",
  },
  {
    id: "c2", firstName: "Karim",    lastName: "Benali",   email: "karim@dropkb.com",     phone: "+351 963 000 002",
    country: "Portugal",   countryCode: "PT", company: "DropKB",
    plan: "pro",        status: "active",    joinedAt: "10 Fév 2025",
    monthlyRevenue: 59,  totalRevenue: 177,  storesCount: 2, ordersCount: 98,  leadsCount: 210, lastActive: "Il y a 2h",
    avatarColor: "from-teal-500 to-emerald-600",
  },
  {
    id: "c3", firstName: "Sara",     lastName: "Mansouri", email: "sara@modafr.com",       phone: "+33 612 000 003",
    country: "France",     countryCode: "FR", company: "ModaFR",
    plan: "pro",        status: "active",    joinedAt: "5 Fév 2025",
    monthlyRevenue: 59,  totalRevenue: 177,  storesCount: 1, ordersCount: 76,  leadsCount: 155, lastActive: "Il y a 5h",
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    id: "c4", firstName: "Ahmed",    lastName: "Rifai",    email: "ahmed@codespa.com",     phone: "+34 611 000 004",
    country: "Espagne",    countryCode: "ES", company: "CodEspa",
    plan: "pro",        status: "active",    joinedAt: "15 Fév 2025",
    monthlyRevenue: 59,  totalRevenue: 118,  storesCount: 2, ordersCount: 112, leadsCount: 230, lastActive: "Hier",
    avatarColor: "from-blue-500 to-cyan-600",
  },
  {
    id: "c5", firstName: "Yasmine",  lastName: "Ouali",    email: "yasmine@dropbe.com",    phone: "+32 470 000 005",
    country: "Belgique",   countryCode: "BE", company: "DropBE",
    plan: "starter",    status: "trial",     joinedAt: "20 Avr 2025", trialEndsAt: "4 Mai 2025",
    monthlyRevenue: 0,   totalRevenue: 0,    storesCount: 1, ordersCount: 23,  leadsCount: 45,  lastActive: "Il y a 3h",
    avatarColor: "from-purple-500 to-violet-600",
  },
  {
    id: "c6", firstName: "Mehdi",    lastName: "Tazi",     email: "mehdi@codma.com",       phone: "+212 661 000 006",
    country: "Maroc",      countryCode: "MA", company: "COD Maroc",
    plan: "starter",    status: "active",    joinedAt: "1 Mar 2025",
    monthlyRevenue: 29,  totalRevenue: 58,   storesCount: 1, ordersCount: 67,  leadsCount: 134, lastActive: "Il y a 1j",
    avatarColor: "from-amber-500 to-yellow-600",
  },
  {
    id: "c7", firstName: "Ilham",    lastName: "Berrada",  email: "ilham@speedit.com",     phone: "+351 918 000 007",
    country: "Portugal",   countryCode: "PT", company: "SpeedIT",
    plan: "enterprise", status: "active",    joinedAt: "1 Fév 2025",
    monthlyRevenue: 89,  totalRevenue: 267,  storesCount: 4, ordersCount: 203, leadsCount: 410, lastActive: "Il y a 4h",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "c8", firstName: "Nour",     lastName: "Amine",    email: "nour@droptn.com",       phone: "+216 22 000 008",
    country: "Tunisie",    countryCode: "TN", company: "DropTN",
    plan: "starter",    status: "suspended", joinedAt: "10 Mar 2025",
    monthlyRevenue: 29,  totalRevenue: 29,   storesCount: 1, ordersCount: 12,  leadsCount: 28,  lastActive: "Il y a 5j",
    avatarColor: "from-red-500 to-rose-600",
  },
  {
    id: "c9", firstName: "Camille",  lastName: "Leroy",    email: "camille@shopfr.com",    phone: "+33 698 000 009",
    country: "France",     countryCode: "FR", company: "ShopFR",
    plan: "pro",        status: "cancelled", joinedAt: "5 Jan 2025",
    monthlyRevenue: 0,   totalRevenue: 177,  storesCount: 0, ordersCount: 44,  leadsCount: 88,  lastActive: "Il y a 10j",
    avatarColor: "from-slate-500 to-gray-600",
  },
  {
    id: "c10",firstName: "Omar",     lastName: "Alaoui",   email: "omar@codify.com",       phone: "+34 699 000 010",
    country: "Espagne",    countryCode: "ES", company: "Codify",
    plan: "starter",    status: "trial",     joinedAt: "28 Avr 2025", trialEndsAt: "12 Mai 2025",
    monthlyRevenue: 0,   totalRevenue: 0,    storesCount: 1, ordersCount: 8,   leadsCount: 19,  lastActive: "Il y a 6h",
    avatarColor: "from-orange-400 to-amber-600",
  },
]

/* ─── Orders ─────────────────────────────────────────────────────────── */

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "o1",  clientId: "c1", clientName: "Soufiane A.", customerName: "José António Sousa",       customerPhone: "+351 912 110 007", country: "Portugal", countryCode: "PT", product: "Fitness Band Pro",    value: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT",  trackingNumber: undefined,     createdAt: "9 Mai 2025" },
  { id: "o2",  clientId: "c1", clientName: "Soufiane A.", customerName: "Adilson Lopes Cardoso",    customerPhone: "+351 931 122 008", country: "Portugal", countryCode: "PT", product: "Fitness Band Pro",    value: 69.50, currency: "EUR", status: "SHIPPED",   store: "Main Store PT",  trackingNumber: "PT987654321", createdAt: "6 Mai 2025" },
  { id: "o3",  clientId: "c2", clientName: "Karim B.",    customerName: "Ana Cristina Rodrigues",   customerPhone: "+34 612 345 011",  country: "Espagne",  countryCode: "ES", product: "LED Desk Lamp",       value: 64.90, currency: "EUR", status: "DELIVERED", store: "Store Spain",    trackingNumber: "ES111222333", createdAt: "5 Mai 2025" },
  { id: "o4",  clientId: "c3", clientName: "Sara M.",     customerName: "Sophie Martin",            customerPhone: "+33 612 345 014",  country: "France",   countryCode: "FR", product: "Fitness Band Pro",    value: 74.90, currency: "EUR", status: "SHIPPED",   store: "Store France",   trackingNumber: "FR777888999", createdAt: "4 Mai 2025" },
  { id: "o5",  clientId: "c4", clientName: "Ahmed R.",    customerName: "Isabel Moreno",            customerPhone: "+34 611 230 013",  country: "Espagne",  countryCode: "ES", product: "Smart Watch Elite",   value: 79.90, currency: "EUR", status: "DELIVERED", store: "Store Spain",    trackingNumber: "ES444555666", createdAt: "5 Mai 2025" },
  { id: "o6",  clientId: "c7", clientName: "Ilham B.",    customerName: "Fatima El Amrani",         customerPhone: "+351 963 560 017", country: "Portugal", countryCode: "PT", product: "Smart Watch Elite",   value: 69.50, currency: "EUR", status: "DELIVERED", store: "SpeedIT PT1",    trackingNumber: "PT000111222", createdAt: "4 Mai 2025" },
  { id: "o7",  clientId: "c1", clientName: "Soufiane A.", customerName: "Clara Vasconcelos",        customerPhone: "+351 912 340 019", country: "Portugal", countryCode: "PT", product: "Fitness Band Pro",    value: 69.50, currency: "EUR", status: "RETURNED",  store: "Main Store PT",  trackingNumber: undefined,     createdAt: "3 Mai 2025" },
  { id: "o8",  clientId: "c6", clientName: "Mehdi T.",    customerName: "Rachid Benbrahim",         customerPhone: "+212 661 100 018", country: "Maroc",    countryCode: "MA", product: "Portable Charger",    value: 39.90, currency: "EUR", status: "PENDING",   store: "COD Maroc",      trackingNumber: undefined,     createdAt: "8 Mai 2025" },
  { id: "o9",  clientId: "c2", clientName: "Karim B.",    customerName: "Miguel García López",      customerPhone: "+34 698 760 012",  country: "Espagne",  countryCode: "ES", product: "Massage Gun Pro",     value: 64.90, currency: "EUR", status: "RETURNED",  store: "DropKB ES",      trackingNumber: undefined,     createdAt: "2 Mai 2025" },
  { id: "o10", clientId: "c7", clientName: "Ilham B.",    customerName: "Lucas Bernard",            customerPhone: "+33 698 001 015",  country: "France",   countryCode: "FR", product: "Portable Charger",    value: 74.90, currency: "EUR", status: "DELIVERED", store: "SpeedIT FR",     trackingNumber: "FR333444555", createdAt: "1 Mai 2025" },
  { id: "o11", clientId: "c3", clientName: "Sara M.",     customerName: "Isabelle Dubois",          customerPhone: "+33 611 780 016",  country: "France",   countryCode: "FR", product: "Wireless Earbuds",    value: 49.90, currency: "EUR", status: "PENDING",   store: "ModaFR",         trackingNumber: undefined,     createdAt: "5 Mai 2025" },
  { id: "o12", clientId: "c5", clientName: "Yasmine O.",  customerName: "Lena Schmidt",             customerPhone: "+32 470 100 020",  country: "Belgique", countryCode: "BE", product: "Fitness Band Pro",    value: 69.50, currency: "EUR", status: "PENDING",   store: "DropBE",         trackingNumber: undefined,     createdAt: "9 Mai 2025" },
  { id: "o13", clientId: "c4", clientName: "Ahmed R.",    customerName: "Carlos Ruiz Torres",       customerPhone: "+34 612 900 021",  country: "Espagne",  countryCode: "ES", product: "LED Desk Lamp",       value: 54.90, currency: "EUR", status: "SHIPPED",   store: "CodEspa",        trackingNumber: "ES999888777", createdAt: "8 Mai 2025" },
  { id: "o14", clientId: "c7", clientName: "Ilham B.",    customerName: "Nuno Carvalho",            customerPhone: "+351 918 990 022", country: "Portugal", countryCode: "PT", product: "Smart Watch Elite",   value: 89.90, currency: "EUR", status: "SHIPPED",   store: "SpeedIT PT2",    trackingNumber: "PT666777888", createdAt: "7 Mai 2025" },
  { id: "o15", clientId: "c1", clientName: "Soufiane A.", customerName: "Eduardo Carvalho",         customerPhone: "+351 965 121 023", country: "Portugal", countryCode: "PT", product: "LED Desk Lamp",       value: 54.90, currency: "EUR", status: "PENDING",   store: "Store France",   trackingNumber: undefined,     createdAt: "3 Mai 2025" },
]

/* ─── Leads ──────────────────────────────────────────────────────────── */

export const ADMIN_LEADS: AdminLead[] = [
  { id: "l1",  clientId: "c1", clientName: "Soufiane A.", customerName: "Sonia de Jesus Freitas",  customerPhone: "+351 912 345 001", country: "Portugal", countryCode: "PT", product: "Fitness Band Pro",  value: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT", createdAt: "10 Mai 2025" },
  { id: "l2",  clientId: "c1", clientName: "Soufiane A.", customerName: "Joaquim Santos",          customerPhone: "+351 917 630 003", country: "Portugal", countryCode: "PT", product: "Fitness Band Pro",  value: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT", createdAt: "10 Mai 2025" },
  { id: "l3",  clientId: "c2", clientName: "Karim B.",    customerName: "Ana García",              customerPhone: "+34 612 111 030",  country: "Espagne",  countryCode: "ES", product: "LED Desk Lamp",     value: 54.90, currency: "EUR", status: "CONFIRMED", store: "DropKB ES",     createdAt: "9 Mai 2025"  },
  { id: "l4",  clientId: "c3", clientName: "Sara M.",     customerName: "Marie Dupont",            customerPhone: "+33 612 222 031",  country: "France",   countryCode: "FR", product: "Fitness Band Pro",  value: 74.90, currency: "EUR", status: "PENDING",   store: "ModaFR",        createdAt: "9 Mai 2025"  },
  { id: "l5",  clientId: "c4", clientName: "Ahmed R.",    customerName: "Pedro Jiménez",           customerPhone: "+34 698 333 032",  country: "Espagne",  countryCode: "ES", product: "Smart Watch",       value: 79.90, currency: "EUR", status: "CONFIRMED", store: "CodEspa",       createdAt: "8 Mai 2025"  },
  { id: "l6",  clientId: "c7", clientName: "Ilham B.",    customerName: "Marta Oliveira",          customerPhone: "+351 963 444 033", country: "Portugal", countryCode: "PT", product: "Massage Gun Pro",   value: 89.90, currency: "EUR", status: "CONFIRMED", store: "SpeedIT PT1",   createdAt: "8 Mai 2025"  },
  { id: "l7",  clientId: "c6", clientName: "Mehdi T.",    customerName: "Hamid Berrada",           customerPhone: "+212 661 555 034", country: "Maroc",    countryCode: "MA", product: "Portable Charger",  value: 39.90, currency: "EUR", status: "UNREACHED", store: "COD Maroc",     createdAt: "7 Mai 2025"  },
  { id: "l8",  clientId: "c5", clientName: "Yasmine O.",  customerName: "Julien Renard",           customerPhone: "+32 470 666 035",  country: "Belgique", countryCode: "BE", product: "Fitness Band Pro",  value: 69.50, currency: "EUR", status: "PENDING",   store: "DropBE",        createdAt: "7 Mai 2025"  },
  { id: "l9",  clientId: "c1", clientName: "Soufiane A.", customerName: "Carlos Almeida",          customerPhone: "+351 918 223 009", country: "Portugal", countryCode: "PT", product: "Portable Charger",  value: 69.50, currency: "EUR", status: "CANCELED",  store: "Main Store PT", createdAt: "8 Mai 2025"  },
  { id: "l10", clientId: "c7", clientName: "Ilham B.",    customerName: "Céline Moreau",           customerPhone: "+33 698 777 036",  country: "France",   countryCode: "FR", product: "Smart Watch Elite", value: 69.50, currency: "EUR", status: "CONFIRMED", store: "SpeedIT FR",    createdAt: "6 Mai 2025"  },
]

/* ─── Stores ─────────────────────────────────────────────────────────── */

export const ADMIN_STORES: AdminStore[] = [
  { id: "s1", clientId: "c1", name: "Main Store Portugal", domain: "main-store-pt.myshopify.com", status: "connected", country: "PT", ordersToday: 12, totalOrders: 1247, currency: "EUR", lastSync: "Il y a 2 min" },
  { id: "s2", clientId: "c1", name: "Store Spain",         domain: "store-spain.myshopify.com",   status: "connected", country: "ES", ordersToday: 8,  totalOrders: 892,  currency: "EUR", lastSync: "Il y a 5 min" },
  { id: "s3", clientId: "c1", name: "Store France",        domain: "store-france.myshopify.com",  status: "syncing",   country: "FR", ordersToday: 5,  totalOrders: 634,  currency: "EUR", lastSync: "Sync..."      },
  { id: "s4", clientId: "c2", name: "DropKB Portugal",     domain: "dropkb-pt.myshopify.com",     status: "connected", country: "PT", ordersToday: 6,  totalOrders: 445,  currency: "EUR", lastSync: "Il y a 8 min" },
  { id: "s5", clientId: "c2", name: "DropKB Spain",        domain: "dropkb-es.myshopify.com",     status: "connected", country: "ES", ordersToday: 4,  totalOrders: 312,  currency: "EUR", lastSync: "Il y a 10 min"},
  { id: "s6", clientId: "c3", name: "ModaFR",              domain: "modafr.myshopify.com",        status: "connected", country: "FR", ordersToday: 9,  totalOrders: 567,  currency: "EUR", lastSync: "Il y a 3 min" },
  { id: "s7", clientId: "c4", name: "CodEspa Principal",   domain: "codespa.myshopify.com",       status: "connected", country: "ES", ordersToday: 11, totalOrders: 734,  currency: "EUR", lastSync: "Il y a 1 min" },
  { id: "s8", clientId: "c4", name: "CodEspa France",      domain: "codespa-fr.myshopify.com",    status: "error",     country: "FR", ordersToday: 0,  totalOrders: 198,  currency: "EUR", lastSync: "Erreur"       },
  { id: "s9", clientId: "c7", name: "SpeedIT PT1",         domain: "speedit-pt1.myshopify.com",   status: "connected", country: "PT", ordersToday: 15, totalOrders: 1102, currency: "EUR", lastSync: "Il y a 1 min" },
  { id:"s10", clientId: "c7", name: "SpeedIT FR",          domain: "speedit-fr.myshopify.com",    status: "connected", country: "FR", ordersToday: 7,  totalOrders: 689,  currency: "EUR", lastSync: "Il y a 6 min" },
]

/* ─── Computed stats ─────────────────────────────────────────────────── */

export function getAdminStats() {
  const active      = CLIENTS.filter(c => c.status === "active").length
  const trial       = CLIENTS.filter(c => c.status === "trial").length
  const suspended   = CLIENTS.filter(c => c.status === "suspended").length
  const mrr         = CLIENTS.filter(c => c.status === "active").reduce((s, c) => s + c.monthlyRevenue, 0)
  const arr         = mrr * 12
  const totalOrders = ADMIN_ORDERS.length
  const delivered   = ADMIN_ORDERS.filter(o => o.status === "DELIVERED").length
  const totalLeads  = ADMIN_LEADS.length
  const confirmed   = ADMIN_LEADS.filter(l => l.status === "CONFIRMED").length

  return {
    totalClients: CLIENTS.length,
    activeClients: active,
    trialClients: trial,
    suspendedClients: suspended,
    mrr,
    arr,
    totalOrders,
    deliveredOrders: delivered,
    deliveryRate: Math.round((delivered / totalOrders) * 100),
    totalLeads,
    confirmedLeads: confirmed,
    confirmRate: Math.round((confirmed / totalLeads) * 100),
    totalStores: ADMIN_STORES.length,
    activeStores: ADMIN_STORES.filter(s => s.status === "connected").length,
  }
}

export function getClientById(id: string) {
  return CLIENTS.find(c => c.id === id) ?? null
}

export function getClientOrders(clientId: string) {
  return ADMIN_ORDERS.filter(o => o.clientId === clientId)
}

export function getClientLeads(clientId: string) {
  return ADMIN_LEADS.filter(l => l.clientId === clientId)
}

export function getClientStores(clientId: string) {
  return ADMIN_STORES.filter(s => s.clientId === clientId)
}
