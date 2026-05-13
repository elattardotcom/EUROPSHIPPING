import { NextResponse } from "next/server"
import { getWithdrawals, createWithdrawal } from "@/lib/db"

async function sendRequestConfirmationEmail(w: {
  id: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  iban?: string
  paymentMethodType?: string
  paymentDetails?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") return

  const from      = process.env.RESEND_FROM_EMAIL ?? "CODShipEurope <contact@codshipeurope.com>"
  const ref       = `REQ-${w.id.slice(-8).toUpperCase()}`
  const amount    = new Intl.NumberFormat("en-EU", { style: "currency", currency: w.currency ?? "EUR" }).format(w.amount)
  const date      = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
  const firstName = w.clientName.split(" ")[0] ?? w.clientName

  let parsed: Record<string, string> = {}
  try { if (w.paymentDetails) parsed = JSON.parse(w.paymentDetails) } catch { parsed = {} }

  const type = w.paymentMethodType ?? "bank"
  let methodLabel = "Bank Transfer (IBAN)"
  let methodDetail = w.iban ? `${w.iban.slice(0, 6)} •••• •••• ${w.iban.slice(-4)}` : "—"

  if (type === "crypto") {
    methodLabel  = `Crypto — ${parsed.cryptoNetwork ?? "—"}`
    const addr   = parsed.cryptoAddress ?? "—"
    methodDetail = addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
  } else if (type === "wise") {
    methodLabel  = "Wise Transfer"
    methodDetail = parsed.wiseEmail ?? "—"
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:28px 36px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle">
                <img src="https://www.codshipeurope.com/icon.svg" width="48" height="48" alt="CODShipEurope" style="display:block;border-radius:10px" />
              </td>
              <td style="padding-left:14px;vertical-align:middle">
                <p style="margin:0;color:#fff;font-size:20px;font-weight:800;line-height:1">CODShipEurope</p>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:1px;text-transform:uppercase">Pro Platform</p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Badge -->
        <tr>
          <td style="padding:32px 36px 0;text-align:center">
            <div style="display:inline-block;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:50px;padding:10px 24px">
              <span style="color:#f97316;font-size:14px;font-weight:700">⏳ Withdrawal Request Received</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 36px">
            <p style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700">Hello ${firstName},</p>
            <p style="margin:0 0 28px;color:#888;font-size:14px;line-height:1.7">
              We have received your withdrawal request. Our team will review and process it within <strong style="color:#bbb">24–48 hours</strong>.
              You will receive a confirmation email once the payment has been sent.
            </p>

            <!-- Amount -->
            <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:14px;padding:24px;text-align:center;margin-bottom:28px">
              <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Requested Amount</p>
              <p style="margin:0;color:#f97316;font-size:38px;font-weight:900;letter-spacing:-1px">${amount}</p>
            </div>

            <!-- Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:28px">
              <tr style="background:rgba(255,255,255,0.03)">
                <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Reference</td>
                <td style="padding:14px 18px;color:#fff;font-size:13px;font-weight:600;font-family:monospace;border-bottom:1px solid rgba(255,255,255,0.05)">${ref}</td>
              </tr>
              <tr>
                <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Request Date</td>
                <td style="padding:14px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${date}</td>
              </tr>
              <tr style="background:rgba(255,255,255,0.03)">
                <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Payment Method</td>
                <td style="padding:14px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${methodLabel}</td>
              </tr>
              <tr>
                <td style="padding:14px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Details</td>
                <td style="padding:14px 18px;color:#fff;font-size:13px;font-family:monospace">${methodDetail}</td>
              </tr>
            </table>

            <!-- Status indicator -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px 18px;margin-bottom:24px">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:10px;height:10px;border-radius:50%;background:#f97316;display:inline-block;margin-right:8px"></div>
                <span style="color:#888;font-size:13px">Status: <strong style="color:#f97316">Pending review</strong></span>
              </div>
            </div>

            <p style="margin:0;color:#555;font-size:12px;line-height:1.7">
              Questions? Contact us at
              <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;color:#444;font-size:11px;text-align:center;line-height:1.8">
              © ${new Date().getFullYear()} CODShipEurope Pro Platform<br>
              <a href="https://www.codshipeurope.com" style="color:#f97316;text-decoration:none">www.codshipeurope.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:contact@codshipeurope.com" style="color:#f97316;text-decoration:none">contact@codshipeurope.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from,
      to:      [w.clientEmail],
      subject: `Your withdrawal request of ${amount} has been received — CODShipEurope`,
      html,
    }),
  }).catch(err => console.error("[withdrawal-request-email] send error:", err))
}

export async function GET() {
  return NextResponse.json(await getWithdrawals())
}

export async function POST(req: Request) {
  const body = await req.json()
  const w = await createWithdrawal(body)
  if (!w) return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 })

  if (w.clientEmail) {
    await sendRequestConfirmationEmail({
      id:                w.id,
      clientName:        w.clientName,
      clientEmail:       w.clientEmail,
      amount:            w.amount,
      currency:          w.currency ?? "EUR",
      iban:              w.iban,
      paymentMethodType: w.paymentMethodType,
      paymentDetails:    w.paymentDetails,
    })
  }

  return NextResponse.json(w, { status: 201 })
}
