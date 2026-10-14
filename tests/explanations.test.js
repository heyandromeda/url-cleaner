import test from "node:test";
import assert from "node:assert/strict";
import { TRACKING_PARAMETERS, TRACKING_PARAMETER_PREFIXES } from "../dist/cleaner.js";
import {
  PARAMETER_EXPLANATIONS,
  explainParameter,
  trackerOfTheDay,
  utcDateStamp
} from "../dist/explanations.js";

test("explains recognized trackers without inventing unknown ones", () => {
  assert.match(explainParameter("gclid"), /Google Ads/i);
  assert.match(explainParameter("FbClId"), /Facebook/i);
  assert.match(explainParameter("msclkid"), /Microsoft/i);
  assert.match(explainParameter("mc_cid"), /Mailchimp/i);
  assert.match(explainParameter("utm_source"), /UTM|Analytics/i);
  assert.match(explainParameter("utm_custom_flag"), /UTM|Urchin/i);
  assert.match(explainParameter("si"), /YouTube/i);
  assert.equal(explainParameter("id"), null);
  assert.equal(explainParameter("ref"), null);
  assert.equal(explainParameter("totally_unknown_param"), null);
  assert.equal(explainParameter(""), null);
});

test("every bundled tracker name has a local explanation", () => {
  for (const name of TRACKING_PARAMETERS) {
    assert.equal(typeof explainParameter(name), "string", name);
    assert.ok(explainParameter(name).length > 10, name);
  }
  for (const prefix of TRACKING_PARAMETER_PREFIXES) {
    assert.equal(typeof explainParameter(`${prefix}example`), "string", prefix);
  }
});

test("explanations are bundled data, not fetched URLs", () => {
  for (const text of Object.values(PARAMETER_EXPLANATIONS)) {
    assert.equal(typeof text, "string");
    assert.doesNotMatch(text, /^https?:\/\//);
  }
});

test("tracker of the day is deterministic for a UTC date", () => {
  const morning = new Date("2026-10-14T00:30:00Z");
  const evening = new Date("2026-10-14T23:59:59Z");
  const nextDay = new Date("2026-10-15T00:00:00Z");
  const first = trackerOfTheDay(morning);
  const same = trackerOfTheDay(evening);
  const next = trackerOfTheDay(nextDay);

  assert.equal(first.date, "2026-10-14");
  assert.equal(utcDateStamp(morning), "2026-10-14");
  assert.deepEqual(first, same);
  assert.equal(typeof first.name, "string");
  assert.equal(first.explanation, PARAMETER_EXPLANATIONS[first.name]);
  assert.equal(next.date, "2026-10-15");
});
