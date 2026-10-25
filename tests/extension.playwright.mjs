import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildExtensionVendor } from "../extension/build.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = join(root, "extension");
const artifactsDir = "/opt/cursor/artifacts";
const DEMO = "https://www.youtube.com/watch?v=abc123&si=SHAREID&utm_source=share";

buildExtensionVendor(root);
mkdirSync(artifactsDir, { recursive: true });

const userDataDir = mkdtempSync(join(tmpdir(), "url-cleaner-ext-"));
const errors = [];

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chromium",
  headless: true,
  viewport: { width: 340, height: 420 },
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`
  ]
});

try {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker", { timeout: 15000 });
  }

  const workerUrl = serviceWorker.url();
  assert.match(workerUrl, /^chrome-extension:\/\/[a-p]{32}\/background\.js$/);
  const extensionId = new URL(workerUrl).hostname;

  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`chrome-extension://${extensionId}/popup.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.urlCleanerPopup));

  const manifest = await page.evaluate(() => chrome.runtime.getManifest());
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "clipboardWrite"]);
  assert.equal(manifest.host_permissions, undefined);

  const title = await page.locator("h1").textContent();
  assert.equal(title.trim(), "URL Cleaner");
  assert.equal(await page.locator("#open-site").getAttribute("href"), null);
  assert.equal(await page.locator(".eyebrow").count(), 0);

  await page.evaluate(async (tabUrl) => {
    await globalThis.urlCleanerPopup.bootPopup({
      tabUrl,
      clipboard: { writeText: async () => {} }
    });
  }, DEMO);

  await page.waitForSelector("#status:text('Copied!')");
  assert.equal(await page.locator("#cleaned").getAttribute("title"), "https://www.youtube.com/watch?v=abc123");
  assert.match(await page.locator("#removed-badge").textContent(), /2 removed/);
  assert.equal(await page.locator("#copy-again").isVisible(), true);
  assert.match(await page.locator("#open-site").getAttribute("href") || "", /#url=/);

  const card = await page.locator(".popup-card").boundingBox();
  const clip = {
    x: 0,
    y: 0,
    width: 340,
    height: Math.ceil((card?.y || 0) + (card?.height || 260) + 4)
  };

  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  await page.screenshot({ path: join(artifactsDir, "popup-light.png"), clip });

  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await page.screenshot({ path: join(artifactsDir, "popup-dark.png"), clip });

  assert.deepEqual(errors, [], `extension load errors:\n${errors.join("\n")}`);
  console.log("extension playwright checks passed (MV3 load-unpacked, popup, no errors)");
} finally {
  await context.close();
  rmSync(userDataDir, { recursive: true, force: true });
}
