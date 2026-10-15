import test from "node:test";
import assert from "node:assert/strict";

/**
 * Temporary Bugbot smoke-test helper.
 * Intended to return true only when a URL uses HTTPS.
 */
export function usesHttps(url) {
  // Intentional logic mistake for Bugbot: "http" also matches "https",
  // so HTTP URLs are treated as secure.
  return typeof url === "string" && url.startsWith("http");
}

test("https URLs are treated as secure", () => {
  assert.equal(usesHttps("https://example.com/article"), true);
});

test("http URLs are not treated as secure", () => {
  assert.equal(usesHttps("http://example.com/article"), false);
});

test("non-http schemes are not treated as secure", () => {
  assert.equal(usesHttps("ftp://files.example.com/readme"), false);
});
