import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const publicDir = path.join(root, "public");

await rm(publicDir, { recursive: true, force: true });
await mkdir(path.join(root, "api"), { recursive: true });
await mkdir(publicDir, { recursive: true });

await build({
  entryPoints: ["server/chat.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "api/chat.js",
  packages: "external",
  target: "node22",
  legalComments: "none",
});

const skip = new Set([
  "api",
  "lib",
  "server",
  "scripts",
  "node_modules",
  "public",
  "tests",
  "tools",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vercel.json",
  "playwright.config.mjs",
  "serve.mjs",
  "screenshot.mjs",
  "offsets.mjs",
  "playwright-report",
  "test-results",
  "deploy",
]);

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.name.startsWith(".") || skip.has(entry.name) || entry.name.endsWith(".md")) continue;
  await cp(path.join(root, entry.name), path.join(publicDir, entry.name), { recursive: true });
}
