// Playwright for the heritage site. Uses the Mac's installed Chrome (no browser download).
//   npx playwright test            run every check, desktop + phone
//   npx playwright test --ui       watch it run in the Playwright window
//   npx playwright show-report     open the last HTML report
//   BASE_URL=https://callumbcoaching.co.uk npx playwright test   check the live site
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, channel: "chrome" } },
    { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium", channel: "chrome" } },
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: "node serve.mjs",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
