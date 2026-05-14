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
    const { firstName, lastName, email, phone, fullPhone, company, countryCode, password } = body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const phoneDigits = (phone ?? "").replace(/\D/g, "")
    if (phoneDigits.length !== 9 || phoneDigits.startsWith("0")) {
      return NextResponse.json({ error: "Numéro de téléphone invalide (9 chiffres sans le 0 initial)" }, { status: 400 })
    }

    const storedPhone = fullPhone?.trim() ?? phoneDigits
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
      phone:         storedPhone,
      company:       company?.trim() ?? "",
      country:       COUNTRY_NAMES[countryCode] ?? countryCode ?? "",
      country_code:  countryCode ?? "",
      password_hash: hashPassword(password),
      status:        "pending",
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Send verification email
    const apiKey = process.env.RESEND_API_KEY
    const from   = process.env.RESEND_FROM_EMAIL ?? "CODShipEurope <contact@codshipeurope.com>"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"

    if (apiKey && apiKey !== "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [normalizedEmail],
          subject: "Welcome to CODShipEurope — Your request has been received",
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:28px 36px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle">
                <img src="${baseUrl}/icon.svg" width="48" height="48" alt="CODShipEurope" style="display:block;border-radius:10px" />
              </td>
              <td style="padding-left:14px;vertical-align:middle">
                <p style="margin:0;color:#fff;font-size:20px;font-weight:800;line-height:1">CODShipEurope</p>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:1px;text-transform:uppercase">Pro Platform</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px 0;text-align:center">
            <div style="display:inline-block;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:50px;padding:10px 24px">
              <span style="color:#f97316;font-size:14px;font-weight:700">✓ Request Received</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px">
            <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700">Hello ${firstName.trim()},</p>
            <p style="margin:0 0 24px;color:#888;font-size:14px;line-height:1.7">
              Thank you for registering on <strong style="color:#fff">CODShipEurope</strong>.<br/>
              Your account request has been received and is currently under review by our team.
            </p>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 24px;margin-bottom:24px">
              <p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:600">What happens next?</p>
              <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
                <span style="color:#f97316;font-weight:700;min-width:20px">1.</span>
                <span style="color:#888;font-size:13px">Our team reviews your request within <strong style="color:#bbb">24–48 hours</strong></span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
                <span style="color:#f97316;font-weight:700;min-width:20px">2.</span>
                <span style="color:#888;font-size:13px">You receive an email confirmation when your account is activated</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="color:#f97316;font-weight:700;min-width:20px">3.</span>
                <span style="color:#888;font-size:13px">Log in and connect your Shopify store to start</span>
              </div>
            </div>
            <p style="margin:0;color:#555;font-size:12px;line-height:1.7">
              Questions? Contact us at <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;color:#444;font-size:11px;text-align:center;line-height:1.8">
              © ${new Date().getFullYear()} CODShipEurope Pro Platform<br>
              <a href="${baseUrl}" style="color:#f97316;text-decoration:none">www.codshipeurope.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        }),
      }).catch(err => console.error("[register-email] send error:", err))
    }

    return NextResponse.json({ success: true, pending: true })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
