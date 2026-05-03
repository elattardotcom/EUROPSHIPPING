import { NextRequest, NextResponse } from "next/server"
import { getSupabase }              from "@/lib/supabase"
import { readClients, writeClients } from "@/lib/clients-store"
import { createAuthRecordDb, findByEmailDb, hashPassword } from "@/lib/auth-store"
import type { Client } from "@/lib/db"

const COUNTRY_NAMES: Record<string, string> = {
  PT: "Portugal", ES: "Espagne",  FR: "France",        MA: "Maroc",
  DZ: "Algérie",  TN: "Tunisie", IT: "Italie",        DE: "Allemagne",
  BE: "Belgique", GB: "Royaume-Uni", SN: "Sénégal",   CI: "Côte d'Ivoire",
  NL: "Pays-Bas", CH: "Suisse",  LU: "Luxembourg",
}

const AVATAR_COLORS = [
  "from-orange-500 to-red-600",
  "from-teal-500 to-emerald-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-purple-600",
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, company, countryCode, password } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const sb = getSupabase()

    if (sb) {
      // Check duplicate via auth_credentials (faster than full clients scan)
      const existing = await findByEmailDb(normalizedEmail)
      if (existing) return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })

      const { data, error } = await sb.from("clients").insert({
        first_name:      firstName.trim(),
        last_name:       lastName.trim(),
        email:           normalizedEmail,
        phone:           phone?.trim()    ?? "",
        company:         company?.trim()  ?? "",
        country:         COUNTRY_NAMES[countryCode] ?? countryCode ?? "",
        country_code:    countryCode ?? "",
        plan:            "starter",
        status:          "trial",
        joined_at:       new Date().toISOString(),
        monthly_revenue: 0,
        total_revenue:   0,
        stores_count:    0,
        orders_count:    0,
        leads_count:     0,
        last_active:     new Date().toISOString(),
        avatar_color:    avatarColor,
        password_hash:   hashPassword(password),
      }).select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      await createAuthRecordDb(data.id, normalizedEmail, password)
      const res = NextResponse.json({ success: true, clientId: data.id })
      res.cookies.set("client_id", data.id, { path: "/", maxAge: 60 * 60 * 24 * 30 })
      return res
    }

    // File-based fallback
    const existingFile = await findByEmailDb(normalizedEmail)
    if (existingFile) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    const clients = readClients()
    if (clients.some(c => c.email === normalizedEmail)) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    const client: Client = {
      id:             `c_${Date.now()}`,
      firstName:      firstName.trim(),
      lastName:       lastName.trim(),
      email:          normalizedEmail,
      phone:          phone?.trim()   ?? "",
      company:        company?.trim() ?? "",
      country:        COUNTRY_NAMES[countryCode] ?? countryCode ?? "",
      countryCode:    countryCode ?? "",
      plan:           "starter",
      status:         "trial",
      joinedAt:       new Date().toISOString(),
      monthlyRevenue: 0,
      totalRevenue:   0,
      storesCount:    0,
      ordersCount:    0,
      leadsCount:     0,
      lastActive:     new Date().toISOString(),
      avatarColor:    avatarColor,
    }

    clients.unshift(client)
    writeClients(clients)
    await createAuthRecordDb(client.id, normalizedEmail, password)

    const res = NextResponse.json({ success: true, clientId: client.id })
    res.cookies.set("client_id", client.id, { path: "/", maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
