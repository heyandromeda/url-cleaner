import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_UNWRAP_DEPTH, cleanUrl } from "../../cleaner.js";
import { TOOLS, summarize } from "../server.mjs";

function nestGoogleWrappers(destination, layers) {
  let url = destination;
  for (let i = 0; i < layers; i += 1) {
    url = `https://www.google.com/url?q=${encodeURIComponent(url)}`;
  }
  return url;
}

test("clean_url summary includes opaque shortener warning when already clean", () => {
  const url = "https://bit.ly/abc";
  const text = summarize("clean_url", TOOLS.clean_url.run({ url }));
  assert.match(text, /Already clean: https:\/\/bit\.ly\/abc/);
  assert.match(text, /Warning:.*Opaque shortener/i);
  assert.ok(text.includes("\nWarning:"), "summary must not be bare Already clean without warnings");
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
