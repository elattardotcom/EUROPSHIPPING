import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { name, email, category, subject, message } = await req.json()

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.codshipeurope.com"

  if (!apiKey || apiKey === "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    return NextResponse.json({ success: true })
  }

  // Email to admin
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `CODShipEurope <contact@codshipeurope.com>`,
      to: ["contact@codshipeurope.com"],
      reply_to: email,
      subject: `[Support] ${category ? `[${category}] ` : ""}${subject}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#dc2626);padding:24px 36px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle">
                <img src="${baseUrl}/icon.svg" width="44" height="44" alt="CODShipEurope" style="display:block;border-radius:10px" />
              </td>
              <td style="padding-left:12px;vertical-align:middle">
                <p style="margin:0;color:#fff;font-size:18px;font-weight:800">CODShipEurope</p>
                <p style="margin:2px 0 0;color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px">New Support Message</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:24px">
              <tr style="background:rgba(255,255,255,0.03)">
                <td style="padding:12px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05);width:120px">From</td>
                <td style="padding:12px 18px;color:#fff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${name} &lt;${email}&gt;</td>
              </tr>
              <tr>
                <td style="padding:12px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">Category</td>
                <td style="padding:12px 18px;color:#f97316;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">${category || "—"}</td>
              </tr>
              <tr style="background:rgba(255,255,255,0.03)">
                <td style="padding:12px 18px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Subject</td>
                <td style="padding:12px 18px;color:#fff;font-size:13px;font-weight:600">${subject}</td>
              </tr>
            </table>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 24px;margin-bottom:24px">
              <p style="margin:0 0 8px;color:#555;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Message</p>
              <p style="margin:0;color:#ccc;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</p>
            </div>
            <a href="mailto:${email}?subject=Re: ${subject}"
              style="display:inline-block;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none">
              Reply to ${name} →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;color:#444;font-size:11px;text-align:center">
              © ${new Date().getFullYear()} CODShipEurope · <a href="${baseUrl}" style="color:#f97316;text-decoration:none">www.codshipeurope.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }),
  }).catch(err => console.error("[contact-email] error:", err))

  return NextResponse.json({ success: true })
}
