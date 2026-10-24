// Free-guide signup. Public URL stays /api/lead.php via the rewrite in vercel.json.
// components.js posts JSON: { name, email, website, src }.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAILERLITE_URL = "https://connect.mailerlite.com/api/subscribers";

function json(body, status) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function methodNotAllowed() {
  return json({ ok: false }, 405);
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
export const HEAD = methodNotAllowed;

function validEmail(value) {
  if (typeof value !== "string") return "";
  const email = value.trim();
  if (!email || email.length > 254) return "";
  if (email.split("@").length !== 2) return "";
  if (!EMAIL.test(email)) return "";
  return email;
}

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 200);
}

export async function POST(request) {
  let data = {};
  try {
    const text = await request.text();
    if (text.length > 10000) return json({ ok: false, error: "email" }, 422);
    if (text.trim()) {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) data = parsed;
    }
  } catch {
    data = {};
  }

  // Hidden "website" field. Live accepts any non-empty string, including spaces,
  // and answers 200 without subscribing. Checked before the email.
  if (typeof data.website === "string" && data.website !== "") {
    return json({ ok: true }, 200);
  }

  const email = validEmail(data.email);
  if (!email) return json({ ok: false, error: "email" }, 422);

  const key = (process.env.MAILERLITE_API_KEY || "").trim();
  if (!key) {
    console.error("MAILERLITE_API_KEY is not set; refusing to call MailerLite");
    return json({ ok: false, error: "mailerlite_not_configured" }, 500);
  }

  const group = (process.env.MAILERLITE_GROUP_ID || "").trim();
  const name = cleanName(data.name);
  const payload = { email };
  if (name) payload.fields = { name };
  if (group) payload.groups = [group];

  let upstream;
  try {
    upstream = await fetch(MAILERLITE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("MailerLite subscriber request failed", err && err.name ? err.name : "error");
    return json({ ok: false, error: "mailerlite" }, 502);
  }

  if (upstream.ok) return json({ ok: true }, 200);

  console.error("MailerLite subscriber request failed", upstream.status);
  if (upstream.status === 401 || upstream.status === 403) {
    return json({ ok: false, error: "mailerlite_rejected" }, 500);
  }
  if (upstream.status === 422) return json({ ok: false, error: "email" }, 422);
  return json({ ok: false, error: "mailerlite" }, 502);
}
