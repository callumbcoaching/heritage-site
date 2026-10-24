import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", title: /Online Personal Trainer/, h1: /started/i },
  { path: "/about", title: /About/, h1: /addictive personality/i },
  { path: "/coaching", title: /Coaching/, h1: /Structured transformation/i },
  { path: "/results", title: /Results/, h1: /Real transformations/i },
  { path: "/apply", title: /Apply/, h1: /where you're at/i },
  { path: "/terms-coaching", title: /Terms/, h1: /The terms/i },
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
      expect(await page.locator("body").innerText()).not.toContain(String.fromCharCode(8212));
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
      for (let i = 0; i < n; i++) await expect(applies.nth(i)).toHaveAttribute("href", "/apply");
    });

    test("internal links resolve", async ({ page, request }) => {
      await page.goto(p.path);
      const hrefs = await page.$$eval("a[href]", as => [...new Set(as.map(a => a.getAttribute("href")))]);
      const ours = ["/", "/about", "/coaching", "/results", "/apply", "/terms-coaching"];
      const local = hrefs.map(h => h.split("#")[0] || "/").filter(h => ours.includes(h));
      for (const h of new Set(local)) expect((await request.get(h)).status(), h).toBe(200);
      expect(hrefs.filter(h => /^[\w-]+\.html/.test(h)), "links should use clean addresses").toEqual([]);
    });

    test("screenshot", async ({ page }, info) => {
      await page.goto(p.path);
      await walk(page);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `test-results/shots/${info.project.name}${p.path === "/" ? "/home" : p.path}.png`, fullPage: true });
    });
  });
}

test("apply form builds the WhatsApp message", async ({ page }) => {
  await page.goto("/apply");
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

test.describe("with Reduce Motion on", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("sections still fade in and numbers still count", async ({ page }) => {
    await page.goto("/");
    const card = page.locator(".fails .panel").first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/\bin\b/);
    await page.waitForTimeout(1200);
    expect(await card.evaluate(e => getComputedStyle(e).opacity)).toBe("1");
    expect(await card.evaluate(e => getComputedStyle(e).transform)).toBe("none");
    const n = page.locator(".sdr__n [data-count]");
    await n.scrollIntoViewIfNeeded();
    const early = await n.textContent(); await page.waitForTimeout(2200);
    expect(await n.textContent()).toBe("89");
    expect(early).not.toBe("89");
  });
  test("nothing slides: marquee and research row stay still", async ({ page }) => {
    await page.goto("/");
    const t = () => page.locator(".marquee__row").evaluate(e => getComputedStyle(e).transform);
    const a = await t(); await page.waitForTimeout(800);
    expect(await t()).toBe(a);
    expect(await page.locator(".evtrack").evaluate(e => getComputedStyle(e).animationName)).toBe("none");
  });
});

for (const path of ["/", "/coaching", "/results"]) {
  test(`five foundations guide on ${path}`, async ({ page }) => {
    await page.goto(path + "#guide");
    const section = page.locator("#guide");
    await expect(section).toContainText("five foundations");
    await expect(section).toContainText("Protein at every meal");
    await expect(section).toContainText("Daily steps");
    await expect(section).toContainText("Three short sessions a week");
    await expect(section).toContainText("Sleep");
    await expect(section).toContainText("One weekly check-in");
    await expect(section.locator('a[data-ev="Guide download"]')).toHaveAttribute("href", "/guides/the-five-foundations.pdf");
    const text = await section.innerText();
    expect(text.toLowerCase()).not.toContain("five numbers");
    expect(text).not.toContain("Blood pressure");
    expect(text).not.toContain("\u2014");
    expect(text).not.toContain("\u2013");
  });
}

test("old guide address redirects to the new pdf", async ({ request }) => {
  const next = await request.get("/guides/the-five-foundations.pdf");
  expect(next.status()).toBe(200);
  expect(next.headers()["content-type"] || "").toMatch(/pdf/);
  const bytes = await next.body();
  expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe("%PDF-");
  const old = await request.get("/guides/five-numbers.pdf", { maxRedirects: 0 });
  expect(old.status()).toBe(301);
  expect(old.headers().location).toBe("/guides/the-five-foundations.pdf");
});

test("api base stays on this origin locally", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.callumbApi, null, { timeout: 8000 });
  expect(await page.evaluate(() => window.callumbApi.base())).toBe("");
  expect(await page.evaluate(() => window.callumbApi.url("/api/chat"))).toBe("/api/chat");
});

test("api base can be pinned to the vercel app", async ({ page }) => {
  await page.route("**/chat/widget.js*", (route) => route.abort());
  await page.goto("/about");
  const url = await page.evaluate(async () => {
    const meta = document.createElement("meta");
    meta.name = "callumb-api-base";
    meta.content = "https://callumb-coaching.vercel.app";
    document.head.appendChild(meta);
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/assets/js/api-base.js?v=foundations1";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.callumbApi.url("/api/lead.php");
  });
  expect(url).toBe("https://callumb-coaching.vercel.app/api/lead.php");
});

test("phone menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/coaching");
  await expect(page.locator(".nav__links")).toBeHidden();
  await page.locator(".burger").click();
  await expect(page.locator("#mnav")).toBeVisible();
  await expect(page.locator(".burger")).toHaveAttribute("aria-expanded", "true");
  await page.locator('#mnav a[href="/results"]').click();
  await expect(page).toHaveURL(/\/results/);
});
