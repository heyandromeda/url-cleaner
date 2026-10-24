import test from "node:test";
import assert from "node:assert/strict";
import { TRACKING_PARAMETERS, TRACKING_PARAMETER_PREFIXES, HOST_TRACKING_PARAMETERS } from "../dist/cleaner.js";
import {
  PARAMETER_EXPLANATIONS,
  PREFIX_EXPLANATIONS,
  TRACKER_PROFILES,
  explainParameter,
  getTrackerProfile,
  trackerOfTheDay,
  utcDateStamp,
  estimateProfileWordCount
} from "../dist/explanations.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("explains recognized trackers without inventing unknown ones", () => {
  assert.match(explainParameter("gclid"), /Google Ads/i);
  assert.match(explainParameter("FbClId"), /Facebook/i);
  assert.match(explainParameter("msclkid"), /Microsoft/i);
  assert.match(explainParameter("mc_eid"), /Mailchimp/i);
  assert.match(explainParameter("utm_source"), /UTM|Analytics/i);
  assert.match(explainParameter("utm_custom_flag"), /UTM|Urchin/i);
  assert.match(explainParameter("si"), /YouTube/i);
  assert.equal(explainParameter("id"), null);
  assert.match(explainParameter("ref"), /Amazon|Etsy/i);
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
  for (const names of HOST_TRACKING_PARAMETERS.values()) {
    for (const name of names) {
      assert.equal(typeof explainParameter(name), "string", name);
      assert.ok(explainParameter(name).length > 10, name);
    }
  }
  assert.deepEqual(
    Object.keys(PREFIX_EXPLANATIONS).sort(),
    [...TRACKING_PARAMETER_PREFIXES].sort()
  );
});

test("removed-parameter result view can expand local explanations", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const app = readFileSync(join(root, "app.js"), "utf8");
  const css = readFileSync(join(root, "styles.css"), "utf8");
  assert.match(html, /id="removed-hint"/);
  assert.match(html, /Tap a parameter to see what commonly uses it/i);
  assert.match(app, /createElement\("details"\)/);
  assert.match(app, /explainParameter\(parameter\)/);
  assert.match(app, /if \(!explanation\)/);
  assert.match(app, /removedHint\.hidden = parameters\.length === 0/);
  assert.match(css, /\.removed-list li:has\(details\[open\]\)/);
});

test("explanations are bundled data, not fetched URLs", () => {
  for (const text of Object.values(PARAMETER_EXPLANATIONS)) {
    assert.equal(typeof text, "string");
    assert.doesNotMatch(text, /^https?:\/\//);
  }
});

test("tracker profiles cover required educational sections", () => {
  const names = Object.keys(TRACKER_PROFILES);
  assert.ok(names.length >= 20, "expected a diverse daily rotation set");

  for (const name of names) {
    const profile = getTrackerProfile(name);
    assert.equal(profile.name, name);
    assert.equal(profile.explanation, PARAMETER_EXPLANATIONS[name]);
    for (const key of ["what", "who", "how", "why", "privacy", "exampleUrl", "exampleNote", "safeToRemove"]) {
      assert.equal(typeof profile[key], "string", `${name}.${key}`);
      assert.ok(profile[key].length > 20, `${name}.${key}`);
    }
    assert.ok(Array.isArray(profile.funFacts), name);
    assert.ok(profile.funFacts.length >= 2 && profile.funFacts.length <= 4, name);
    assert.match(profile.exampleUrl, /^https:\/\//, name);
    assert.match(profile.safeToRemove, /yes|keep|removing|usually/i, name);
    assert.ok(Array.isArray(profile.sources), `${name}.sources`);
    assert.ok(profile.sources.length >= 1, `${name}.sources`);
    for (const source of profile.sources) {
      assert.equal(typeof source.title, "string", `${name} source title`);
      assert.ok(source.title.length > 5, `${name} source title`);
      assert.match(source.url, /^https:\/\//, `${name} source url`);
    }
    const words = estimateProfileWordCount(profile);
    assert.ok(words >= 140, `${name} too short (${words} words)`);
    assert.ok(words <= 420, `${name} too long (${words} words)`);
  }
});

test("tracker profiles stay inside the known parameter set", () => {
  for (const name of Object.keys(TRACKER_PROFILES)) {
    assert.equal(typeof PARAMETER_EXPLANATIONS[name], "string", name);
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
  assert.ok(TRACKER_PROFILES[first.name]);
  assert.equal(typeof first.what, "string");
  assert.ok(Array.isArray(first.funFacts));
  assert.equal(next.date, "2026-10-15");
  assert.notEqual(first.name, next.name);
});

test("daily rotation eventually visits distinct trackers", () => {
  const seen = new Set();
  const start = Date.parse("2026-01-01T00:00:00Z");
  for (let i = 0; i < Object.keys(TRACKER_PROFILES).length; i += 1) {
    const day = trackerOfTheDay(new Date(start + i * 86400000));
    seen.add(day.name);
  }
  assert.equal(seen.size, Object.keys(TRACKER_PROFILES).length);
});
