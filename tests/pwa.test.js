import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const MIRRORED = [
  "index.html",
  "app.js",
  "cleaner.js",
  "explanations.js",
  "tracker-profiles.js",
  "handoff.js",
  "styles.css",
  "sw.js",
  "manifest.webmanifest"
];

test("root static files match the dist copies used by Vercel", () => {
  for (const name of MIRRORED) {
    assert.equal(existsSync(join(root, name)), true, name);
    assert.equal(
      readFileSync(join(root, name), "utf8"),
      readFileSync(join(dist, name), "utf8"),
      `${name} root/dist mismatch`
    );
  }
});

test("web app manifest uses local UC icons and a GET share_target", () => {
  const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.share_target.method, "GET");
  assert.equal(manifest.share_target.action, "./");
  assert.equal(manifest.share_target.params.url, "url");
  assert.deepEqual(
    manifest.icons.map((icon) => icon.src).sort(),
    ["./apple-touch-icon.png", "./favicon.png"]
  );
  assert.equal(existsSync(join(root, "favicon.png")), true);
  assert.equal(existsSync(join(root, "apple-touch-icon.png")), true);
});

test("index.html loads theme-init before styles for CSP-safe theming", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.match(html, /<script src="\.\/theme-init\.js"><\/script>/);
  const initAt = html.indexOf("./theme-init.js");
  const cssAt = html.indexOf("./styles.css");
  assert.ok(initAt < cssAt);
});

test("index.html links the manifest and existing icons", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png"/);
  assert.doesNotMatch(html, /id="bookmarklet"/);
  assert.match(html, /id="tracker-of-the-day"/);
  assert.match(html, /id="batch-panel"/);
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(app, /serviceWorker\.register\("\.\/sw\.js"\)/);
  assert.match(app, /canReadClipboard/);
  assert.match(app, /parseHandoffUrl/);
});

test("service worker does not cache or fetch URLs", () => {
  const sw = readFileSync(join(root, "sw.js"), "utf8");
  assert.doesNotMatch(sw, /fetch\s*\(/);
  assert.doesNotMatch(sw, /caches/);
  assert.match(sw, /skipWaiting/);
});

test("hidden tracker-of-the-day is not shown by flex display", () => {
  const css = readFileSync(join(root, "styles.css"), "utf8");
  assert.match(css, /\.totd\[hidden\]\s*\{\s*display:\s*none;/);
  assert.match(css, /\.totd-details\[hidden\]\s*\{\s*display:\s*none;/);
  assert.match(css, /\.totd-example-url/);
});

test("tracker of the day uses an accessible expand and collapse control", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(html, /id="totd-toggle"/);
  assert.match(html, /aria-controls="totd-details"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />\s*Expand\s*<\/button>/);
  assert.match(html, /id="totd-details"/);
  assert.doesNotMatch(html, /id="totd-dismiss"/);
  assert.match(app, /url-cleaner\.totd-collapsed/);
  assert.match(app, /aria-expanded/);
  assert.match(app, /totd-sources/);
  assert.doesNotMatch(app, /totd-dismissed/);
});

test("CSP stays strict and still allows the manifest", () => {
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const csp = vercel.headers[0].headers.find((header) => header.key === "Content-Security-Policy").value;
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /form-action 'none'/);
  assert.match(csp, /manifest-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(csp, /connect-src[^;]*https:/);
});
