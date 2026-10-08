export const ADMIN_NOTIFICATION_EMAIL = "soufianeattar7@gmail.com"

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") return null
  const from = process.env.RESEND_FROM_EMAIL ?? "CODShipEurope <contact@codshipeurope.com>"
  return { apiKey, from }
}

export async function sendEmail({
  to, subject, html,
}: { to: string | string[]; subject: string; html: string }) {
  const cfg = getResendConfig()
  if (!cfg) return

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from: cfg.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  }).catch(err => console.error("[email] send error:", err))
}

/** Shared dark-theme envelope matching the existing CODShipEurope transactional emails. */
export function emailShell({
  badgeText, badgeColor, bodyHtml,
}: { badgeText: string; badgeColor: "orange" | "green" | "red"; bodyHtml: string }) {
  const badgeStyles = {
    orange: { bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)",  text: "#f97316" },
    green:  { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  text: "#10b981" },
    red:    { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#ef4444" },
  }[badgeColor]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%">

        <tr>
          <td style="background:#0a0a0a;padding:28px 36px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle">
                <img src="https://www.codshipeurope.com/logo.png" width="48" height="48" alt="CODShipEurope" style="display:block;border-radius:10px" />
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
            <div style="display:inline-block;background:${badgeStyles.bg};border:1px solid ${badgeStyles.border};border-radius:50px;padding:10px 24px">
              <span style="color:${badgeStyles.text};font-size:14px;font-weight:700">${badgeText}</span>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px">
            ${bodyHtml}
          </td>
        </tr>

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
}
