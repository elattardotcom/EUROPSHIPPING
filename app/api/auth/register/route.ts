import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin }         from "@/lib/supabase"
import { hashPassword, findByEmailDb } from "@/lib/auth-store"

/*
  SQL to run once in Supabase:

  CREATE TABLE IF NOT EXISTS registration_requests (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name   TEXT NOT NULL,
    last_name    TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT,
    company      TEXT,
    country      TEXT,
    country_code TEXT,
    password_hash TEXT NOT NULL,
    status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    admin_note   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  );
*/

const COUNTRY_NAMES: Record<string, string> = {
  PT: "Portugal", ES: "Espagne",  FR: "France",        MA: "Maroc",
  DZ: "Algérie",  TN: "Tunisie", IT: "Italie",         DE: "Allemagne",
  BE: "Belgique", GB: "Royaume-Uni", SN: "Sénégal",   CI: "Côte d'Ivoire",
  NL: "Pays-Bas", CH: "Suisse",  LU: "Luxembourg",
  RO: "Roumanie", BG: "Bulgarie", HU: "Hongrie",       GR: "Grèce",
  SK: "Slovaquie", SI: "Slovénie", CZ: "République Tchèque",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, company, countryCode, password, address } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const phoneDigits = (phone ?? "").replace(/\D/g, "")
    if (phoneDigits.length !== 9 || phoneDigits.startsWith("0")) {
      return NextResponse.json({ error: "Numéro de téléphone invalide (9 chiffres sans le 0 initial)" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const sb = getSupabaseAdmin()

    if (!sb) {
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 })
    }

    // Check for duplicate email in existing clients
    const existing = await findByEmailDb(normalizedEmail)
    if (existing) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    // Check for duplicate pending request
    const { data: dup } = await sb
      .from("registration_requests")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle()

    if (dup) {
      return NextResponse.json({ error: "Une demande est déjà en cours pour cet email" }, { status: 409 })
    }

    // Store the registration request — admin will approve later
    const { error } = await sb.from("registration_requests").insert({
      first_name:    firstName.trim(),
      last_name:     lastName.trim(),
      email:         normalizedEmail,
      phone:         phoneDigits,
      company:       company?.trim() ?? "",
      address:       address.trim(),
      country:       COUNTRY_NAMES[countryCode] ?? countryCode ?? "",
      country_code:  countryCode ?? "",
      password_hash: hashPassword(password),
      status:        "pending",
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, pending: true })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
