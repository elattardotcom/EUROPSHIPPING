export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "ERROR"
export type LeadStatus  = "CONFIRMED" | "PENDING" | "UNREACHED" | "CANCELED" | "ERROR"

export interface Order {
  id: string
  name: string
  phone: string
  countryCode: string
  country: string
  orderValue: number
  currency: string
  status: OrderStatus
  store: string
  product: string
  trackingNumber?: string
  createdAt: string
  createdTime: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  countryCode: string
  country: string
  orderValue: number
  currency: string
  status: LeadStatus
  store: string
  product: string
  createdAt: string
  createdTime: string
  attempts: number
  // Detail fields
  address?: string
  city?: string
  zip?: string
  quantity?: number
  isDuplicate?: boolean
}

export const ALL_ORDERS: Order[] = [
  { id: "1",  name: "José António Monteiro Sousa", phone: "+351 912 110 007", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT", product: "Fitness Band Pro",     trackingNumber: "PT123456789", createdAt: "9 Mai 2025",  createdTime: "17:02" },
  { id: "2",  name: "João Tavares",                phone: "+351 963 230 003", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT", product: "Fitness Band Pro",                            createdAt: "7 Mai 2025",  createdTime: "17:38" },
  { id: "3",  name: "Juliano Silva Lopes",         phone: "+351 918 440 004", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT", product: "Smart Watch Elite",                           createdAt: "7 Mai 2025",  createdTime: "17:33" },
  { id: "4",  name: "Edson Teodoro da Silva",      phone: "+351 965 780 006", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT", product: "Fitness Band Pro",                            createdAt: "6 Mai 2025",  createdTime: "14:07" },
  { id: "5",  name: "Delfim Faustino",             phone: "+351 912 003 007", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT", product: "Wireless Earbuds",                            createdAt: "6 Mai 2025",  createdTime: "14:03" },
  { id: "6",  name: "Adilson Lopes Cardoso",       phone: "+351 931 122 008", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "SHIPPED",   store: "Main Store PT", product: "Fitness Band Pro",     trackingNumber: "PT987654321", createdAt: "6 Mai 2025",  createdTime: "13:45" },
  { id: "7",  name: "João Ferreira",               phone: "+351 963 450 009", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "ERROR",     store: "Main Store PT", product: "Portable Charger",                            createdAt: "6 Mai 2025",  createdTime: "11:09" },
  { id: "8",  name: "Ana Cristina Rodrigues",      phone: "+34 612 345 011",  countryCode: "ES", country: "Espagne",  orderValue: 64.90, currency: "EUR", status: "DELIVERED", store: "Store Spain",   product: "LED Desk Lamp",        trackingNumber: "ES111222333", createdAt: "5 Mai 2025",  createdTime: "11:22" },
  { id: "9",  name: "Isabel Moreno",               phone: "+34 611 230 013",  countryCode: "ES", country: "Espagne",  orderValue: 79.90, currency: "EUR", status: "DELIVERED", store: "Store Spain",   product: "Smart Watch Elite",    trackingNumber: "ES444555666", createdAt: "5 Mai 2025",  createdTime: "09:40" },
  { id: "10", name: "Sophie Martin",               phone: "+33 612 345 014",  countryCode: "FR", country: "France",   orderValue: 74.90, currency: "EUR", status: "SHIPPED",   store: "Store France",  product: "Fitness Band Pro",     trackingNumber: "FR777888999", createdAt: "4 Mai 2025",  createdTime: "14:00" },
  { id: "11", name: "Fatima El Amrani",            phone: "+351 963 560 017", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "DELIVERED", store: "Main Store PT", product: "Smart Watch Elite",    trackingNumber: "PT000111222", createdAt: "4 Mai 2025",  createdTime: "13:45" },
  { id: "12", name: "Clara Vasconcelos",           phone: "+351 912 340 019", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "RETURNED",  store: "Main Store PT", product: "Fitness Band Pro",                            createdAt: "3 Mai 2025",  createdTime: "08:15" },
  { id: "13", name: "Miguel García López",         phone: "+34 698 760 012",  countryCode: "ES", country: "Espagne",  orderValue: 64.90, currency: "EUR", status: "RETURNED",  store: "Store Spain",   product: "Massage Gun Pro",                             createdAt: "2 Mai 2025",  createdTime: "10:05" },
  { id: "14", name: "Lucas Bernard",               phone: "+33 698 001 015",  countryCode: "FR", country: "France",   orderValue: 74.90, currency: "EUR", status: "DELIVERED", store: "Store France",  product: "Portable Charger",     trackingNumber: "FR333444555", createdAt: "1 Mai 2025",  createdTime: "11:30" },
]

export const ALL_LEADS: Lead[] = [
  { id: "1",  name: "Sonia de Jesus Freitas Moreira", phone: "+351 912 345 001", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "10 Mai 2025", createdTime: "12:55", attempts: 3, address: "Rua das Flores 25, 3º Esq",        city: "Lisboa",   zip: "1200-195", quantity: 1 },
  { id: "2",  name: "Pedro Leite-Pereira",            phone: "+351 963 210 002", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "10 Mai 2025", createdTime: "10:10", attempts: 2, address: "Av. da Liberdade 120, 2º Dto",     city: "Porto",    zip: "4000-322", quantity: 2 },
  { id: "3",  name: "Joaquim Santos",                 phone: "+351 917 630 003", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "10 Mai 2025", createdTime: "09:04", attempts: 1, address: "Rua de Santo António 8",           city: "Braga",    zip: "4700-010", quantity: 1 },
  { id: "4",  name: "Rui Veiga",                      phone: "+351 931 002 004", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT",  product: "Smart Watch Elite",    createdAt: "9 Mai 2025",  createdTime: "09:13", attempts: 4, address: "Praça do Comércio 5, 1º",         city: "Lisboa",   zip: "1100-148", quantity: 1 },
  { id: "5",  name: "Rosa Marques",                   phone: "+351 965 780 005", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "9 Mai 2025",  createdTime: "09:01", attempts: 1, address: "Rua do Quebedo 14",               city: "Setúbal",  zip: "2900-411", quantity: 1 },
  { id: "6",  name: "Amândio Ferreira",               phone: "+351 918 450 006", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT",  product: "Wireless Earbuds Max", createdAt: "9 Mai 2025",  createdTime: "06:55", attempts: 2, address: "Largo de Giraldo 3, 2º Esq",      city: "Évora",    zip: "7000-508", quantity: 1 },
  { id: "7",  name: "José António Monteiro Sousa",    phone: "+351 912 110 007", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "8 Mai 2025",  createdTime: "23:27", attempts: 1, address: "Rua Sofia 22",                    city: "Coimbra",  zip: "3000-392", quantity: 1 },
  { id: "8",  name: "Maria Fernanda Silva",           phone: "+351 963 891 008", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "PENDING",   store: "Main Store PT",  product: "Smart Watch Elite",    createdAt: "8 Mai 2025",  createdTime: "20:45", attempts: 0, address: "Avenida de Roma 55, 4º Dto",      city: "Lisboa",   zip: "1700-345", quantity: 1 },
  { id: "9",  name: "Carlos Almeida",                 phone: "+351 918 223 009", countryCode: "PT", country: "Portugal", orderValue: 49.90, currency: "EUR", status: "CANCELED",  store: "Main Store PT",  product: "Portable Charger",     createdAt: "8 Mai 2025",  createdTime: "17:30", attempts: 2, address: "Rua do Almada 88",                city: "Porto",    zip: "4050-037", quantity: 1 },
  { id: "10", name: "Carlos Almeida",                 phone: "+351 918 223 009", countryCode: "PT", country: "Portugal", orderValue: 49.90, currency: "EUR", status: "ERROR",     store: "Main Store PT",  product: "Portable Charger",     createdAt: "8 Mai 2025",  createdTime: "17:32", attempts: 0, address: "Rua do Almada 88",                city: "Porto",    zip: "4050-037", quantity: 1, isDuplicate: true },
  { id: "11", name: "Ana Cristina Rodrigues",         phone: "+34 612 345 011",  countryCode: "ES", country: "Espagne",  orderValue: 64.90, currency: "EUR", status: "CONFIRMED", store: "Store Spain",    product: "LED Desk Lamp",        createdAt: "7 Mai 2025",  createdTime: "11:22", attempts: 1, address: "Calle Mayor 14, 2º A",            city: "Madrid",   zip: "28013",    quantity: 1 },
  { id: "12", name: "Miguel García López",            phone: "+34 698 760 012",  countryCode: "ES", country: "Espagne",  orderValue: 64.90, currency: "EUR", status: "PENDING",   store: "Store Spain",    product: "Massage Gun Pro",      createdAt: "7 Mai 2025",  createdTime: "10:05", attempts: 0, address: "Passeig de Gràcia 78, 3º",        city: "Barcelona",zip: "08008",    quantity: 2 },
  { id: "13", name: "Isabel Moreno",                  phone: "+34 611 230 013",  countryCode: "ES", country: "Espagne",  orderValue: 79.90, currency: "EUR", status: "CONFIRMED", store: "Store Spain",    product: "Smart Watch Elite",    createdAt: "7 Mai 2025",  createdTime: "09:40", attempts: 1, address: "Calle Sierpes 45",                city: "Sevilla",  zip: "41004",    quantity: 1 },
  { id: "14", name: "Sophie Martin",                  phone: "+33 612 345 014",  countryCode: "FR", country: "France",   orderValue: 74.90, currency: "EUR", status: "CONFIRMED", store: "Store France",   product: "Fitness Band Pro",     createdAt: "6 Mai 2025",  createdTime: "14:00", attempts: 1, address: "12 Rue de Rivoli, Apt 4",         city: "Paris",    zip: "75001",    quantity: 1 },
  { id: "15", name: "Lucas Bernard",                  phone: "+33 698 001 015",  countryCode: "FR", country: "France",   orderValue: 74.90, currency: "EUR", status: "UNREACHED", store: "Store France",   product: "Portable Charger",     createdAt: "6 Mai 2025",  createdTime: "11:30", attempts: 3, address: "Av. des Champs-Élysées 100",      city: "Paris",    zip: "75008",    quantity: 1 },
  { id: "16", name: "Isabelle Dubois",                phone: "+33 611 780 016",  countryCode: "FR", country: "France",   orderValue: 49.90, currency: "EUR", status: "CANCELED",  store: "Store France",   product: "Wireless Earbuds Max", createdAt: "5 Mai 2025",  createdTime: "16:20", attempts: 2, address: "Place Bellecour 3",               city: "Lyon",     zip: "69002",    quantity: 1 },
  { id: "17", name: "Fatima El Amrani",               phone: "+351 963 560 017", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT",  product: "Smart Watch Elite",    createdAt: "5 Mai 2025",  createdTime: "13:45", attempts: 1, address: "Rua Direita 61",                  city: "Faro",     zip: "8000-285", quantity: 1 },
  { id: "18", name: "Nuno Oliveira",                  phone: "+351 918 990 018", countryCode: "PT", country: "Portugal", orderValue: 89.90, currency: "EUR", status: "PENDING",   store: "Main Store PT",  product: "Massage Gun Pro",      createdAt: "4 Mai 2025",  createdTime: "10:00", attempts: 0, address: "Rua do Arsenal 100",              city: "Lisboa",   zip: "1100-038", quantity: 1 },
  { id: "19", name: "Clara Vasconcelos",              phone: "+351 912 340 019", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "CONFIRMED", store: "Main Store PT",  product: "Fitness Band Pro",     createdAt: "4 Mai 2025",  createdTime: "08:15", attempts: 1, address: "Rua Garrett 4, 1º Esq",           city: "Lisboa",   zip: "1200-204", quantity: 1 },
  { id: "20", name: "Eduardo Carvalho",               phone: "+351 965 121 020", countryCode: "PT", country: "Portugal", orderValue: 69.50, currency: "EUR", status: "UNREACHED", store: "Main Store PT",  product: "LED Desk Lamp",        createdAt: "3 Mai 2025",  createdTime: "19:00", attempts: 5, address: "Rua de Cedofeita 220, 3º Dto",    city: "Porto",    zip: "4050-180", quantity: 1 },
]

/* ── Mock admin data (fallback when Supabase is not configured) ──────────── */

export const MOCK_CLIENT = {
  id: "c1",
  firstName: "Soufiane", lastName: "Attar",
  email: "soufianeattar7@gmail.com",
  phone: "+212 600 000 000",
  company: "CODShipEurope Enterprise",
  country: "Maroc", countryCode: "MA",
  plan: "enterprise" as const,
  status: "active" as const,
  joinedAt: "15 jan. 2025 à 00:00",
  monthlyRevenue: 89, totalRevenue: 289.20,
  storesCount: 3,
  ordersCount: ALL_ORDERS.length,
  leadsCount: ALL_LEADS.length,
  lastActive: "02 mai 2025 à 12:00",
  avatarColor: "from-teal-500 to-emerald-600",
}

export const MOCK_STORES = [
  { id: "s1", clientId: "c1", name: "Main Store PT", domain: "codship-pt.myshopify.com", status: "connected" as const, country: "Portugal", ordersToday: 3, totalOrders: 9,  currency: "EUR", lastSync: "02 mai 2025 à 14:30" },
  { id: "s2", clientId: "c1", name: "Store Spain",   domain: "codship-es.myshopify.com", status: "connected" as const, country: "Espagne",  ordersToday: 1, totalOrders: 3,  currency: "EUR", lastSync: "02 mai 2025 à 13:50" },
  { id: "s3", clientId: "c1", name: "Store France",  domain: "codship-fr.myshopify.com", status: "connected" as const, country: "France",   ordersToday: 0, totalOrders: 2,  currency: "EUR", lastSync: "02 mai 2025 à 12:10" },
]

export const MOCK_ADMIN_ORDERS = ALL_ORDERS.map(o => ({
  id: o.id, clientId: "c1", clientName: "Soufiane Attar",
  customerName: o.name, customerPhone: o.phone,
  country: o.country, countryCode: o.countryCode,
  product: o.product, value: o.orderValue, currency: o.currency,
  status: o.status, store: o.store, trackingNumber: o.trackingNumber,
  createdAt: `${o.createdAt} ${o.createdTime}`,
}))

export const MOCK_ADMIN_LEADS = ALL_LEADS.map(l => ({
  id: l.id, clientId: "c1", clientName: "Soufiane Attar",
  customerName: l.name, customerPhone: l.phone,
  country: l.country, countryCode: l.countryCode,
  product: l.product, value: l.orderValue, currency: l.currency,
  status: l.status, store: l.store,
  createdAt: `${l.createdAt} ${l.createdTime}`,
}))

export function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return
  const BOM = "﻿"
  const headers = Object.keys(rows[0]).join(";")
  const body    = rows.map(r => Object.values(r).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n")
  const blob    = new Blob([BOM + headers + "\n" + body], { type: "text/csv;charset=utf-8;" })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
