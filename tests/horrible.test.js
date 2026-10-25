import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { STORAGE_KEYS } from "../storage.js";
import {
  HORRIBLE_DODGE_CLASSES,
  HORRIBLE_DODGE_LIMIT,
  HORRIBLE_STORAGE_KEY,
  applyHorribleAttribute,
  formatHitCounter,
  nextDodgeClass,
  prefersReducedMotion,
  readHorriblePreference,
  resolveCleanDodge,
  shouldShowHorribleNag,
  toggleHorribleMode,
  writeHorriblePreference
} from "../horrible.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

class MemoryStorage {
  #values = new Map();
  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }
  setItem(key, value) {
    this.#values.set(key, String(value));
  }
}

test("horrible mode defaults off and persists through reload", () => {
  const storage = new MemoryStorage();
  assert.equal(readHorriblePreference(storage), false);

  writeHorriblePreference(storage, true);
  assert.equal(readHorriblePreference(storage), true);
  assert.equal(storage.getItem(STORAGE_KEYS.horrible), "true");

  const reloaded = readHorriblePreference(storage);
  assert.equal(reloaded, true);
  assert.equal(toggleHorribleMode(reloaded, storage), false);
  assert.equal(readHorriblePreference(storage), false);
});

test("horrible storage key stays in the url-cleaner namespace", () => {
  assert.equal(HORRIBLE_STORAGE_KEY, STORAGE_KEYS.horrible);
  assert.equal(HORRIBLE_STORAGE_KEY, "url-cleaner.horrible");
});

test("index wires a labeled toggle, stop button, and self-hosted stylesheet", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.match(html, /id="horrible-mode"/);
  assert.match(html, /Horrible mode/);
  assert.match(html, /id="horrible-stop"/);
  assert.match(html, />Make it stop</);
  assert.match(html, /href="\.\/horrible\.css"/);
  assert.doesNotMatch(html, /\sstyle="/);
  assert.doesNotMatch(html, /<script(?![^>]*src=)/);
});

test("theme-init applies stored horrible mode before paint", () => {
  const init = readFileSync(join(root, "theme-init.js"), "utf8");
  assert.match(init, /url-cleaner\.horrible/);
  assert.match(init, /dataset\.horrible/);
});

test("horrible.css keeps motion optional and blinks at or under 2Hz", () => {
  const css = readFileSync(join(root, "horrible.css"), "utf8");
  assert.match(css, /html\[data-horrible="on"\]/);
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /horrible-blink 1s/);
  assert.match(css, /horrible-twinkle 1\.2s/);
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /https?:\/\//);
});

test("dodge helpers cycle a few classes then give up", () => {
  assert.equal(HORRIBLE_DODGE_LIMIT, 3);
  assert.equal(nextDodgeClass(0), HORRIBLE_DODGE_CLASSES[0]);
  assert.equal(nextDodgeClass(3), HORRIBLE_DODGE_CLASSES[0]);
  assert.equal(formatHitCounter(1337), "00001337");
  assert.equal(shouldShowHorribleNag(null), true);
  const session = new MemoryStorage();
  session.setItem("url-cleaner.horrible-nag", "dismissed");
  assert.equal(shouldShowHorribleNag(session), false);
  assert.equal(resolveCleanDodge(3, 0, 1000, 4000).action, "rest");
  assert.equal(resolveCleanDodge(0, 5000, 1000).action, "stay");
  assert.equal(resolveCleanDodge(0, 0, 1000).action, "dodge");
});

test("applyHorribleAttribute toggles data-horrible without touching theme", () => {
  const element = { dataset: { theme: "light" } };
  applyHorribleAttribute(element, true);
  assert.equal(element.dataset.horrible, "on");
  assert.equal(element.dataset.theme, "light");
  applyHorribleAttribute(element, false);
  assert.equal(element.dataset.horrible, undefined);
});

test("prefersReducedMotion is false when matchMedia is missing", () => {
  assert.equal(prefersReducedMotion({}), false);
});
