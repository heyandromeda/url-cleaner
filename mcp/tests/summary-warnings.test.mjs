import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_UNWRAP_DEPTH, cleanUrl } from "../../cleaner.js";
import { TOOLS, summarize } from "../server.mjs";

const BITLY = "https://bit.ly/3abcXYZ";
const OPAQUE_RE = /Warning: Opaque shortener host:/;

function nestGoogleWrappers(destination, layers) {
  let url = destination;
  for (let i = 0; i < layers; i += 1) {
    url = `https://www.google.com/url?q=${encodeURIComponent(url)}`;
  }
  return url;
}

test("opaque shortener: clean_url leads with shared warning, not Already clean", () => {
  const text = summarize("clean_url", TOOLS.clean_url.run({ url: BITLY }));
  assert.doesNotMatch(text, /Already clean:/i);
  assert.doesNotMatch(text, /^Cleaned:/m);
  assert.match(text, OPAQUE_RE);
});

test("opaque shortener: batch does not count unchanged shortener as cleaned", () => {
  const text = summarize("clean_urls_batch", TOOLS.clean_urls_batch.run({ urls: [BITLY] }));
  assert.match(text, /^Cleaned 0 of 1 URLs:/);
  assert.doesNotMatch(text, /^Cleaned 1 of 1 URLs:/);
  assert.match(text, OPAQUE_RE);
  assert.doesNotMatch(text, /^- https:\/\/bit\.ly/m);
});

test("opaque shortener: inspect_url leads with shared warning, not Clean slate", () => {
  const text = summarize("inspect_url", TOOLS.inspect_url.run({ url: BITLY }));
  assert.match(text, new RegExp(`^${OPAQUE_RE.source}`));
  assert.doesNotMatch(text, /Clean slate/i);
  assert.doesNotMatch(text, /^Tracking level:/m);
});

test("clean_url summary includes unwrap limit warning", () => {
  const nested = nestGoogleWrappers("https://example.com/?utm_source=deep", MAX_UNWRAP_DEPTH + 1);
  const text = summarize("clean_url", TOOLS.clean_url.run({ url: nested }));
  assert.match(text, /Warning: Stopped unwrapping after \d+ redirect layers\./);
  const direct = cleanUrl(nested);
  assert.equal(direct.unwrapLimitReached, true);
});

test("inspect_url summary lists tracking level and all weirdness flags", () => {
  const url = "https://user:pass@xn--bcher-kva.example:8443/?tag=a&tag=b&next=page%23section";
  const text = summarize("inspect_url", TOOLS.inspect_url.run({ url }));
  assert.match(text, /^Tracking level: /m);
  assert.match(text, /Warning:.*username or password/i);
  assert.match(text, /Warning:.*punycode/i);
  assert.match(text, /Warning:.*8443/);
});

test("clean_urls_batch summary names empty item (merged with DEV-18)", () => {
  const text = summarize("clean_urls_batch", TOOLS.clean_urls_batch.run({
    urls: ["https://example.com/?utm_source=x", "", "https://example.org/?gclid=1"]
  }));
  assert.match(text, /^Cleaned 2 of 3 URLs:/);
  assert.match(text, /couldn't clean item 2 \(empty\): Every item must be a non-empty single-line string\./);
});
