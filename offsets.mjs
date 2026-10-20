import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: +(process.argv[3]||1440), height: +(process.argv[4]||900) } });
await p.goto(process.argv[2] || "http://localhost:3000", { waitUntil: "load" });
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll("main > section, main > div, footer")].map(s => [s.id || s.className.split(" ")[0], s.offsetTop, s.offsetHeight]))));
await b.close();
