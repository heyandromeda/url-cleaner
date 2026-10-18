import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startDistServer } from "./playwright-static-server.mjs";

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const consoleErrors = [];

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const chevron = page.locator("#totd-toggle .disclosure-chevron");
  await chevron.waitFor({ state: "attached" });
  assert.ok(await chevron.count(), "Expand chevron SVG is missing from tracker toggle");

  const trackedUrl = "https://example.com/page?utm_source=newsletter&utm_medium=email";
  await page.fill("#url-input", trackedUrl);
  await page.click('button.primary-button[type="submit"]');

  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
  const cleaned = await page.locator("#cleaned-url").textContent();
  assert.ok(cleaned, "Cleaned URL output is empty");
  assert.doesNotMatch(cleaned, /utm_source/, "Cleaned URL still contains utm_source");

  await page.click("#theme-toggle");
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark");

  assert.equal(
    consoleErrors.length,
    0,
    `Console/page errors during boot and clean:\n${consoleErrors.join("\n")}`
  );

  console.log("app-boot playwright checks passed (dist/, clean URL, chevron, no errors)");
} finally {
  await browser.close();
  server.close();
}
