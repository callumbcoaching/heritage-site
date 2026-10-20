// Playwright for the heritage site. Uses the Mac's installed Chrome (no browser download).
//   npx playwright test            run every check, desktop + phone
//   npx playwright test --ui       watch it run in the Playwright window
//   npx playwright show-report     open the last HTML report
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, channel: "chrome" } },
    { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium", channel: "chrome" } },
  ],
  webServer: {
    command: "node serve.mjs",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
