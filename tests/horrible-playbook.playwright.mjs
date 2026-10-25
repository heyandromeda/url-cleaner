import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startDistServer } from "./playwright-static-server.mjs";

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const consoleErrors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.horrible || ""), "");
  assert.equal(await page.locator("#horrible-playbook").evaluate((node) => getComputedStyle(node).display), "none");

  await page.fill("#url-input", "https://example.com/page?utm_source=newsletter");
  await page.click('button.primary-button[type="submit"]');
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/page");

  await page.check("#horrible-mode");
  await page.waitForSelector('[data-idea="26"]:not([hidden])', { timeout: 3000 });
  const stop = await page.locator("#horrible-stop").boundingBox();
  assert.ok(stop && stop.y < 80 && stop.x > 900, "Make it stop must stay top-right");

  await page.click('[data-act="splash-clean"]');
  if (await page.locator('[data-idea="23"]:not([hidden])').count()) {
    await page.locator('[data-act="cookie"]').first().click({ force: true });
  }
  if (await page.locator('[data-idea="25"]:not([hidden])').count()) {
    await page.click('[data-act="tour-skip"]', { force: true });
  }

  await page.fill("#url-input", "https://example.com/page?utm_source=newsletter&fbclid=abc");
  await page.click("#horrible-here", { force: true });
  await page.waitForSelector('[data-idea="5"]:not([hidden])', { timeout: 3000 });
  await page.click('[data-act="skip-captcha"]', { force: true });
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/page");

  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  assert.equal(await page.locator("#horrible-mode").isChecked(), false);
  assert.equal(await page.locator("#horrible-playbook").evaluate((node) => getComputedStyle(node).display), "none");

  assert.equal(consoleErrors.length, 0, `Console/page errors:\n${consoleErrors.join("\n")}`);
  console.log("horrible playbook playwright checks passed");
} finally {
  await browser.close();
  server.close();
}
