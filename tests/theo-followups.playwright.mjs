import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startDistServer } from "./playwright-static-server.mjs";

function placeholderFitsOneLine(page) {
  return page.evaluate(() => {
    const textarea = document.querySelector("#url-input");
    const styles = getComputedStyle(textarea);
    const probe = document.createElement("span");
    probe.textContent = textarea.placeholder;
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${styles.font};letter-spacing:${styles.letterSpacing};`;
    document.body.append(probe);
    const textWidth = probe.getBoundingClientRect().width;
    probe.remove();
    const padding =
      parseFloat(styles.paddingLeft) +
      parseFloat(styles.paddingRight) +
      parseFloat(styles.borderLeftWidth) +
      parseFloat(styles.borderRightWidth);
    return textWidth <= textarea.clientWidth - padding + 0.5;
  });
}

function chevronTransform(page, selector) {
  return page.$eval(selector, (node) => getComputedStyle(node).transform);
}

const server = await startDistServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const failures = [];

try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light" });
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem("url-cleaner.theme", selectedTheme);
    }, theme);
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const placeholder = await page.getAttribute("#url-input", "placeholder");
    if (placeholder !== "https://site.com/?utm_source=x") {
      failures.push(`${theme}: unexpected placeholder ${placeholder}`);
    }

    if (!(await placeholderFitsOneLine(page))) {
      failures.push(`${theme} 320px: placeholder does not fit on one line`);
    }

    await page.fill("#url-input", "https://example.com/?utm_source=newsletter");
    await page.click('button.primary-button[type="submit"]');
    await page.waitForSelector("#result-panel:not([hidden])", { timeout: 5000 });
    await page.waitForSelector("#xray-panel .disclosure-chevron", { timeout: 5000 });

    const closedTransform = await chevronTransform(page, "#xray-panel .disclosure-chevron");

    await page.locator("#xray-panel summary").click({ force: true });
    await page.waitForFunction(() => document.querySelector("#xray-panel").open);
    const openTransform = await chevronTransform(page, "#xray-panel .disclosure-chevron-wrap");
    if (!openTransform || !openTransform.includes("matrix")) {
      failures.push(`${theme}: X-Ray chevron missing transform when open`);
    } else {
      const rotated = openTransform !== "none" && openTransform !== "matrix(1, 0, 0, 1, 0, 0)";
      if (!rotated) failures.push(`${theme}: X-Ray chevron did not rotate when panel is open (${openTransform})`);
    }

    await page.waitForSelector("#removed-list .disclosure-chevron", { timeout: 5000 });
    await page.locator("#removed-list details summary").first().click({ force: true });
    const chipOpenTransform = await chevronTransform(page, "#removed-list details[open] .disclosure-chevron-wrap");
    if (chipOpenTransform === "none" || chipOpenTransform === "matrix(1, 0, 0, 1, 0, 0)") {
      failures.push(`${theme}: chip chevron reference rotation missing when open`);
    }

    await page.close();
  }

  assert.equal(failures.length, 0, failures.join("\n"));
  console.log("theo-followups playwright checks passed (X-Ray chevron, placeholder @ 320px)");
} finally {
  await browser.close();
  server.close();
}
