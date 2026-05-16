// Vercel Serverless Function — kontakt.html Backend
// POST application/x-www-form-urlencoded → Resend → 303 /kontakt-danke.html
//
// Erwartete ENV-Variablen:
//   RESEND_API_KEY    (required)
//   MAIL_FROM         (optional, default: "Robi Miler <onboarding@resend.dev>")
//   MAIL_TO           (optional, default: "hello@robertmiler.com")

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RATE_WINDOW_MS = 30_000;
const MAX_NAME = 200;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

const rateLimit = new Map();

function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function redirect(res, path) {
  res.statusCode = 303;
  res.setHeader("Location", path);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("application/json")) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    console.error("[contact] body parse error:", e);
    return redirect(res, "/kontakt.html?error=parse");
  }

  // Honeypot: silent success-Redirect, damit Bots glauben es klappte.
  if (body._honey && String(body._honey).trim() !== "") {
    console.log("[contact] honeypot triggered, ip=", getIp(req));
    return redirect(res, "/kontakt-danke.html");
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!name || name.length > MAX_NAME) return redirect(res, "/kontakt.html?error=name");
  if (!email || email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect(res, "/kontakt.html?error=email");
  }
  if (!message || message.length > MAX_MESSAGE) return redirect(res, "/kontakt.html?error=message");
  if (subject.length > MAX_SUBJECT) return redirect(res, "/kontakt.html?error=subject");

  const ip = getIp(req);
  const now = Date.now();
  const last = rateLimit.get(ip);
  if (last && now - last < RATE_WINDOW_MS) {
    return redirect(res, "/kontakt.html?error=rate");
  }
  rateLimit.set(ip, now);
  if (rateLimit.size > 1000) {
    for (const [k, v] of rateLimit) {
      if (now - v > RATE_WINDOW_MS) rateLimit.delete(k);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY missing");
    return redirect(res, "/kontakt.html?error=config");
  }

  const from = process.env.MAIL_FROM || "Robi Miler <onboarding@resend.dev>";
  const to = process.env.MAIL_TO || "hello@robertmiler.com";
  const subjectLine = subject
    ? `robertmiler.com — ${subject}`
    : `Neue Nachricht von ${name} via robertmiler.com`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
  <div style="background: #1a1a1a; padding: 20px 28px; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; color: #fff; font-size: 18px; font-weight: 500;">Neue Nachricht über robertmiler.com</h1>
  </div>
  <div style="background: #f7f7f7; padding: 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; color: #666; font-size: 13px; width: 100px;">Von</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 500;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; color: #666; font-size: 13px;">E-Mail</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
          <a href="mailto:${escapeHtml(email)}" style="color: #2c5cff;">${escapeHtml(email)}</a>
        </td>
      </tr>
      ${subject ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; color: #666; font-size: 13px;">Betreff</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${escapeHtml(subject)}</td>
      </tr>` : ""}
    </table>
    <div style="margin-top: 24px;">
      <p style="margin: 0 0 8px; color: #666; font-size: 13px;">Nachricht</p>
      <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999;">
      Reply-To ist gesetzt — "Antworten" geht direkt an ${escapeHtml(email)}.
    </div>
  </div>
</div>`.trim();

  const text =
`Neue Nachricht über robertmiler.com

Von:    ${name}
E-Mail: ${email}${subject ? `\nBetreff: ${subject}` : ""}

${message}
`;

  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: subjectLine,
        html,
        text,
      }),
    });

    if (!r.ok) {
      const errBody = await r.text().catch(() => "");
      console.error("[contact] Resend send failed:", r.status, errBody);
      return redirect(res, "/kontakt.html?error=send");
    }
  } catch (e) {
    console.error("[contact] Resend fetch error:", e);
    return redirect(res, "/kontakt.html?error=network");
  }

  return redirect(res, "/kontakt-danke.html");
};
