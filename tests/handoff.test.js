import test from "node:test";
import assert from "node:assert/strict";
import {
  canReadClipboard,
  extractHttpUrl,
  hasHandoffFields,
  parseHandoffParams,
  parseHandoffUrl
} from "../dist/handoff.js";

test("share-target and query handoff read url, then text, then title", () => {
  assert.equal(
    parseHandoffParams("url=https%3A%2F%2Fexample.com%2Fpage%3Futm_source%3Dx"),
    "https://example.com/page?utm_source=x"
  );
  assert.equal(
    parseHandoffParams("text=Check%20this%20https%3A%2F%2Fnews.example%2Fa%3Ffbclid%3D1%20please"),
    "https://news.example/a?fbclid=1"
  );
  assert.equal(
    parseHandoffParams("title=https%3A%2F%2Fexample.com%2Ffrom-title"),
    "https://example.com/from-title"
  );
  assert.equal(
    parseHandoffParams("url=not-a-url&text=https%3A%2F%2Ffallback.example%2Fok"),
    "https://fallback.example/ok"
  );
  assert.equal(parseHandoffParams("text=no%20link%20here"), "");
});

test("share-target hash falls back from an invalid url field to text, then title", () => {
  const app = "https://andromeda-url-cleaner.vercel.app/";
  const hash = (fields) => {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(fields)) params.set(name, value);
    return `${app}#${params}`;
  };

  assert.equal(
    parseHandoffUrl(hash({
      url: "not-a-url",
      text: "Check this https://from-text.example/a?fbclid=1 please"
    })),
    "https://from-text.example/a?fbclid=1"
  );
  assert.equal(
    parseHandoffUrl(hash({
      url: "javascript:alert(1)",
      text: "no link here",
      title: "https://from-title.example/ok"
    })),
    "https://from-title.example/ok"
  );
});

test("failed share-target parse still flags handoff fields so the address bar can be cleared", () => {
  const app = "https://andromeda-url-cleaner.vercel.app/";
  const leftover = `${app}#url=not-a-url&text=shared%20secret%20words`;
  assert.equal(parseHandoffUrl(leftover), "");
  assert.equal(hasHandoffFields(leftover), true);
  assert.equal(hasHandoffFields(`${app}?title=just%20words`), true);
  assert.equal(hasHandoffFields(`${app}#unrelated`), false);
  assert.equal(hasHandoffFields(app), false);
});

test("valid url field wins over an embedded &url= in text", () => {
  const app = "https://andromeda-url-cleaner.vercel.app/";
  const params = new URLSearchParams({
    url: "https://good.example/page",
    text: "notes &url=https://evil.example/phish"
  });
  assert.equal(parseHandoffUrl(`${app}#${params}`), "https://good.example/page");
  assert.equal(
    parseHandoffParams(params),
    "https://good.example/page"
  );
});

test("fragment handoff is read and preferred over the query string", () => {
  const encoded = encodeURIComponent("https://example.com/page?utm_source=x&id=1");
  const app = "https://andromeda-url-cleaner.vercel.app/";

  assert.equal(parseHandoffUrl(`${app}#url=${encoded}`), "https://example.com/page?utm_source=x&id=1");
  assert.equal(
    parseHandoffUrl(`${app}?url=${encodeURIComponent("https://query.example/")}#url=${encoded}`),
    "https://example.com/page?utm_source=x&id=1"
  );
  assert.equal(
    parseHandoffUrl(`${app}#text=${encodeURIComponent("Read this https://news.example/a?fbclid=1")}`),
    "https://news.example/a?fbclid=1"
  );
});

test("query handoff still works for legacy ?url= links", () => {
  const app = "https://andromeda-url-cleaner.vercel.app/";

  assert.equal(parseHandoffUrl(`${app}?url=${encodeURIComponent("https://example.com/a")}`), "https://example.com/a");
  assert.equal(
    parseHandoffUrl(`${app}?url=${encodeURIComponent("https://example.com/a")}#unrelated`),
    "https://example.com/a"
  );
  assert.equal(parseHandoffUrl(app), "");
  assert.equal(parseHandoffUrl(`${app}#url=javascript%3Aalert(1)`), "");
});

test("extractHttpUrl keeps parentheses that belong to the link", () => {
  const wiki = "https://en.wikipedia.org/wiki/Urchin_(software)";

  assert.equal(extractHttpUrl(`Look ${wiki} cool`), wiki);
  assert.equal(extractHttpUrl(`(see ${wiki})`), wiki);
  assert.equal(extractHttpUrl(`Read this: ${wiki}).`), wiki);
  assert.equal(extractHttpUrl("Docs (https://example.com/page)."), "https://example.com/page");
  assert.equal(extractHttpUrl("Wow https://example.com/a?utm_source=x!"), "https://example.com/a?utm_source=x");
});

test("extractHttpUrl trims long trailing punctuation quickly", () => {
  const started = performance.now();
  const result = extractHttpUrl(`hi https://a.example/${".".repeat(60000)}x`);

  assert.ok(result.startsWith("https://a.example/"));
  assert.ok(performance.now() - started < 200, "trimming must stay linear");
});

test("extractHttpUrl ignores non-http schemes", () => {
  assert.equal(extractHttpUrl("javascript:alert(1)"), "");
  assert.equal(extractHttpUrl("See ftp://files.example/a"), "");
  assert.equal(extractHttpUrl("https://ok.example/a"), "https://ok.example/a");
});

test("clipboard is only read when the browser reports permission already granted", () => {
  assert.equal(canReadClipboard("granted"), true);
  assert.equal(canReadClipboard("prompt"), false);
  assert.equal(canReadClipboard("denied"), false);
  assert.equal(canReadClipboard("unavailable"), false);
});
