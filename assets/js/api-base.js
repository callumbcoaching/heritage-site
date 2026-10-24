/* Where the chat and the free-guide form send their requests.
   Same origin when this page is on Vercel, including once the domain points there.
   The production Vercel app when the page is served from cPanel.
   Set window.CALLUMB_API_BASE, or <meta name="callumb-api-base" content="...">.
   An empty string forces same origin. The cPanel pack sets the meta tag. */
(() => {
  const VERCEL_ORIGIN = "https://callumb-coaching.vercel.app";

  function cleanBase(value) {
    if (value === "") return "";
    try {
      const url = new URL(value);
      const host = url.hostname;
      const ours = host === "callumb-coaching.vercel.app"
        || (host.startsWith("callumb-coaching-") && host.endsWith(".vercel.app"));
      if (url.protocol === "https:" && ours && url.origin === value) return url.origin;
    } catch { /* not a URL */ }
    return null;
  }

  function configuredBase() {
    if (typeof window.CALLUMB_API_BASE === "string") {
      return cleanBase(window.CALLUMB_API_BASE.trim().replace(/\/$/, ""));
    }
    const meta = document.querySelector('meta[name="callumb-api-base"]');
    if (!meta) return null;
    return cleanBase((meta.getAttribute("content") || "").trim().replace(/\/$/, ""));
  }

  function onVercelOrLocal() {
    const host = location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app");
  }

  async function detect() {
    const configured = configuredBase();
    if (configured !== null) return configured;
    if (onVercelOrLocal()) return "";
    try {
      const response = await fetch("/api/chat", {
        method: "GET",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(2500),
      });
      const type = response.headers.get("content-type") || "";
      if (response.ok && type.indexOf("application/json") !== -1) return "";
    } catch { /* cPanel has no Node function on this origin */ }
    return VERCEL_ORIGIN;
  }

  let pending = null;
  window.callumbApi = {
    vercelOrigin: VERCEL_ORIGIN,
    base() {
      if (!pending) pending = detect();
      return pending;
    },
    url(path) {
      return this.base().then((base) => base + path);
    },
  };
})();
