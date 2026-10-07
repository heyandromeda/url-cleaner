import test from "node:test";
import assert from "node:assert/strict";
import { cleanUrl, isOpaqueShortener } from "../dist/cleaner.js";

test("removes a URL containing only UTM parameters", () => {
  const result = cleanUrl("https://example.com/article?utm_source=news&utm_campaign=spring");

  assert.equal(result.url, "https://example.com/article");
  assert.deepEqual(result.removedParameters, ["utm_source", "utm_campaign"]);
  assert.equal(result.changed, true);
});

test("keeps legitimate parameters alongside trackers", () => {
  const result = cleanUrl("https://shop.example/item?id=42&page=2&gclid=abc&q=shoes");

  assert.equal(result.url, "https://shop.example/item?id=42&page=2&q=shoes");
  assert.deepEqual(result.removedParameters, ["gclid"]);
});

test("keeps YouTube v, t, and list parameters", () => {
  const result = cleanUrl("https://www.youtube.com/watch?v=abc123&t=30s&list=PL123&utm_medium=social");

  assert.equal(result.url, "https://www.youtube.com/watch?v=abc123&t=30s&list=PL123");
  assert.deepEqual(result.removedParameters, ["utm_medium"]);
});

test("handles a URL with no query string", () => {
  const result = cleanUrl("https://example.com/path");

  assert.equal(result.url, "https://example.com/path");
  assert.deepEqual(result.removedParameters, []);
  assert.equal(result.changed, false);
});

test("preserves a hash fragment", () => {
  const result = cleanUrl("https://example.com/page?fbclid=123&tab=reviews#details");

  assert.equal(result.url, "https://example.com/page?tab=reviews#details");
  assert.deepEqual(result.removedParameters, ["fbclid"]);
});

test("rejects invalid input", () => {
  assert.throws(() => cleanUrl("not a URL"), /valid URL/);
});

test("matches tracker names case-insensitively", () => {
  const result = cleanUrl("https://example.com/?UTM_Source=x&FbClId=y&keep=yes");

  assert.equal(result.url, "https://example.com/?keep=yes");
  assert.deepEqual(result.removedParameters, ["UTM_Source", "FbClId"]);
});

test("removes additional ad, analytics, and affiliate trackers", () => {
  const result = cleanUrl("https://example.com/article?gbraid=g1&srsltid=s1&hsa_acc=123&mtm_campaign=spring&irclickid=i1&keep=important");

  assert.equal(result.url, "https://example.com/article?keep=important");
  assert.deepEqual(result.removedParameters, ["gbraid", "srsltid", "hsa_acc", "mtm_campaign", "irclickid"]);
});

test("recognizes opaque URL shorteners without resolving them", () => {
  assert.equal(isOpaqueShortener("https://bit.ly/example"), true);
  assert.equal(isOpaqueShortener("https://www.tinyurl.com/example"), true);
  assert.equal(isOpaqueShortener("https://example.com/page"), false);
  assert.equal(isOpaqueShortener("not a URL"), false);
});
