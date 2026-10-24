// Browser origins allowed to call the chat and lead APIs.
// Same-host requests (this deployment, including a preview) are allowed too.
// Locked to the public site, www, and this Vercel project.

const SITE_ORIGINS = new Set([
  "https://callumbcoaching.co.uk",
  "https://www.callumbcoaching.co.uk",
  "https://callumb-coaching.vercel.app",
]);

function originOf(request: Request): URL | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  return url;
}

function projectVercelHost(hostname: string): boolean {
  if (hostname === "callumb-coaching.vercel.app") return true;
  return hostname.startsWith("callumb-coaching-") && hostname.endsWith(".vercel.app");
}

/** Origin to echo, or null when this request must not be shared cross-origin. */
export function corsOrigin(request: Request): string | null {
  const url = originOf(request);
  if (!url) return null;
  if (url.protocol !== "https:") return null;
  if (SITE_ORIGINS.has(url.origin) || projectVercelHost(url.hostname)) return url.origin;
  const host = request.headers.get("host");
  if (host && url.host === host) return url.origin;
  return null;
}

/** True for non-browser calls and for origins this site is allowed to answer. */
export function requestAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return corsOrigin(request) !== null;
}

export function corsHeaders(request: Request): Headers {
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

export function preflight(request: Request): Response {
  const headers = corsHeaders(request);
  if (!request.headers.get("origin") || !requestAllowed(request)) {
    return new Response(null, { status: 403, headers });
  }
  return new Response(null, { status: 204, headers });
}
