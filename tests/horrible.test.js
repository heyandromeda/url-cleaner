import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { STORAGE_KEYS } from "../storage.js";
import {
  HORRIBLE_DODGE_CLASSES,
  HORRIBLE_DODGE_LIMIT,
  HORRIBLE_JOKE_TAG,
  HORRIBLE_POPUP_CAP,
  HORRIBLE_POPUP_COPY,
  HORRIBLE_STORAGE_KEY,
  applyHorribleAttribute,
  formatHitCounter,
  nextCleanWindowUntil,
  nextDodgeClass,
  nextPopupCopy,
  popupCap,
  popupsToSpawnOnClose,
  prefersReducedMotion,
  readHorriblePreference,
  resolveCleanDodge,
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
  assert.match(html, /id="horrible-popups"/);
  assert.match(html, /horrible-loading/);
  assert.match(html, /horrible-spin-banner/);
  assert.match(html, /it's a joke/);
  assert.match(html, /href="\.\/horrible\.css"/);
  assert.doesNotMatch(html, /\sstyle="/);
  assert.doesNotMatch(html, /<script(?![^>]*src=)/);
  assert.doesNotMatch(html, /horrible-nag|Question\.exe|Tahoma|Windows|Defender/);
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
  assert.match(css, /z-index:\s*2147483000/);
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /https?:\/\//);
  assert.doesNotMatch(css, /Tahoma|MS Sans Serif|navy|silver/);
});

test("app stops horrible mode from the panic button and Escape", () => {
  const app = readFileSync(join(root, "app.js"), "utf8");
  const js = readFileSync(join(root, "horrible.js"), "utf8");
  assert.match(app, /onStop/);
  assert.match(js, /Escape/);
  assert.match(js, /stopEverything/);
});

test("dodge helpers cycle a few classes then give up", () => {
  assert.equal(HORRIBLE_DODGE_LIMIT, 3);
  assert.equal(nextDodgeClass(0), HORRIBLE_DODGE_CLASSES[0]);
  assert.equal(nextDodgeClass(3), HORRIBLE_DODGE_CLASSES[0]);
  assert.equal(formatHitCounter(1337), "00001337");
  assert.equal(resolveCleanDodge(3, 0, 1000, 4000).action, "rest");
  assert.equal(resolveCleanDodge(0, 5000, 1000).action, "stay");
  assert.equal(resolveCleanDodge(0, 0, 1000).action, "dodge");
});

test("parody popups multiply until the cap, then leave a clean window", () => {
  assert.equal(popupCap(false), HORRIBLE_POPUP_CAP);
  assert.equal(popupCap(true), 2);
  assert.equal(popupsToSpawnOnClose(3, 8, 2, false), 2);
  assert.equal(popupsToSpawnOnClose(8, 8, 2, false), 1);
  assert.equal(popupsToSpawnOnClose(8, 8, 2, true), 0);
  assert.equal(popupsToSpawnOnClose(1, 2, 2, false), 2);
  assert.equal(nextCleanWindowUntil(3, 1000), 7000);
  assert.equal(nextCleanWindowUntil(2, 1000), 0);
  assert.match(HORRIBLE_JOKE_TAG, /joke/);
  assert.match(nextPopupCopy(0).title, /HOT TRACKERS/);
  assert.ok(HORRIBLE_POPUP_COPY.every((copy) => copy.title && copy.body && copy.action));
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
