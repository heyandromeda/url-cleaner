import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHandoffParams, parseHandoffUrl } from "../dist/handoff.js";
import { isOpaqueShortener } from "../extension/vendor/cleaner.js";
import { ENGINE_FILES, buildExtensionVendor } from "../extension/build.mjs";
import {
  CLEANER_ORIGIN,
  MAX_URL_LENGTH,
  NOTHING_TO_CLEAN,
  SHORTENER_WARNING,
  URL_TOO_LONG,
  cleanTabUrl,
  handoffUrlFor
} from "../extension/clean.js";
import {
  ALREADY_CLEAN,
  COPIED,
  COPY_FAILED,
  FOCUS_WAIT_MS,
  headlineFor,
  waitForDocumentFocus,
  writeClipboard
} from "../extension/popup-ui.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BOOKMARKLET = "javascript:(()=>{window.open('https://andromeda-url-cleaner.vercel.app/#url='+encodeURIComponent(location.href),'_blank')})()";
const YOUTUBE = "https://youtu.be/_ARIGPnYYUk?si=BNwFs4FDXQAIIDYb";
const YOUTUBE_CLEAN = "https://youtu.be/_ARIGPnYYUk";

function sourceFiles() {
  return readdirSync(join(root, "extension"))
    .filter((name) => name.endsWith(".js") || name.endsWith(".html") || name.endsWith(".json"))
    .map((name) => ({ name, text: readFileSync(join(root, "extension", name), "utf8") }));
}

test("popup clean removes YouTube si and returns the shared result shape", () => {
  const result = cleanTabUrl(YOUTUBE);

  assert.equal(result.original, YOUTUBE);
  assert.equal(result.cleaned, YOUTUBE_CLEAN);
  assert.deepEqual(result.removedParams, ["si"]);
  assert.equal(result.error, "");
  assert.equal(result.copy, true);
  assert.equal(result.openSite, true);
  assert.match(result.summary, /Removed si\./);
  assert.match(result.summary, /Share identifier/i);
});

test("popup clean reports an error for 'not a url' instead of throwing", () => {
  assert.doesNotThrow(() => cleanTabUrl("not a url"));
  const result = cleanTabUrl("not a url");
  assert.equal(result.original, "not a url");
  assert.equal(result.cleaned, "");
  assert.deepEqual(result.removedParams, []);
  assert.match(result.error, /valid URL/i);
  assert.equal(result.copy, false);
  assert.equal(result.openSite, false);
  assert.equal(result.handoffUrl, "");
});

test("handoff link uses #url= only, never ?url=", () => {
  const result = cleanTabUrl(YOUTUBE);
  const parsed = new URL(result.handoffUrl);

  assert.equal(parsed.origin, CLEANER_ORIGIN);
  assert.equal(parsed.pathname, "/");
  assert.equal(parsed.search, "");
  assert.doesNotMatch(result.handoffUrl, /\?url=/);
  assert.match(result.handoffUrl, /#url=/);
  assert.equal(parseHandoffParams(parsed.hash.slice(1)), YOUTUBE);
  assert.equal(parseHandoffUrl(result.handoffUrl), YOUTUBE);
  assert.equal(handoffUrlFor(YOUTUBE), result.handoffUrl);
});

test("long URLs are never truncated and past 8192 characters show a short error", () => {
  const base = "https://example.com/?q=";
  const allowed = `${base}${"a".repeat(MAX_URL_LENGTH - base.length)}`;
  const tooLong = `${allowed}x`;

  assert.equal(allowed.length, MAX_URL_LENGTH);
  assert.ok(tooLong.length > MAX_URL_LENGTH);

  const ok = cleanTabUrl(allowed);
  assert.equal(ok.error, "");
  assert.equal(ok.original, allowed);
  assert.equal(ok.original.length, MAX_URL_LENGTH);
  assert.equal(ok.cleaned, allowed);

  const result = cleanTabUrl(tooLong);
  assert.equal(result.original, tooLong);
  assert.equal(result.original.length, tooLong.length);
  assert.doesNotMatch(result.original, /\.\.\./);
  assert.equal(result.cleaned, "");
  assert.equal(result.error, URL_TOO_LONG);
  assert.equal(result.copy, false);
  assert.equal(result.openSite, false);
  assert.equal(result.handoffUrl, "");
});

test("opaque shorteners are cleaned in place and warned about without being followed", () => {
  const short = "https://bit.ly/abc";
  const dirty = "https://bit.ly/abc?utm_source=x";
  assert.equal(isOpaqueShortener(short), true);
  assert.equal(isOpaqueShortener(dirty), true);

  const plain = cleanTabUrl(short);
  assert.equal(plain.cleaned, short);
  assert.equal(plain.warning, SHORTENER_WARNING);
  assert.equal(plain.error, "");

  const result = cleanTabUrl(dirty);
  assert.equal(result.cleaned, short);
  assert.deepEqual(result.removedParams, ["utm_source"]);
  assert.equal(result.warning, SHORTENER_WARNING);
  assert.equal(result.error, "");
  assert.equal(result.copy, true);
  assert.match(result.handoffUrl, /#url=/);

  const clean = readFileSync(join(root, "extension", "clean.js"), "utf8");
  const ui = readFileSync(join(root, "extension", "popup-ui.js"), "utf8");
  assert.match(clean, /isOpaqueShortener\(/);
  assert.match(ui, /result\.warning/);
  assert.doesNotMatch(clean, /\bfetch\s*\(/);
  assert.doesNotMatch(ui, /\bfetch\s*\(/);
});

test("Copied is only shown after clipboard writeText resolves", async () => {
  let release;
  let entered = false;
  const writeText = () => {
    entered = true;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  let settled = false;
  const pending = writeClipboard("https://youtu.be/_ARIGPnYYUk", {
    clipboard: { writeText },
    win: { focus() {} },
    doc: { hasFocus: () => true }
  }).then((outcome) => {
    settled = true;
    return outcome;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(entered, true);
  assert.equal(settled, false);
  assert.equal(headlineFor({ error: "", removedParams: ["si"] }, null).text, "");
  release();
  const outcome = await pending;
  assert.equal(outcome.ok, true);
  assert.equal(headlineFor({ error: "", removedParams: ["si"] }, outcome).text, COPIED);
});

test("writeText reject plus working fallback still shows Copied", async () => {
  const outcome = await writeClipboard("https://example.com/a", {
    clipboard: { writeText: () => Promise.reject(new Error("Document is not focused")) },
    win: { focus() {} },
    doc: { hasFocus: () => false },
    timeoutMs: 0,
    copyFallback: (text) => text === "https://example.com/a"
  });
  assert.equal(outcome.ok, true);
  assert.equal(headlineFor({ error: "", removedParams: ["utm_source"] }, outcome).text, COPIED);
  assert.equal(headlineFor({ error: "", removedParams: [] }, outcome).text, ALREADY_CLEAN);
});

test("Copied is an error only when writeText and the fallback both fail", async () => {
  const outcome = await writeClipboard("https://example.com/a", {
    clipboard: { writeText: () => Promise.reject(new Error("Document is not focused")) },
    win: { focus() {} },
    doc: { hasFocus: () => false },
    timeoutMs: 0,
    copyFallback: () => false
  });
  assert.equal(outcome.ok, false);
  const headline = headlineFor({ error: "", removedParams: ["utm_source"] }, outcome);
  assert.equal(headline.text, COPY_FAILED);
  assert.notEqual(headline.text, COPIED);
});

test("focus wait is bounded at about 150ms when the document stays unfocused", async () => {
  const started = Date.now();
  await waitForDocumentFocus({
    win: { focus() {} },
    doc: { hasFocus: () => false },
    timeoutMs: FOCUS_WAIT_MS
  });
  assert.ok(Date.now() - started < 400, "focus wait must stay bounded");
});

test("non-http(s) pages show nothing to clean and do not copy or open the site", () => {
  for (const page of ["chrome://settings", "file:///tmp/page.html", "about:blank", "", "edge://flags"]) {
    const result = cleanTabUrl(page);
    assert.equal(result.error, NOTHING_TO_CLEAN, page);
    assert.equal(result.cleaned, "");
    assert.equal(result.copy, false);
    assert.equal(result.openSite, false);
    assert.equal(result.handoffUrl, "");
  }
});

test("extension vendor copies match the repo engine", () => {
  for (const name of ENGINE_FILES) {
    assert.equal(
      readFileSync(join(root, name), "utf8"),
      readFileSync(join(root, "extension", "vendor", name), "utf8"),
      name
    );
  }
});

test("committed vendor matches a fresh extension/build.mjs output", () => {
  const tmp = mkdtempSync(join(tmpdir(), "url-cleaner-vendor-"));
  try {
    buildExtensionVendor(root, tmp);
    for (const name of ENGINE_FILES) {
      assert.equal(
        readFileSync(join(root, "extension", "vendor", name), "utf8"),
        readFileSync(join(tmp, name), "utf8"),
        name
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("extension imports cleanUrl instead of copying the engine", () => {
  const clean = readFileSync(join(root, "extension", "clean.js"), "utf8");
  assert.match(clean, /from ["']\.\/vendor\/cleaner\.js["']/);
  assert.match(clean, /from ["']\.\/vendor\/explanations\.js["']/);
  assert.match(clean, /cleanUrl/);
  assert.match(clean, /explainParameter/);
  assert.match(clean, /isOpaqueShortener/);
  assert.doesNotMatch(clean, /TRACKING_PARAMETERS/);
});

test("MV3 manifest only asks for activeTab and clipboardWrite", () => {
  const manifest = JSON.parse(readFileSync(join(root, "extension", "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "clipboardWrite"]);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
  assert.equal(manifest.optional_permissions, undefined);
  assert.equal(manifest.action.default_popup, "popup.html");
  assert.equal(manifest.background.service_worker, "background.js");
  assert.equal(manifest.background.type, "module");
});

test("extension sources do not fetch URLs or load remote scripts", () => {
  for (const { name, text } of sourceFiles()) {
    assert.doesNotMatch(text, /\bfetch\s*\(/, name);
    assert.doesNotMatch(text, /XMLHttpRequest/, name);
    assert.doesNotMatch(text, /navigator\.sendBeacon/, name);
    assert.doesNotMatch(text, /https:\/\/cdn\.|unpkg\.com|jsdelivr/, name);
  }
});

test("README documents the bookmarklet and unpacked extension", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const html = readFileSync(join(root, "extension", "popup.html"), "utf8");
  assert.match(readme, /## Browser extension \+ bookmarklet/);
  assert.ok(readme.includes(BOOKMARKLET));
  assert.match(readme, /Load unpacked/);
  assert.doesNotMatch(readme, /run `npm run build` so `extension\/vendor/);
  assert.match(readme, /activeTab/);
  assert.match(readme, /clipboardWrite/);
  assert.doesNotMatch(html, /LOCAL UTILITY/);
});
