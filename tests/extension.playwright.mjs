import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildExtensionVendor } from "../extension/build.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = join(root, "extension");
buildExtensionVendor(root);

const userDataDir = mkdtempSync(join(tmpdir(), "url-cleaner-ext-"));
const errors = [];

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chromium",
  headless: true,
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

  const manifest = await page.evaluate(() => chrome.runtime.getManifest());
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "clipboardWrite"]);
  assert.equal(manifest.host_permissions, undefined);

  const title = await page.locator("h1").textContent();
  assert.equal(title.trim(), "URL Cleaner");
  assert.equal(await page.locator("#open-site").getAttribute("href"), null);

  assert.deepEqual(errors, [], `extension load errors:\n${errors.join("\n")}`);
  console.log("extension playwright checks passed (MV3 load-unpacked, popup, no errors)");
} finally {
  await context.close();
  rmSync(userDataDir, { recursive: true, force: true });
}
