// node screenshot.mjs <url> [label] [--w 1440] [--h 900] [--at 0,1200,2400 | --full] [--reduced]
// Saves to ./temporary screenshots/screenshot-N[-label][-yPOS].png
import { chromium } from "playwright-core"; import fs from "node:fs"; import path from "node:path";
const a = process.argv.slice(2); const url = a[0] || "http://localhost:3000";
const label = a[1] && !a[1].startsWith("--") ? a[1] : "";
const opt = (n, d) => { const i = a.indexOf(n); return i > -1 ? a[i + 1] : d; };
const W = +opt("--w", 1440), H = +opt("--h", 900);
const at = (opt("--at", "0")).split(",").map(Number);
const dir = "temporary screenshots"; fs.mkdirSync(dir, { recursive: true });
const n = fs.readdirSync(dir).filter(f => f.startsWith("screenshot-")).map(f => +f.split("-")[1].split(".")[0]).reduce((m, x) => Math.max(m, x || 0), 0) + 1;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: W < 600 ? 2 : 1, reducedMotion: a.includes("--reduced") ? "reduce" : "no-preference" });
await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
for (const y of at) {
  // walk down in steps so scroll-driven reveals fire like a real visitor
  const cur = await page.evaluate(() => scrollY);
  for (let s = cur; Math.abs(s - y) > 1; s += Math.sign(y - s) * Math.min(400, Math.abs(y - s))) { await page.evaluate(v => scrollTo(0, v), s); await page.waitForTimeout(60); }
  await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(1400);
  const f = path.join(dir, `screenshot-${n}${label ? "-" + label : ""}${at.length > 1 ? "-y" + y : ""}.png`);
  await page.screenshot({ path: f, fullPage: a.includes("--full") }); console.log(f);
}
const h = await page.evaluate(() => document.documentElement.scrollHeight); console.log("pageHeight", h);
await browser.close();
