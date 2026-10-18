import assert from "node:assert/strict";
import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { playwrightArtifactsDir } from "./playwright-artifacts.mjs";
import { startDistServer } from "./playwright-static-server.mjs";

const artifactsDir = playwrightArtifactsDir();
const widths = [320, 390, 1280];

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const failures = [];
const consoleErrors = [];

try {
  for (const theme of ["light", "dark"]) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("url-cleaner.theme", selectedTheme);
        localStorage.removeItem("url-cleaner.totd-collapsed");
      }, theme);
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      if (scrollWidth > clientWidth + 1) {
        failures.push(`${width}px ${theme}: horizontal scroll`);
      }

      for (const label of ["Paste", "Inspect URL", "Clean URL"]) {
        const button = page.locator("button", { hasText: label });
        const metrics = await button.evaluate((node) => ({
          truncated: node.scrollWidth > node.clientWidth + 1,
          wrapped: node.scrollHeight > node.clientHeight + 1
        }));
        if (metrics.truncated || metrics.wrapped) {
          failures.push(`${width}px ${theme}: ${label} wraps or truncates`);
        }
      }

      const iconColor = await page.$eval("#paste-button .icon path", (path) => getComputedStyle(path).stroke);
      if (!iconColor) failures.push(`${width}px ${theme}: icon stroke missing`);

      const border = await page.$eval(".totd", (node) => getComputedStyle(node).borderTopColor);
      const muted = await page.$eval(".field-hint", (node) => getComputedStyle(node).color);
      if (!border || !muted) failures.push(`${width}px ${theme}: border/muted colors missing`);

      const totdCollapsed = await page.$eval("#totd-toggle", (node) => node.getAttribute("aria-expanded"));
      if (totdCollapsed !== "false") failures.push(`${width}px ${theme}: tracker not collapsed by default`);

      if (width === 390 && theme === "light") {
        await page.screenshot({ path: join(artifactsDir, "audit-pass-2-390-light.png"), fullPage: false });
      }
      if (width === 390 && theme === "dark") {
        await page.screenshot({ path: join(artifactsDir, "audit-pass-2-390-dark.png"), fullPage: false });
      }
      if (width === 1280 && theme === "dark") {
        await page.screenshot({ path: join(artifactsDir, "audit-pass-2-1280-dark.png"), fullPage: false });
      }

      const toggleMetrics = await page.$eval("#theme-toggle", (node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
        borderWidth: getComputedStyle(node).borderTopWidth,
        text: node.textContent.trim()
      }));
      if (toggleMetrics.text) failures.push(`${width}px ${theme}: theme toggle should be icon-only`);
      if (toggleMetrics.width < 36 || toggleMetrics.width > 44 || toggleMetrics.height < 36 || toggleMetrics.height > 44) {
        failures.push(`${width}px ${theme}: theme toggle hit area ${toggleMetrics.width}x${toggleMetrics.height} outside 36–44px`);
      }

      await page.close();
    }
  }

  const cspErrors = consoleErrors.filter((line) => /content security policy/i.test(line));
  assert.equal(failures.length, 0, failures.join("\n"));
  assert.equal(cspErrors.length, 0, cspErrors.join("\n"));
  console.log("audit-pass-2 playwright checks passed");
} finally {
  await browser.close();
  server.close();
}
