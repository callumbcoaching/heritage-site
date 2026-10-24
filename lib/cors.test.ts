import assert from "node:assert/strict";
import { test } from "node:test";
import { corsHeaders, corsOrigin, preflight, requestAllowed } from "./cors.ts";

function call(origin: string | null, host = "callumb-coaching.vercel.app"): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  headers.set("host", host);
  return new Request(`https://${host}/api/chat`, { headers });
}

test("allows the public site, www, and the vercel app", () => {
  assert.equal(corsOrigin(call("https://callumbcoaching.co.uk")), "https://callumbcoaching.co.uk");
  assert.equal(corsOrigin(call("https://www.callumbcoaching.co.uk")), "https://www.callumbcoaching.co.uk");
  assert.equal(corsOrigin(call("https://callumb-coaching.vercel.app")), "https://callumb-coaching.vercel.app");
});

test("allows this project's preview hosts and the deployment's own host", () => {
  const preview = "https://callumb-coaching-git-main-clockwork-ai1.vercel.app";
  assert.equal(corsOrigin(call(preview)), preview);
  const own = "https://heritage-preview.example";
  assert.equal(corsOrigin(call(own, "heritage-preview.example")), own);
});

test("rejects other sites, http, and a lookalike host", () => {
  assert.equal(corsOrigin(call("https://evil.example")), null);
  assert.equal(corsOrigin(call("http://callumbcoaching.co.uk")), null);
  assert.equal(corsOrigin(call("https://callumbcoaching.co.uk.evil.example")), null);
  assert.equal(corsOrigin(call("https://not-callumb-coaching.vercel.app")), null);
  assert.equal(requestAllowed(call("https://evil.example")), false);
});

test("allows a request with no origin", () => {
  assert.equal(requestAllowed(call(null)), true);
  assert.equal(corsOrigin(call(null)), null);
});

test("preflight echoes the site origin and blocks the rest", () => {
  const ok = preflight(call("https://callumbcoaching.co.uk"));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://callumbcoaching.co.uk");
  assert.match(ok.headers.get("access-control-allow-methods") || "", /POST/);
  assert.match(ok.headers.get("access-control-allow-headers") || "", /Content-Type/);
  const blocked = preflight(call("https://evil.example"));
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("access-control-allow-origin"), null);
  const headers = corsHeaders(call("https://www.callumbcoaching.co.uk"));
  assert.equal(headers.get("vary"), "Origin");
});
