import assert from "node:assert/strict";
import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { playwrightArtifactsDir } from "./playwright-artifacts.mjs";
import { startDistServer } from "./playwright-static-server.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = playwrightArtifactsDir();

function contrastRatio(foreground, background) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (rgb) =>
    0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

async function rgb(page, selector, property) {
  return page.$eval(selector, (element, prop) => {
    const value = getComputedStyle(element)[prop];
    const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  }, property);
}

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const failures = [];

try {
  for (const theme of ["light", "dark"]) {
    for (const width of [320, 390, 1280]) {
      const height = width === 390 ? 844 : 800;
      const page = await browser.newPage({ viewport: { width, height } });
      await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("url-cleaner.theme", selectedTheme);
      }, theme);
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      const applied = await page.evaluate(() => document.documentElement.dataset.theme);
      if (applied !== theme) {
        failures.push(`${width}px ${theme}: expected data-theme=${theme}, got ${applied}`);
      }

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      if (scrollWidth > clientWidth + 1) {
        failures.push(`${width}px ${theme}: horizontal scroll detected`);
      }

      const text = await rgb(page, "html", "color");
      const background = await rgb(page, "html", "backgroundColor");
      if (text && background && contrastRatio(text, background) < 4.5) {
        failures.push(`${width}px ${theme}: body text contrast below AA (${contrastRatio(text, background).toFixed(2)})`);
      }

      if (theme === "dark") {
        const primaryText = await rgb(page, 'button.primary-button[type="submit"]', "color");
        const primaryBg = await rgb(page, 'button.primary-button[type="submit"]', "backgroundColor");
        if (primaryText && primaryBg && contrastRatio(primaryText, primaryBg) < 4.5) {
          failures.push(`${width}px dark: primary button contrast below AA (${contrastRatio(primaryText, primaryBg).toFixed(2)})`);
        }
      }

      const toolbar = await page.evaluate(() => {
        const eyebrow = document.querySelector(".page-toolbar .eyebrow");
        const toggle = document.querySelector("#theme-toggle");
        if (!eyebrow || !toggle) return null;
        const eyebrowBox = eyebrow.getBoundingClientRect();
        const toggleBox = toggle.getBoundingClientRect();
        const toolbarTop = document.querySelector(".page-toolbar").getBoundingClientRect().top;
        const paddingTop = Number.parseFloat(getComputedStyle(document.querySelector(".app-shell")).paddingTop);
        return {
          toolbarTop,
          paddingTop,
          overlap: !(toggleBox.left >= eyebrowBox.right + 4 || toggleBox.right <= eyebrowBox.left - 4),
          toggleClipped: toggleBox.right > document.documentElement.clientWidth + 0.5 || toggleBox.left < 0
        };
      });
      if (toolbar?.overlap) failures.push(`${width}px ${theme}: theme toggle overlaps eyebrow`);
      if (toolbar?.toggleClipped) failures.push(`${width}px ${theme}: theme toggle clipped horizontally`);
      if (toolbar && toolbar.toolbarTop < 11) {
        failures.push(`${width}px ${theme}: toolbar top inset below --space-3 (${toolbar.toolbarTop}px)`);
      }

      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const styles = getComputedStyle(document.activeElement);
        return styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
      });
      if (!focus) failures.push(`${width}px ${theme}: missing focus ring on first tab stop`);

      await page.screenshot({
        path: join(artifactsDir, `dark-mode-${width}-${theme}.png`),
        fullPage: false
      });
      await page.close();
    }
  }

  const togglePage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await togglePage.emulateMedia({ colorScheme: "light" });
  await togglePage.goto(baseUrl, { waitUntil: "networkidle" });
  await togglePage.evaluate(() => localStorage.removeItem("url-cleaner.theme"));
  await togglePage.reload({ waitUntil: "networkidle" });
  assert.equal(await togglePage.evaluate(() => document.documentElement.dataset.theme), "light");

  await togglePage.click("#theme-toggle");
  assert.equal(await togglePage.evaluate(() => document.documentElement.dataset.theme), "dark");
  assert.equal(await togglePage.evaluate(() => localStorage.getItem("url-cleaner.theme")), "dark");
  assert.equal(await togglePage.locator("#theme-toggle").getAttribute("aria-pressed"), "true");

  await togglePage.reload({ waitUntil: "networkidle" });
  assert.equal(await togglePage.evaluate(() => document.documentElement.dataset.theme), "dark");
  await togglePage.close();

  assert.equal(failures.length, 0, failures.join("\n"));
  console.log("dark-mode playwright checks passed (320/390/1280, light/dark)");
} finally {
  await browser.close();
  server.close();
}
