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
import {
  PLAYBOOK_IDEAS,
  appendSliderChar,
  applyPopupDismissal,
  captchaCellHasUtm,
  cleaningOptionsChanged,
  charFromSlider,
  clampZoom,
  dialupMs,
  evaluatePasswordRules,
  extrasAfterClose,
  gravityIsOn,
  isCleanWindow,
  multiplyPrime,
  nextHorribleTheme,
  nextSpawnDelay,
  nextThumbwheelWinds,
  nextZoomScale,
  resetPrimes,
  shellIsClean,
  shuffleCups,
  shouldCommitSlotReveal,
  slotCharsForTick,
  splitCaptchaCell,
  stepGravity,
  holdMovedTooFar
} from "../horrible/logic.js";

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
  assert.match(html, /href="\.\/horrible\/playbook\.css"/);
  assert.match(html, /id="horrible-playbook"/);
  assert.match(html, /id="horrible-overlays"/);
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
  const playbook = readFileSync(join(root, "horrible/playbook.css"), "utf8");
  assert.match(css, /html\[data-horrible="on"\]/);
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /horrible-blink 1\.6s/);
  assert.match(css, /horrible-twinkle 2s/);
  assert.match(css, /horrible-bg-shift 28s/);
  assert.match(css, /horrible-loading-shimmer 2\.4s/);
  assert.match(css, /z-index:\s*2147483000/);
  assert.match(css, /z-index:\s*2147482998/);
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /https?:\/\//);
  assert.doesNotMatch(css, /Tahoma|MS Sans Serif|navy|silver/);
  assert.doesNotMatch(playbook, /@import/);
  assert.doesNotMatch(playbook, /https?:\/\//);
});

test("app stops horrible mode from the panic button and Escape", () => {
  const app = readFileSync(join(root, "app.js"), "utf8");
  const js = readFileSync(join(root, "horrible.js"), "utf8");
  assert.match(app, /onStop/);
  assert.match(app, /beforeClean/);
  assert.match(app, /afterClean/);
  assert.match(js, /Escape/);
  assert.match(js, /stopEverything/);
  assert.match(js, /applyPopupDismissal/);
  assert.match(js, /nextSpawnDelay/);
  assert.match(app, /ctrlKey/);
  assert.match(app, /metaKey/);
  assert.match(app, /__urlCleaner/);
  assert.match(app, /source:\s*"keyboard"/);
  assert.match(app, /if \(horribleIsOn\(\)\) return;/);
  assert.match(app, /onSettingsRestored/);
  assert.match(app, /cleaningChanged && input\.value\.trim\(\)/);
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

  const first = applyPopupDismissal({ openCount: 3, closes: 0, now: 1000, cap: 8, multiply: 2, cleanWindowUntil: 0 });
  assert.equal(first.closes, 1);
  assert.equal(first.extras, 2);
  assert.equal(first.inWindow, false);

  const third = applyPopupDismissal({ openCount: 4, closes: 2, now: 4000, cap: 8, multiply: 2, cleanWindowUntil: 0 });
  assert.equal(third.closes, 3);
  assert.equal(third.extras, 0);
  assert.equal(third.inWindow, true);
  assert.equal(third.cleanWindowUntil, 10000);
  assert.equal(nextSpawnDelay(4000, third.cleanWindowUntil, 2800), 6000);
  assert.equal(nextSpawnDelay(11000, third.cleanWindowUntil, 2800), 2800);
  assert.equal(extrasAfterClose(4, 8, 2, true), 0);
  assert.equal(isCleanWindow(4000, 10000), true);
  assert.equal(isCleanWindow(10000, 10000), false);
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

test("playbook ships all 33 ideas behind the horrible toggle", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const css = readFileSync(join(root, "horrible/playbook.css"), "utf8");
  const js = readFileSync(join(root, "horrible/playbook.js"), "utf8");
  const baseCss = readFileSync(join(root, "horrible.css"), "utf8");

  assert.equal(PLAYBOOK_IDEAS.length, 33);
  assert.deepEqual(PLAYBOOK_IDEAS.map((idea) => idea.id), Array.from({ length: 33 }, (_, index) => index + 1));

  for (const idea of PLAYBOOK_IDEAS) {
    if (idea.id === 27) {
      assert.match(baseCss, /Comic Sans MS/);
    }
    if (idea.id === 30) {
      assert.match(css, /cursor:\s*url\("data:image\/svg\+xml/);
    }
    assert.match(html, new RegExp(`data-idea="${idea.id}"`));
  }

  assert.match(css, /html\[data-horrible="on"\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /z-index:\s*2147483000/);
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /https?:\/\//);
  assert.match(js, /Skip, I'm a robot|skip-captcha/);
  assert.match(js, /rememberSettings/);
  assert.match(js, /restoreSettings/);
  assert.match(js, /stopSlotReveal/);
  assert.match(js, /cleaningOptionsChanged/);
  const page = readFileSync(join(root, "horrible.js"), "utf8");
  assert.match(page, /onSettingsRestored/);
  assert.match(page, /flushRestore/);
  assert.match(js, /shouldCommitSlotReveal/);
  assert.match(js, /readHorribleSettingsSnapshot/);
});

test("playbook helpers stay local and never block the real URL", () => {
  assert.equal(charFromSlider(104), "h");
  assert.equal(appendSliderChar("https://", 97), "https://a");
  assert.equal(evaluatePasswordRules("carrot").find((rule) => rule.id === "vegetable").ok, true);
  assert.equal(evaluatePasswordRules("racecar").find((rule) => rule.id === "palindrome").ok, true);
  assert.equal(evaluatePasswordRules("fbclid gclid _ga utm_").find((rule) => rule.id === "vowels").ok, true);
  assert.equal(captchaCellHasUtm("utm_source=ads"), true);
  assert.deepEqual(splitCaptchaCell("abcd"), ["ab", "cd"]);
  assert.equal(nextThumbwheelWinds(4, -12).armed, true);
  assert.equal(holdMovedTooFar({ x: 0, y: 0 }, { x: 3, y: 0 }), true);
  assert.equal(shellIsClean(shuffleCups(["clean", "unclean-a", "unclean-b"], 0), 1), true);
  assert.ok(stepGravity(80, 1) < 80);
  assert.equal(gravityIsOn(51), true);
  assert.equal(multiplyPrime(35, 2).aggressive, true);
  assert.equal(resetPrimes().product, 1);
  assert.equal(nextHorribleTheme("light"), "dark");
  assert.equal(clampZoom(2), 1.3);
  assert.ok(nextZoomScale(0) >= 0.9 && nextZoomScale(0) <= 1.3);
  assert.equal(dialupMs(true), 0);
  assert.equal(dialupMs(false), 1500);
  assert.notEqual(slotCharsForTick("https://ok", 1), "https://ok");
  assert.equal(slotCharsForTick("https://ok", 8), "https://ok");
  assert.equal(shouldCommitSlotReveal(1, 1, true), true);
  assert.equal(shouldCommitSlotReveal(1, 2, true), false);
  assert.equal(shouldCommitSlotReveal(3, 3, false), false);
  assert.equal(cleaningOptionsChanged({ aggressive: true, duplicates: false }, { aggressive: false, duplicates: false }), true);
  assert.equal(cleaningOptionsChanged({ aggressive: false, duplicates: true }, { aggressive: false, duplicates: false }), true);
  assert.equal(cleaningOptionsChanged({ aggressive: false, duplicates: false }, { aggressive: false, duplicates: false }), false);
  assert.equal(cleaningOptionsChanged(null, { aggressive: true }), false);
});
