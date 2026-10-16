import test from "node:test";
import assert from "node:assert/strict";
import { breakableUrlMarkup } from "../url-break.js";

test("breakableUrlMarkup inserts wbr after URL delimiters", () => {
  const markup = breakableUrlMarkup("https://example.com/path?a=1&b=2");
  assert.match(markup, /com\/<wbr>/);
  assert.match(markup, /\?<wbr>/);
  assert.match(markup, /&<wbr>/);
  assert.match(markup, /=<wbr>/);
});
