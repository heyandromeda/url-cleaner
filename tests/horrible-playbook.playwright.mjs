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

  await page.check("#horrible-mode");
  await page.waitForSelector('[data-idea="26"]:not([hidden])', { timeout: 3000 });
  await page.click('[data-act="splash-clean"]', { force: true });
  if (await page.locator('[data-idea="23"]:not([hidden])').count()) {
    await page.locator('[data-act="cookie"]').first().click({ force: true });
  }
  if (await page.locator('[data-idea="25"]:not([hidden])').count()) {
    await page.click('[data-act="tour-skip"]', { force: true });
  }
  await page.fill("#url-input", "https://example.com/a?utm_source=one");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#cleaned-url")?.textContent.trim() === "https://example.com/a", null, { timeout: 5000 });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  await page.fill("#url-input", "https://example.com/b?utm_source=two");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Control+Enter");
  await page.waitForFunction(() => document.querySelector("#cleaned-url")?.textContent.trim() === "https://example.com/b", null, { timeout: 5000 });
  await page.waitForTimeout(1500);
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/b", "stale slot reveal must not overwrite a later clean");

  await page.check("#horrible-mode");
  await page.waitForFunction(() => localStorage.getItem("url-cleaner.horrible-settings"), null, { timeout: 3000 });
  await page.waitForTimeout(3500);
  const leaked = await page.evaluate(() => ({
    paste: localStorage.getItem("url-cleaner.clean-on-paste"),
    copy: localStorage.getItem("url-cleaner.auto-copy"),
    aggressive: localStorage.getItem("url-cleaner.aggressive-mode"),
    duplicates: localStorage.getItem("url-cleaner.remove-duplicates"),
    snapshot: localStorage.getItem("url-cleaner.horrible-settings")
  }));
  assert.notEqual(leaked.paste, "false", "gravity must not persist Clean on paste off");
  assert.notEqual(leaked.copy, "true", "gravity must not persist Auto-copy on");
  assert.notEqual(leaked.aggressive, "true", "gravity must not persist Aggressive on");
  assert.notEqual(leaked.duplicates, "true", "gravity must not persist Duplicates on");
  assert.match(leaked.snapshot || "", /"paste":true/);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#horrible-stop", { timeout: 5000 });
  await page.click("#horrible-stop");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  assert.equal(await page.locator("#clean-on-paste").isChecked(), true, "Make it stop must restore Clean on paste after reload");
  assert.equal(await page.locator("#auto-copy").isChecked(), false);
  assert.equal(await page.locator("#aggressive-mode").isChecked(), false);
  assert.equal(await page.locator("#remove-duplicates").isChecked(), false);
  assert.notEqual(await page.evaluate(() => localStorage.getItem("url-cleaner.clean-on-paste")), "false");
  assert.equal(await page.evaluate(() => localStorage.getItem("url-cleaner.horrible-settings")), null);

  await page.fill("#url-input", "https://example.com/?ref=important");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Control+Enter");
  await page.waitForFunction(() => document.querySelector("#cleaned-url")?.textContent.trim() === "https://example.com/?ref=important", null, { timeout: 5000 });
  await page.check("#horrible-mode");
  await page.waitForSelector('[data-idea="26"]:not([hidden])', { timeout: 3000 });
  await page.click('[data-act="splash-clean"]', { force: true });
  if (await page.locator('[data-idea="23"]:not([hidden])').count()) {
    await page.locator('[data-act="cookie"]').first().click({ force: true });
  }
  if (await page.locator('[data-idea="25"]:not([hidden])').count()) {
    await page.click('[data-act="tour-skip"]', { force: true });
  }
  await page.locator("[data-gravity='aggressive']").fill("80");
  assert.equal(await page.locator("#aggressive-mode").isChecked(), true);
  await page.locator("#url-input").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#cleaned-url")?.textContent.trim() === "https://example.com/", null, { timeout: 5000 });
  await page.click("#horrible-stop");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  assert.equal(await page.locator("#aggressive-mode").isChecked(), false);
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/?ref=important", "Make it stop must recompute after restoring Aggressive");

  await page.check("#horrible-mode");
  await page.click('[data-act="splash-clean"]', { force: true });
  if (await page.locator('[data-idea="25"]:not([hidden])').count()) {
    await page.click('[data-act="tour-skip"]', { force: true });
  }
  await page.locator("[data-gravity='duplicates']").fill("80");
  assert.equal(await page.locator("#remove-duplicates").isChecked(), true);
  await page.fill("#url-input", "https://example.com/?id=1&id=1");
  await page.locator("#url-input").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#cleaned-url")?.textContent.trim() === "https://example.com/?id=1", null, { timeout: 5000 });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.documentElement.dataset.horrible, null, { timeout: 3000 });
  assert.equal(await page.locator("#remove-duplicates").isChecked(), false);
  assert.equal((await page.locator("#cleaned-url").textContent()).trim(), "https://example.com/?id=1&id=1", "Escape must recompute after restoring duplicate cleanup");

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
