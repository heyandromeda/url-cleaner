import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanUrl, fingerprintRemovedKeptDetail } from "../cleaner.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("typography tokens live in :root and components avoid raw font sizes", () => {
  const css = readFileSync(join(root, "styles.css"), "utf8");
  assert.match(css, /--font-sans:/);
  assert.match(css, /--font-size-h2: 1\.125rem/);
  assert.match(css, /--font-weight-control: 600/);
  assert.match(css, /h1[\s\S]*font-weight: var\(--font-weight-h1\)/);
  assert.doesNotMatch(css.replace(/:root\s*\{[\s\S]*?\n\}/, ""), /font-weight:\s*700;/);
});

test("fingerprint badge uses removed count markup with accessible caption", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.match(html, /id="fingerprint-count-value"/);
  assert.match(html, /fingerprint-removed-caption/);
  assert.doesNotMatch(html, /fingerprint-score" aria-hidden="true"/);
});

test("fingerprint kept text names destination params after unwrap", () => {
  const destination = "https://example.com/page?utm_source=newsletter&ref=partner";
  const wrapper = `https://www.google.com/url?utm_source=wrapper-only&q=${encodeURIComponent(destination)}`;
  const result = cleanUrl(wrapper, { aggressive: false });
  const summary = fingerprintRemovedKeptDetail(wrapper, result.removedParameters, { aggressive: false });
  assert.match(summary.keptText, /`ref`/);
  assert.doesNotMatch(summary.keptText, /wrapper-only/);
});

test("manifest theme colors match light page background", () => {
  const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.theme_color, "#ffffff");
  assert.equal(manifest.background_color, "#ffffff");
});

test("tracker of the day defaults collapsed in markup and app", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(html, /class="totd is-collapsed"/);
  assert.match(app, /readSetting\(TOTD_COLLAPSED_KEY, true\)/);
});
