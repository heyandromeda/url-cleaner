import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanUrl,
  detectWeirdness,
  inspectUrl,
  isOpaqueShortener,
  MAX_UNWRAP_DEPTH,
  trackingFingerprint
} from "../dist/cleaner.js";

test("removes a URL containing only UTM parameters", () => {
  const result = cleanUrl("https://example.com/article?utm_source=news&utm_campaign=spring");

  assert.equal(result.url, "https://example.com/article");
  assert.deepEqual(result.removedParameters, ["utm_source", "utm_campaign"]);
  assert.equal(result.changed, true);
  assert.deepEqual(result.unwrappedFrom, []);
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

test("rejects relative, protocol-relative, and scheme-less URLs", () => {
  assert.throws(() => cleanUrl("/page?utm_source=x"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("//example.com/page?utm_source=x"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("example.com/page?utm_source=x"), /https:\/\/ or http:\/\//);
});

test("rejects non-http schemes", () => {
  assert.throws(() => cleanUrl("javascript:alert(1)"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("javascript:void(0)?utm_source=x"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("data:text/html,hello"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("file:///tmp/page.html?utm_source=x"), /https:\/\/ or http:\/\//);
  assert.throws(() => cleanUrl("ftp://example.com/file?utm_source=x"), /https:\/\/ or http:\/\//);
});

test("accepts http and https including uppercase schemes", () => {
  const httpResult = cleanUrl("http://example.com/?utm_source=x&id=1");
  const httpsResult = cleanUrl("HTTPS://Example.COM/Page?UTM_SOURCE=x&Id=1");

  assert.equal(httpResult.url, "http://example.com/?id=1");
  assert.equal(httpsResult.url, "https://example.com/Page?Id=1");
});

test("emits punycode for IDN hosts while still cleaning", () => {
  const result = cleanUrl("https://münchen.example/path?utm_source=x&keep=1");

  assert.equal(result.url, "https://xn--mnchen-3ya.example/path?keep=1");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
});

test("decodes a single-encoded tracker name but not a double-encoded name", () => {
  const once = cleanUrl("https://example.com/?%75tm_source=x&keep=1");
  const twice = cleanUrl("https://example.com/?%2575tm_source=x&keep=1");

  assert.equal(once.url, "https://example.com/?keep=1");
  assert.deepEqual(once.removedParameters, ["utm_source"]);
  assert.equal(twice.url, "https://example.com/?%2575tm_source=x&keep=1");
  assert.deepEqual(twice.removedParameters, []);
});

test("leaves trackers that live only in the fragment or hashbang", () => {
  const fragment = cleanUrl("https://example.com/page#utm_source=x");
  const hashbang = cleanUrl("https://example.com/#!/page?utm_source=x");

  assert.equal(fragment.url, "https://example.com/page#utm_source=x");
  assert.deepEqual(fragment.removedParameters, []);
  assert.equal(hashbang.url, "https://example.com/#!/page?utm_source=x");
  assert.deepEqual(hashbang.removedParameters, []);
});

test("removes duplicate trackers and keeps duplicate functional parameters", () => {
  const result = cleanUrl("https://example.com/?utm_source=a&utm_source=b&id=1&id=2");

  assert.equal(result.url, "https://example.com/?id=1&id=2");
  assert.deepEqual(result.removedParameters, ["utm_source", "utm_source"]);
});

test("unwraps a Google /url wrapper and cleans the destination", () => {
  const destination = encodeURIComponent("https://example.com/page?utm_source=news&id=9");
  const result = cleanUrl(`https://www.google.com/url?q=${destination}&sa=D&source=editors&ust=1&usg=AF`);

  assert.equal(result.url, "https://example.com/page?id=9");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.equal(result.changed, true);
  assert.deepEqual(result.unwrappedFrom, ["www.google.com"]);
});

test("unwraps a Facebook l.php wrapper and cleans the destination", () => {
  const destination = encodeURIComponent("https://example.com/?utm_source=x");
  const result = cleanUrl(`https://l.facebook.com/l.php?u=${destination}&h=AT`);

  assert.equal(result.url, "https://example.com/");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["l.facebook.com"]);
});

test("unwraps Outlook Safe Links and cleans the destination", () => {
  const destination = encodeURIComponent("https://example.com/page?utm_source=x");
  const result = cleanUrl(`https://nam04.safelinks.protection.outlook.com/?url=${destination}&data=foo`);

  assert.equal(result.url, "https://example.com/page");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["nam04.safelinks.protection.outlook.com"]);
});

test("unwraps a YouTube /redirect wrapper and cleans the destination", () => {
  const destination = encodeURIComponent("https://example.com/?utm_source=x&id=1");
  const result = cleanUrl(`https://www.youtube.com/redirect?event=video_description&q=${destination}`);

  assert.equal(result.url, "https://example.com/?id=1");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["www.youtube.com"]);
});

test("unwraps an href.li query-as-URL wrapper and cleans the destination", () => {
  const result = cleanUrl("https://href.li/?https://example.com/page?utm_source=x");

  assert.equal(result.url, "https://example.com/page");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["href.li"]);
});

test("removes Instagram igsh and igshid share trackers", () => {
  const igsh = cleanUrl("https://www.instagram.com/p/AbCdEf/?igsh=SHARETOKEN");
  const both = cleanUrl("https://example.com/recipe?igshid=YmMyMTA2M2Y=&igsh=xyz&id=9");

  assert.equal(igsh.url, "https://www.instagram.com/p/AbCdEf/");
  assert.deepEqual(igsh.removedParameters, ["igsh"]);
  assert.equal(both.url, "https://example.com/recipe?id=9");
  assert.deepEqual(both.removedParameters, ["igshid", "igsh"]);
});

test("unwraps a LinkedIn /safety/go wrapper and cleans the destination", () => {
  const destination = encodeURIComponent("https://example.com/page?utm_source=li&id=3");
  const result = cleanUrl(`https://www.linkedin.com/safety/go?url=${destination}`);

  assert.equal(result.url, "https://example.com/page?id=3");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["www.linkedin.com"]);
});

test("recursively unwraps nested Google then Facebook wrappers", () => {
  const inner = "https://example.com/page?utm_source=x";
  const facebook = `https://l.facebook.com/l.php?u=${encodeURIComponent(inner)}&h=AT`;
  const result = cleanUrl(`https://www.google.com/url?q=${encodeURIComponent(facebook)}`);

  assert.equal(result.url, "https://example.com/page");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["www.google.com", "l.facebook.com"]);
});

test("href.li keeps the destination's #fragment", () => {
  const result = cleanUrl("https://href.li/?https://example.com/page?utm_source=x&id=2#section");

  assert.equal(result.url, "https://example.com/page?id=2#section");
  assert.deepEqual(result.unwrappedFrom, ["href.li"]);
});

test("cleaning, X-Ray and fingerprint agree on a double-encoded wrapper", () => {
  const result = cleanUrl("https://www.google.com/url?q=https%253A%252F%252Fexample.com%252F%253Futm_source%253Dx%2526id%253D4");

  assert.equal(result.url, "https://example.com/?id=4");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, ["www.google.com"]);
  assert.equal(result.inspection.redirectLayers.length, result.unwrappedFrom.length);
  assert.equal(result.fingerprint.categories.wrappers, result.unwrappedFrom.length);
});

function nestGoogleWrappers(destination, layers) {
  let url = destination;
  for (let index = 0; index < layers; index += 1) {
    url = `https://www.google.com/url?q=${encodeURIComponent(url)}`;
  }
  return url;
}

test("unwraps four nested wrappers so no tracker is left inside", () => {
  const result = cleanUrl(nestGoogleWrappers("https://example.com/?utm_source=deep&id=1", 4));

  assert.equal(result.url, "https://example.com/?id=1");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.equal(result.unwrappedFrom.length, 4);
  assert.equal(result.unwrapLimitReached, false);
  assert.equal(result.inspection.redirectLayers.length, 4);
});

test("reports when the unwrap limit stops before the real destination", () => {
  const result = cleanUrl(nestGoogleWrappers("https://example.com/?utm_source=deep", MAX_UNWRAP_DEPTH + 1));

  assert.equal(result.unwrapLimitReached, true);
  assert.equal(result.unwrappedFrom.length, MAX_UNWRAP_DEPTH);
  assert.match(result.url, /^https:\/\/www\.google\.com\/url\?q=/);
  assert.equal(result.inspection.redirectLayers.length, MAX_UNWRAP_DEPTH);
});

test("stops unwrapping when a wrapper loops back to an earlier layer", () => {
  const loop = "https://www.google.com/url?q=https%3A%2F%2Fl.facebook.com%2Fl.php%3Fu%3Dhttps%253A%252F%252Fwww.google.com%252Furl%253Fq%253Dhttps%25253A%25252F%25252Fl.facebook.com%25252Fl.php";
  const result = cleanUrl(loop);

  assert.ok(result.unwrappedFrom.length <= MAX_UNWRAP_DEPTH);
  assert.equal(result.inspection.redirectLayers.length, result.unwrappedFrom.length);
});

test("cleans a wrapper in place when its destination is not a URL", () => {
  const result = cleanUrl("https://www.google.com/url?q=not-a-url&utm_source=google");

  assert.equal(result.url, "https://www.google.com/url?q=not-a-url");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, []);
});

test("does not follow opaque shorteners", () => {
  const result = cleanUrl("https://bit.ly/abc?utm_source=x");

  assert.equal(result.url, "https://bit.ly/abc");
  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.deepEqual(result.unwrappedFrom, []);
  assert.equal(isOpaqueShortener("https://bit.ly/abc?utm_source=x"), true);
});

test("removes si only on YouTube hosts", () => {
  const youtube = cleanUrl("https://www.youtube.com/watch?v=abc123&si=SHAREID&t=30s");
  const generic = cleanUrl("https://intranet.example/report?si=42&year=2024");

  assert.equal(youtube.url, "https://www.youtube.com/watch?v=abc123&t=30s");
  assert.deepEqual(youtube.removedParameters, ["si"]);
  assert.equal(generic.url, "https://intranet.example/report?si=42&year=2024");
  assert.deepEqual(generic.removedParameters, []);
});

test("removes explicit Matomo pk_ names but keeps pk_live", () => {
  const matomo = cleanUrl("https://example.com/?pk_campaign=spring&pk_kwd=shoes&keep=1");
  const stripeLike = cleanUrl("https://api.example/keys?pk_live=secret&id=1");

  assert.equal(matomo.url, "https://example.com/?keep=1");
  assert.deepEqual(matomo.removedParameters, ["pk_campaign", "pk_kwd"]);
  assert.equal(stripeLike.url, "https://api.example/keys?pk_live=secret&id=1");
  assert.deepEqual(stripeLike.removedParameters, []);
});

test("normalizes a trailing question mark or ampersand", () => {
  assert.equal(cleanUrl("https://example.com/page?").url, "https://example.com/page");
  assert.equal(cleanUrl("https://example.com/page?id=1&").url, "https://example.com/page?id=1");
  assert.equal(cleanUrl("https://example.com/page?utm_source=x").url, "https://example.com/page");
});

test("keeps surviving query segments byte-for-byte", () => {
  const cases = [
    ["https://example.com/s?q=hello%20world&utm_source=x", "https://example.com/s?q=hello%20world"],
    ["https://example.com/s?q=a+b&utm_source=x", "https://example.com/s?q=a+b"],
    ["https://example.com/p?next=/a/b:c,d&gclid=1", "https://example.com/p?next=/a/b:c,d"],
    ["https://example.com/p?a=~x(1)!*&fbclid=1", "https://example.com/p?a=~x(1)!*"],
    ["https://example.com/p?name=caf%E9&utm_source=x", "https://example.com/p?name=caf%E9"],
    ["https://example.com/p?a=1;b=2&utm_source=x", "https://example.com/p?a=1;b=2"],
    ["https://example.com/p?debug&utm_source=x", "https://example.com/p?debug"],
    ["https://example.com/?/blog/post&utm_source=x", "https://example.com/?/blog/post"]
  ];

  for (const [input, expected] of cases) {
    assert.equal(cleanUrl(input).url, expected, input);
  }
});

test("returns an already-clean URL without re-encoding it", () => {
  const input = "https://example.com/s?q=hello%20world&tag=a&tag=b&flag&name=caf%E9#top";
  const result = cleanUrl(input);

  assert.equal(result.url, input);
  assert.equal(result.changed, false);
});

test("removes percent-encoded tracker names and reports them decoded", () => {
  const result = cleanUrl("https://example.com/?utm%5Fsource=x&GCLID=y&keep=1");

  assert.equal(result.url, "https://example.com/?keep=1");
  assert.deepEqual(result.removedParameters, ["utm_source", "GCLID"]);
});

test("still drops utm_source from a long query string", () => {
  const long = `https://example.com/page?${Array.from({ length: 80 }, (_, index) => `p${index}=value`).join("&")}&utm_source=news`;
  const result = cleanUrl(long);
  const params = new URL(result.url).searchParams;

  assert.deepEqual(result.removedParameters, ["utm_source"]);
  assert.equal(params.has("utm_source"), false);
  assert.equal(params.get("p0"), "value");
  assert.equal(params.get("p79"), "value");
});

test("X-Ray categorizes parameters without inventing decoder output in the UI model", () => {
  const nested = encodeURIComponent("https://example.com/path?q=yes");
  const inspection = inspectUrl(`https://example.org/view?url=${nested}&utm_source=mail&id=7#part`);

  assert.equal(inspection.scheme, "https");
  assert.equal(inspection.fragment, "part");
  assert.deepEqual(
    inspection.parameters.map(({ category }) => category),
    ["redirect-related", "tracking", "functional"]
  );
  assert.equal("decodedValues" in inspection.parameters[0], false);
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

test("cleanUrl attaches fingerprint and inspection for the single-result UI", () => {
  const result = cleanUrl("https://example.com/?utm_source=a&id=1");

  assert.equal(result.fingerprint.count, 1);
  assert.equal(result.inspection.parameters[0].category, "tracking");
  assert.deepEqual(result.unwrappedFrom, []);
});
