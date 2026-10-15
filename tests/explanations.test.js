import test from "node:test";
import assert from "node:assert/strict";
import { TRACKING_PARAMETERS, TRACKING_PARAMETER_PREFIXES, HOST_TRACKING_PARAMETERS } from "../dist/cleaner.js";
import {
  PARAMETER_EXPLANATIONS,
  PREFIX_EXPLANATIONS,
  explainParameter,
  trackerOfTheDay,
  utcDateStamp
} from "../dist/explanations.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
