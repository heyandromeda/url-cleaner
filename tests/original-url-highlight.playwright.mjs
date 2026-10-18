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
  await page.check("#remove-duplicates");

  const destination = "https://example.com/?tag=a&tag=a";
  const wrapper = `https://www.google.com/url?q=${encodeURIComponent(destination)}&safe=active`;
  await page.fill("#url-input", wrapper);
  await page.click('button.primary-button[type="submit"]');
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });

  const markedText = await page.locator("#original-url mark").allTextContents();
  assert.deepEqual(
    markedText,
    [],
    `Before view must not mark wrapper params using destination duplicate indices: ${markedText.join(", ")}`
  );

  console.log("original-url-highlight playwright checks passed");
} finally {
  await browser.close();
  server.close();
}
