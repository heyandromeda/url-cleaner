import test from "node:test";
import assert from "node:assert/strict";
import { cleanUrl, fingerprintRemovedKeptDetail, inspectUrl } from "../cleaner.js";

test("fingerprint removed/kept counts use the unwrapped destination, not wrapper params", () => {
  const destination = "https://example.com/page?ref=partner";
  const wrapper = `https://www.google.com/url?utm_source=wrapper-only&q=${encodeURIComponent(destination)}`;
  const result = cleanUrl(wrapper, { aggressive: false });

  assert.deepEqual(result.removedParameters, []);
  assert.ok(
    inspectUrl(wrapper).parameters.some((parameter) => parameter.name === "utm_source"),
    "wrapper inspection still includes wrapper-only tracking params"
  );

  const summary = fingerprintRemovedKeptDetail(wrapper, result.removedParameters, { aggressive: false });
  assert.ok(summary);
  assert.equal(summary.removedCount, 0);
  assert.equal(summary.keptCount, 1);
  assert.match(summary.detail, /1 kept/);
  assert.doesNotMatch(summary.detail, /removed · 2/);
});

test("fingerprint removed/kept reflects destination trackers removed during cleaning", () => {
  const destination = "https://example.com/page?utm_source=newsletter&ref=partner";
  const wrapper = `https://www.google.com/url?q=${encodeURIComponent(destination)}`;
  const result = cleanUrl(wrapper, { aggressive: false });

  assert.deepEqual(result.removedParameters, ["utm_source"]);
  const summary = fingerprintRemovedKeptDetail(wrapper, result.removedParameters, { aggressive: false });
  assert.equal(summary.removedCount, 1);
  assert.equal(summary.keptCount, 1);
  assert.match(summary.detail, /affiliate\/referral, kept because aggressive cleaning is off/);
});
