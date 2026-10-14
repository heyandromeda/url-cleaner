import test from "node:test";
import assert from "node:assert/strict";
import { cleanBatch, cleanedUrlsFromBatch, cleanUrl } from "../dist/cleaner.js";

test("cleans each line independently with the same rules as cleanUrl", () => {
  const text = [
    "https://example.com/a?utm_source=news&id=1",
    "https://www.youtube.com/watch?v=abc123&si=SHARE&t=30s",
    "https://intranet.example/report?si=42&year=2024"
  ].join("\n");

  const results = cleanBatch(text);
  assert.equal(results.length, 3);
  assert.equal(results[0].ok, true);
  assert.equal(results[0].result.url, cleanUrl(results[0].input).url);
  assert.equal(results[1].result.url, "https://www.youtube.com/watch?v=abc123&t=30s");
  assert.equal(results[2].result.url, "https://intranet.example/report?si=42&year=2024");
});

test("keeps going when one line is invalid", () => {
  const results = cleanBatch([
    "https://example.com/?utm_source=x",
    "not a url",
    "javascript:alert(1)",
    "https://shop.example/item?gclid=abc&q=shoes"
  ].join("\n"));

  assert.equal(results.length, 4);
  assert.equal(results[0].ok, true);
  assert.equal(results[0].result.url, "https://example.com/");
  assert.equal(results[1].ok, false);
  assert.match(results[1].error, /valid URL/);
  assert.equal(results[2].ok, false);
  assert.equal(results[3].ok, true);
  assert.equal(results[3].result.url, "https://shop.example/item?q=shoes");
  assert.deepEqual(cleanedUrlsFromBatch(results), [
    "https://example.com/",
    "https://shop.example/item?q=shoes"
  ]);
});

test("skips blank lines and records original line numbers", () => {
  const results = cleanBatch("\nhttps://example.com/?fbclid=1\n\n  \nhttps://example.com/ok\n");
  assert.equal(results.length, 2);
  assert.equal(results[0].line, 2);
  assert.equal(results[1].line, 5);
});

test("cleanBatch does not fetch or follow opaque shorteners", () => {
  const results = cleanBatch("https://bit.ly/abc?utm_source=x");
  assert.equal(results[0].ok, true);
  assert.equal(results[0].result.url, "https://bit.ly/abc");
  assert.deepEqual(results[0].result.unwrappedFrom, []);
});
