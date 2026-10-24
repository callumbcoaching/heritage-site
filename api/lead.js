// Built from server/lead.ts. Edit that, then npm run build:chat.

// lib/cors.ts
var SITE_ORIGINS = /* @__PURE__ */ new Set([
  "https://callumbcoaching.co.uk",
  "https://www.callumbcoaching.co.uk",
  "https://callumb-coaching.vercel.app"
]);
function originOf(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  return url;
}
function projectVercelHost(hostname) {
  if (hostname === "callumb-coaching.vercel.app") return true;
  return hostname.startsWith("callumb-coaching-") && hostname.endsWith(".vercel.app");
}
function corsOrigin(request) {
  const url = originOf(request);
  if (!url) return null;
  if (url.protocol !== "https:") return null;
  if (SITE_ORIGINS.has(url.origin) || projectVercelHost(url.hostname)) return url.origin;
  const host = request.headers.get("host");
  if (host && url.host === host) return url.origin;
  return null;
}
function requestAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return corsOrigin(request) !== null;
}
function corsHeaders(request) {
  const headers = new Headers();
  headers.set("vary", "Origin");
  const origin = corsOrigin(request);
  if (!origin) return headers;
  headers.set("access-control-allow-origin", origin);
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "Content-Type, Accept");
  headers.set("access-control-max-age", "86400");
  return headers;
}
function preflight(request) {
  const headers = corsHeaders(request);
  if (!request.headers.get("origin") || !requestAllowed(request)) {
    return new Response(null, { status: 403, headers });
  }
  return new Response(null, { status: 204, headers });
}

// server/lead.ts
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MAILERLITE_URL = "https://connect.mailerlite.com/api/subscribers";
var GUIDE_DOWNLOAD = "/guides/the-five-foundations.pdf";
function json(request, body, status) {
  const headers = corsHeaders(request);
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex");
  return Response.json(body, { status, headers });
}
function methodNotAllowed(request) {
  return json(request, { ok: false }, 405);
}
function OPTIONS(request) {
  return preflight(request);
}
function GET(request) {
  return methodNotAllowed(request);
}
function PUT(request) {
  return methodNotAllowed(request);
}
function PATCH(request) {
  return methodNotAllowed(request);
}
function DELETE(request) {
  return methodNotAllowed(request);
}
function HEAD(request) {
  return methodNotAllowed(request);
}
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
async function POST(request) {
  if (!requestAllowed(request)) return json(request, { ok: false }, 403);
  let data = {};
  try {
    const text = await request.text();
    if (text.length > 1e4) return json(request, { ok: false, error: "email" }, 422);
    if (text.trim()) {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        data = parsed;
      }
    }
  } catch {
    data = {};
  }
  if (typeof data.website === "string" && data.website !== "") {
    return json(request, { ok: true }, 200);
  }
  const email = validEmail(data.email);
  if (!email) return json(request, { ok: false, error: "email" }, 422);
  const key = (process.env.MAILERLITE_API_KEY || "").trim();
  if (!key) {
    console.error("MAILERLITE_API_KEY is not set; refusing to call MailerLite");
    return json(request, { ok: false, error: "mailerlite_not_configured" }, 500);
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
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    const name2 = err && typeof err === "object" && "name" in err ? String(err.name) : "error";
    console.error("MailerLite subscriber request failed", name2);
    return json(request, { ok: false, error: "mailerlite" }, 502);
  }
  if (upstream.ok) return json(request, { ok: true, download: GUIDE_DOWNLOAD }, 200);
  console.error("MailerLite subscriber request failed", upstream.status);
  if (upstream.status === 401 || upstream.status === 403) {
    return json(request, { ok: false, error: "mailerlite_rejected" }, 500);
  }
  if (upstream.status === 422) return json(request, { ok: false, error: "email" }, 422);
  return json(request, { ok: false, error: "mailerlite" }, 502);
}
export {
  DELETE,
  GET,
  GUIDE_DOWNLOAD,
  HEAD,
  OPTIONS,
  PATCH,
  POST,
  PUT
};
