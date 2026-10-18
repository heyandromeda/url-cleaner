import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startDistServer } from "./playwright-static-server.mjs";

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const destination = "https://example.com/page?tag=a&tag=a";
  const wrapper = `https://www.google.com/url?q=${encodeURIComponent(destination)}&safe=active`;

  await page.check("#remove-duplicates");
  await page.fill("#url-input", wrapper);
  await page.click('button.primary-button[type="submit"]');
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });

  const beforeText = await page.locator("#original-url").textContent();
  assert.match(beforeText, /tag=a/);
  assert.doesNotMatch(beforeText, /google\.com/, "Before view should show the destination, not the wrapper host");
  assert.equal(await page.locator("#original-url mark").count(), 1, "Only the duplicate tag occurrence is marked");

  const marked = await page.locator("#original-url mark").textContent();
  assert.equal(marked, "tag=a");

  console.log("wrapper duplicate Before-view playwright checks passed");
} finally {
  await browser.close();
  server.close();
}
