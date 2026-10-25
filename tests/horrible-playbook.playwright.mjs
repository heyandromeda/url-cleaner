import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { playwrightArtifactsDir } from "./playwright-artifacts.mjs";
import { startDistServer } from "./playwright-static-server.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
const productionCsp = vercel.headers[0].headers.find((header) => header.key === "Content-Security-Policy").value;
const artifactsDir = playwrightArtifactsDir();

const server = await startDistServer({
  extraHeaders: {
    "Content-Security-Policy": productionCsp
  }
});
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const consoleErrors = [];

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: artifactsDir, size: { width: 1280, height: 800 } }
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.horrible || ""), "");
  assert.equal(await page.locator("#horrible-playbook").evaluate((node) => getComputedStyle(node).display), "none");
  assert.equal(await page.locator("#clean-on-paste").isChecked(), true);

  await page.fill("#url-input", "https://example.com/page?utm_source=newsletter");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Control+Enter");
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/page");

  await page.check("#horrible-mode");
  await page.waitForSelector('[data-idea="26"]:not([hidden])', { timeout: 3000 });
  const stop = await page.locator("#horrible-stop").boundingBox();
  assert.ok(stop && stop.y < 80 && stop.x > 900, "Make it stop must stay top-right");

  await page.waitForSelector(".horrible-popup", { timeout: 3000 });
  const layers = await page.evaluate(() => {
    const popup = document.querySelector(".horrible-popup");
    const close = document.querySelector(".horrible-popup-x");
    const splash = document.querySelector('[data-idea="26"]');
    const stopButton = document.querySelector("#horrible-stop");
    const popupZ = Number(getComputedStyle(popup).zIndex);
    const closeZ = Number(getComputedStyle(close).zIndex);
    return {
      popup: popupZ,
      close: closeZ,
      splash: Number(getComputedStyle(splash).zIndex),
      stop: Number(getComputedStyle(stopButton).zIndex),
      host: Number(getComputedStyle(document.querySelector("#horrible-popups")).zIndex)
    };
  });
  assert.ok(layers.stop > layers.host, "Make it stop stays above popups");
  assert.ok(layers.host > layers.splash, "popup layer sits above URL SPACE");
  assert.ok(layers.close >= layers.popup, "X sits on top of its popup");

  for (let index = 0; index < 3; index += 1) {
    const close = page.locator(".horrible-popup-x").first();
    await close.waitFor({ state: "visible", timeout: 4000 });
    await close.click({ timeout: 2000 });
  }

  const afterThree = await page.locator(".horrible-popup").count();
  const quietDeadline = Date.now() + 6000;
  while (Date.now() < quietDeadline - 150) {
    await page.waitForTimeout(150);
    const duringQuiet = await page.locator(".horrible-popup").count();
    assert.equal(duringQuiet, afterThree, `quiet window spawned extras (${afterThree} -> ${duringQuiet})`);
  }

  await page.screenshot({
    path: join(artifactsDir, "horrible-after-fix.png"),
    fullPage: false
  });

  await page.click('[data-act="splash-clean"]');
  if (await page.locator('[data-idea="23"]:not([hidden])').count()) {
    await page.locator('[data-act="cookie"]').first().click({ force: true });
  }
  if (await page.locator('[data-idea="25"]:not([hidden])').count()) {
    await page.click('[data-act="tour-skip"]', { force: true });
  }

  await page.fill("#url-input", "https://example.com/page?utm_source=newsletter&fbclid=abc");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Enter");
  await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/page");

  await page.waitForTimeout(3500);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  assert.equal(await page.locator("#horrible-mode").isChecked(), false);
  assert.equal(await page.locator("#horrible-playbook").evaluate((node) => getComputedStyle(node).display), "none");
  assert.equal(await page.locator("#clean-on-paste").isChecked(), true, "Clean on paste must restore after disable");
  assert.equal(await page.locator("#auto-copy").isChecked(), false);
  assert.equal(await page.locator("#aggressive-mode").isChecked(), false);
  assert.equal(await page.locator("#remove-duplicates").isChecked(), false);

  const faviconCspNoise = consoleErrors.filter((text) => /favicon|apple-touch-icon/i.test(text) && /Content-Security-Policy|connect-src/i.test(text));
  const realErrors = consoleErrors.filter((text) => !faviconCspNoise.includes(text));
  assert.equal(realErrors.length, 0, `Console/page errors:\n${realErrors.join("\n")}`);
  console.log("horrible playbook playwright checks passed");
  if (faviconCspNoise.length) {
    console.log(`ignored ${faviconCspNoise.length} favicon connect-src reports (low priority, CSP unchanged)`);
  }

  const video = page.video();
  await page.close();
  if (video) {
    await video.saveAs(join(artifactsDir, "horrible-after-fix.webm"));
    await video.delete().catch(() => {});
  }
  await context.close();
} finally {
  await browser.close();
  server.close();
}
