import assert from "node:assert/strict";
import { join } from "node:path";
import { chromium } from "playwright";
import { playwrightArtifactsDir } from "./playwright-artifacts.mjs";
import { startDistServer } from "./playwright-static-server.mjs";

const artifactsDir = playwrightArtifactsDir();
const viewports = [
  { width: 320, height: 900 },
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 }
];

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

async function parseRgb(page, selector, property) {
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
  for (const { width, height } of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (scrollWidth > clientWidth + 1) {
      failures.push(`${width}px: horizontal scroll (scrollWidth ${scrollWidth} > clientWidth ${clientWidth})`);
    }

    if (width === 1280 && height === 800) {
      const formBottom = await page.$eval("#clean-form", (element) => element.getBoundingClientRect().bottom);
      const cleanButtonBottom = await page.$eval('button.primary-button[type="submit"]', (element) => element.getBoundingClientRect().bottom);
      const textareaBottom = await page.$eval("#url-input", (element) => element.getBoundingClientRect().bottom);
      if (textareaBottom > height || cleanButtonBottom > height) {
        failures.push("1280x800: textarea or Clean URL button not above the fold on first load");
      }
      if (cleanButtonBottom > formBottom + 2) {
        failures.push("1280x800: Clean URL button not fully visible within form area on first load");
      }
    }

    if (width === 390 && height === 844) {
      const textareaBottom = await page.$eval("#url-input", (element) => element.getBoundingClientRect().bottom);
      const cleanButtonBottom = await page.$eval('button.primary-button[type="submit"]', (element) => element.getBoundingClientRect().bottom);
      if (textareaBottom > height || cleanButtonBottom > height) {
        failures.push("390x844: textarea or Clean URL button not above the fold on first load");
      }
    }

    if (width === 390 && height === 844) {
      const layout = await page.evaluate(() => {
        const row = document.querySelector(".input-row");
        const clean = document.querySelector('button.primary-button[type="submit"]');
        const paste = document.querySelector("#paste-button");
        const inspect = document.querySelector("#inspect-button");
        return {
          rowWidth: row.getBoundingClientRect().width,
          clean: clean.getBoundingClientRect(),
          paste: paste.getBoundingClientRect(),
          inspect: inspect.getBoundingClientRect()
        };
      });
      if (layout.clean.width < layout.rowWidth * 0.98) {
        failures.push("390px: Clean URL is not full width of the input row");
      }
      const pasteBox = layout.paste;
      const inspectBox = layout.inspect;
      if (Math.abs(pasteBox.top - inspectBox.top) > 2) {
        failures.push("390px: Paste and Inspect are not on the same row");
      }
      for (const label of ["Paste", "Inspect URL", "Clean URL"]) {
        const twoLine = await page.locator("button", { hasText: label }).evaluate((button) => button.scrollHeight > button.clientHeight + 1);
        if (twoLine) failures.push(`390px: ${label} label wraps to two lines`);
      }
    }

    await page.keyboard.press("Tab");
    const focusOutline = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return null;
      const styles = getComputedStyle(active);
      return {
        tag: active.tagName,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor
      };
    });
    if (!focusOutline || focusOutline.outlineStyle === "none" || focusOutline.outlineWidth === "0px") {
      failures.push(`${width}px: first tab stop lacks visible focus ring (${JSON.stringify(focusOutline)})`);
    }

    if ((width === 390 && height === 844) || (width === 1280 && height === 800)) {
      await page.screenshot({
        path: join(artifactsDir, `design-audit-${width}x${height}.png`),
        fullPage: false
      });
    }

    await page.close();
  }

  const contrastPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await contrastPage.goto(baseUrl, { waitUntil: "networkidle" });
  const border = await parseRgb(contrastPage, "#url-input", "borderTopColor");
  const background = await parseRgb(contrastPage, "#url-input", "backgroundColor");
  const placeholder = await contrastPage.evaluate(() => getComputedStyle(document.querySelector("#url-input")).getPropertyValue("--color-placeholder").trim());
  const placeholderRgb = placeholder.startsWith("#")
    ? [
        Number.parseInt(placeholder.slice(1, 3), 16),
        Number.parseInt(placeholder.slice(3, 5), 16),
        Number.parseInt(placeholder.slice(5, 7), 16)
      ]
    : null;
  if (border && background && contrastRatio(border, background) < 3) {
    failures.push(`Input border contrast ${contrastRatio(border, background).toFixed(2)} < 3:1`);
  }
  if (placeholderRgb && background && contrastRatio(placeholderRgb, background) < 3) {
    failures.push(`Placeholder contrast ${contrastRatio(placeholderRgb, background).toFixed(2)} < 3:1`);
  }
  await contrastPage.close();

  assert.equal(failures.length, 0, failures.join("\n"));
  console.log(
    "design-audit playwright checks passed at viewports:",
    viewports.map((viewport) => `${viewport.width}x${viewport.height}`).join(", ")
  );
} finally {
  await browser.close();
  server.close();
}
