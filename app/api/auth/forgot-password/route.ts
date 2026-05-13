import { NextRequest, NextResponse } from "next/server"
import { findByEmailDb } from "@/lib/auth-store"
import { createResetToken } from "@/lib/reset-tokens-store"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: "Email requis" }, { status: 400 })

  const normalized = email.trim().toLowerCase()

  // Always return success to avoid leaking whether email exists
  const record = await findByEmailDb(normalized)
  if (!record) return NextResponse.json({ success: true })

  const token   = createResetToken(record.clientId, normalized)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://europs-shipping.vercel.app"
  const link    = `${baseUrl}/reset-password?token=${token}`

  const apiKey  = process.env.RESEND_API_KEY
  const from    = process.env.RESEND_FROM_EMAIL ?? "CODShip <onboarding@resend.dev>"

  if (apiKey && apiKey !== "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to:      [normalized],
        subject: "Réinitialisation de votre mot de passe CODShip",
        html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:520px;width:100%">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:28px 36px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:44px;height:44px;background:rgba(255,255,255,0.18);border-radius:12px;text-align:center;vertical-align:middle">
                <span style="color:#fff;font-size:18px;font-weight:900;line-height:44px">CS</span>
              </td>
              <td style="padding-left:14px">
                <p style="margin:0;color:#fff;font-size:20px;font-weight:800;line-height:1">CODShip</p>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:1px">PRO PLATFORM</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px">
            <p style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:700">Réinitialiser votre mot de passe</p>
            <p style="margin:0 0 24px;color:#888;font-size:14px;line-height:1.6">
              Vous avez demandé la réinitialisation de votre mot de passe CODShip.<br>
              Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
              <tr>
                <td style="background:linear-gradient(135deg,#f97316,#dc2626);border-radius:12px">
                  <a href="${link}" style="display:block;padding:14px 32px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;text-align:center">
                    Réinitialiser mon mot de passe →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#555;font-size:12px">Ce lien expire dans <strong style="color:#888">1 heure</strong>.</p>
            <p style="margin:0 0 24px;color:#555;font-size:12px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px">
              <p style="margin:0 0 6px;color:#555;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Lien de réinitialisation</p>
              <p style="margin:0;color:#f97316;font-size:12px;word-break:break-all;font-family:monospace">${link}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 36px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;color:#444;font-size:11px;text-align:center">
              © ${new Date().getFullYear()} CODShip Pro Platform · contact@codshipeurope.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    })
    const emailData = await emailRes.json().catch(() => ({}))
    console.log("[forgot-password] resend status:", emailRes.status, JSON.stringify(emailData))
    if (!emailRes.ok) {
      console.error("[forgot-password] resend error:", emailData)
    }
  } else {
    console.warn("[forgot-password] RESEND_API_KEY missing or placeholder — email not sent")
  }

  return NextResponse.json({ success: true })
}
