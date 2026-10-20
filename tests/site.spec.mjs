import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", title: /Structure over motivation/, h1: /started/i },
  { path: "/about.html", title: /About/, h1: /addictive personality/i },
  { path: "/coaching.html", title: /Coaching/, h1: /Structured transformation/i },
  { path: "/results.html", title: /Results/, h1: /Real transformations/i },
  { path: "/apply.html", title: /Apply/, h1: /where you're at/i },
];

// scroll to the bottom in steps so scroll-triggered reveals and lazy images run
async function walk(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    scrollTo(0, 0);
  });
}

for (const p of pages) {
  test.describe(p.path, () => {
    test("loads cleanly", async ({ page }) => {
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => m.type() === "error" && errors.push(m.text()));
      const res = await page.goto(p.path);
      expect(res.status()).toBe(200);
      await expect(page).toHaveTitle(p.title);
      await expect(page.locator("h1")).toContainText(p.h1);
      await walk(page);
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("no em dashes in the copy", async ({ page }) => {
      await page.goto(p.path);
      expect(await page.locator("body").innerText()).not.toContain("—");
    });

    test("every image loads", async ({ page }) => {
      await page.goto(p.path);
      await walk(page);
      await page.waitForLoadState("networkidle").catch(() => {});
      const broken = await page.$$eval("img", imgs => imgs.filter(i => i.loading !== "lazy" || i.complete).filter(i => i.complete && i.naturalWidth === 0).map(i => i.src));
      expect(broken).toEqual([]);
    });

    test("page never scrolls sideways", async ({ page }) => {
      await page.goto(p.path);
      await walk(page);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(over).toBeLessThanOrEqual(1);
    });

    test("Apply buttons go to the form", async ({ page }) => {
      await page.goto(p.path);
      const applies = page.locator("a.btn", { hasText: /apply/i });
      const n = await applies.count();
      for (let i = 0; i < n; i++) await expect(applies.nth(i)).toHaveAttribute("href", "apply.html");
    });

    test("internal links resolve", async ({ page, request }) => {
      await page.goto(p.path);
      const hrefs = await page.$$eval("a[href]", as => [...new Set(as.map(a => a.getAttribute("href")))]);
      const local = hrefs.filter(h => /^[\w-]+\.html(#.*)?$/.test(h));
      for (const h of local) expect((await request.get("/" + h.split("#")[0])).status(), h).toBe(200);
    });

    test("screenshot", async ({ page }, info) => {
      await page.goto(p.path);
      await walk(page);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `test-results/shots/${info.project.name}${p.path === "/" ? "/home" : p.path.replace(".html", "")}.png`, fullPage: true });
    });
  });
}

test("apply form builds the WhatsApp message", async ({ page }) => {
  await page.goto("/apply.html");
  await page.fill("#f-name", "Dave");
  await page.fill("#f-age", "42");
  await page.getByText("Lose fat", { exact: true }).click();
  await page.fill("#f-tried", "Fall off by week three.");
  await page.getByText("12 months", { exact: true }).click();
  await page.getByRole("button", { name: /review my application/i }).click();
  await expect(page.locator("#applyDone")).toBeVisible();
  await expect(page.locator("#applyText")).toContainText("Name: Dave");
  await expect(page.locator("#applyText")).toContainText("Plan: 12 months");
  const href = await page.locator("#applySend").getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/447359838866\?text=/);
  expect(decodeURIComponent(href)).toContain("Fall off by week three.");
});

test("home: client app tabs switch screens", async ({ page }) => {
  await page.goto("/");
  await page.locator(".cli").scrollIntoViewIfNeeded();
  await page.locator('.cli__tabs button[data-s="2"]').click();
  await expect(page.locator(".cli__screen")).toHaveAttribute("data-s", "2");
  await expect(page.locator('.cli__tabs button[data-s="2"]')).toHaveAttribute("aria-selected", "true");
});

test("home: video feedback plays when in view", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.locator(".vf").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const playing = await page.locator(".vf video").evaluate(v => !v.paused && v.currentTime > 0);
  expect(playing).toBe(true);
});
