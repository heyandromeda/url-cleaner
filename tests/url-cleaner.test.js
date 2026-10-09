import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanUrl,
  detectWeirdness,
  inspectUrl,
  isOpaqueShortener,
  trackingFingerprint,
  unwrapRedirectUrl
} from "../dist/cleaner.js";

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

test("unwraps an allowlisted encoded redirect and cleans its destination", () => {
  const destination = "https://example.com/article?id=42&utm_source=mail";
  const result = cleanUrl(`https://www.google.com/url?q=${encodeURIComponent(destination)}`);

  assert.equal(result.url, "https://example.com/article?id=42");
  assert.equal(result.redirectLayers.length, 1);
  assert.deepEqual(result.removedParameters, ["utm_source"]);
});

test("unwraps nested known redirects without making requests", () => {
  const destination = "https://example.com/?fbclid=x&keep=yes";
  const inner = `https://www.youtube.com/redirect?q=${encodeURIComponent(destination)}`;
  const outer = `https://www.google.com/url?q=${encodeURIComponent(inner)}`;
  const result = cleanUrl(outer);

  assert.equal(result.url, "https://example.com/?keep=yes");
  assert.equal(result.redirectLayers.length, 2);
});

test("does not unwrap unknown sites with a url parameter", () => {
  const input = "https://example.com/view?url=https%3A%2F%2Fother.example%2F&keep=yes";
  const result = cleanUrl(input);

  assert.equal(result.url, input);
  assert.deepEqual(result.redirectLayers, []);
});

test("ignores malformed redirect destinations", () => {
  const input = "https://www.google.com/url?q=%E0%A4%A";
  const result = unwrapRedirectUrl(input);

  assert.equal(result.url.href, "https://www.google.com/url?q=%E0%A4%A");
  assert.deepEqual(result.layers, []);
});

test("limits redirect unwrapping depth", () => {
  let input = "https://example.com/end";
  for (let index = 0; index < 7; index += 1) {
    input = `https://www.google.com/url?q=${encodeURIComponent(input)}`;
  }
  const result = unwrapRedirectUrl(input);

  assert.equal(result.layers.length, 5);
});

test("aggressive mode is opt-in and reports its broader removals", () => {
  const input = "https://example.com/?ref=friend&source=partner&id=42";
  assert.equal(cleanUrl(input).url, input);

  const aggressive = cleanUrl(input, { aggressive: true });
  assert.equal(aggressive.url, "https://example.com/?id=42");
  assert.deepEqual(aggressive.aggressiveRemovedParameters, ["ref", "source"]);
});

test("removes only identical duplicate parameter pairs", () => {
  const result = cleanUrl("https://example.com/?tag=a&tag=a&tag=b&item=1&item=2", { removeDuplicateParameters: true });

  assert.equal(result.url, "https://example.com/?tag=a&tag=b&item=1&item=2");
  assert.deepEqual(result.duplicateParameters, ["tag"]);
});

test("duplicate cleanup is opt-in so signed URLs remain untouched by default", () => {
  const input = "https://example.com/?x=1&x=1&signature=abc";

  assert.equal(cleanUrl(input).url, input);
  assert.equal(cleanUrl(input, { removeDuplicateParameters: true }).url, "https://example.com/?x=1&signature=abc");
});

test("removes all repeated known trackers", () => {
  const result = cleanUrl("https://example.com/?utm_source=a&utm_source=a&id=1");

  assert.equal(result.url, "https://example.com/?id=1");
  assert.deepEqual(result.removedParameters, ["utm_source", "utm_source"]);
});

test("X-Ray categorizes and decodes parameter values for inspection", () => {
  const nested = encodeURIComponent(encodeURIComponent("https://example.com/path?q=yes"));
  const inspection = inspectUrl(`https://example.org/view?url=${nested}&utm_source=mail&id=7#part`);

  assert.equal(inspection.scheme, "https");
  assert.equal(inspection.fragment, "part");
  assert.deepEqual(inspection.parameters.map(({ category }) => category), ["redirect-related", "tracking", "functional"]);
  assert.equal(inspection.parameters[0].decodedValues.at(-1), "https://example.com/path?q=yes");
});

test("tracking fingerprint has a transparent count and severity", () => {
  const score = trackingFingerprint("https://example.com/?utm_source=a&fbclid=b&ref=partner");

  assert.equal(score.count, 3);
  assert.equal(score.label, "Tracker confetti");
  assert.deepEqual(score.categories, { tracking: 2, affiliate: 1, wrappers: 0 });
});

test("tracking fingerprint counts trackers inside a known redirect destination", () => {
  const destination = "https://example.com/?utm_source=a&fbclid=b";
  const score = trackingFingerprint(`https://www.google.com/url?q=${encodeURIComponent(destination)}`);

  assert.equal(score.count, 3);
  assert.deepEqual(score.categories, { tracking: 2, affiliate: 0, wrappers: 1 });
});

test("weirdness detector reports unusual structure without a threat verdict", () => {
  const flags = detectWeirdness("https://user:pass@xn--bcher-kva.example:8443/?tag=a&tag=b&next=page%23section");

  assert.ok(flags.some((flag) => flag.includes("repeated")));
  assert.ok(flags.some((flag) => flag.includes("username or password")));
  assert.ok(flags.some((flag) => flag.includes("punycode")));
  assert.ok(flags.some((flag) => flag.includes("8443")));
  assert.ok(flags.some((flag) => flag.includes("fragment")));
});
