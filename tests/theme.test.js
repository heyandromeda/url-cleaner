import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  THEME_STORAGE_KEY,
  nextThemeAfterToggle,
  openThemeStorage,
  readStoredThemePreference,
  resolveActiveTheme,
  resolveTheme,
  saveThemePreference,
  themeColorFor,
  toggleAppliedTheme
} from "../theme.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

class MemoryStorage {
  #values = new Map();
  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }
  setItem(key, value) {
    this.#values.set(key, String(value));
  }
  clear() {
    this.#values.clear();
  }
}

test("resolveTheme follows system preference when storage is empty", () => {
  const storage = new MemoryStorage();
  assert.equal(readStoredThemePreference(storage), null);
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(readStoredThemePreference(storage), true), "dark");
});

test("stored light or dark overrides system preference", () => {
  const storage = new MemoryStorage();
  saveThemePreference(storage, "light");
  assert.equal(readStoredThemePreference(storage), "light");
  assert.equal(resolveTheme(readStoredThemePreference(storage), true), "light");

  storage.clear();
  saveThemePreference(storage, "dark");
  assert.equal(resolveTheme(readStoredThemePreference(storage), false), "dark");
});

test("toggle flips the active theme and persistence survives reload", () => {
  const storage = new MemoryStorage();
  let theme = resolveTheme(readStoredThemePreference(storage), false);
  assert.equal(theme, "light");

  theme = nextThemeAfterToggle(theme);
  saveThemePreference(storage, theme);
  assert.equal(theme, "dark");
  assert.equal(readStoredThemePreference(storage), "dark");

  const reloaded = resolveTheme(readStoredThemePreference(storage), false);
  assert.equal(reloaded, "dark");
});

test("theme colors map to browser chrome values", () => {
  assert.equal(themeColorFor("light"), "#ffffff");
  assert.equal(themeColorFor("dark"), "#141414");
});

test("index applies theme before stylesheet to avoid flash", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const initIndex = html.indexOf("./theme-init.js");
  const cssIndex = html.indexOf("./styles.css");
  assert.ok(initIndex > -1, "theme-init.js is linked");
  assert.ok(initIndex < cssIndex, "theme-init.js runs before styles.css");
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /aria-pressed="false"/);
});

test("theme-init.js sets data-theme from storage or system", () => {
  const init = readFileSync(join(root, "theme-init.js"), "utf8");
  assert.match(init, /url-cleaner\.theme/);
  assert.match(init, /prefers-color-scheme: dark/);
  assert.match(init, /dataset\.theme/);
});

test("dark palette tokens are defined on html[data-theme=\"dark\"]", () => {
  const css = readFileSync(join(root, "styles.css"), "utf8");
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(css, /--color-bg: #141414/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\][\s\S]*--color-text: #222/);
});

test("theme storage key matches app setting namespace", () => {
  assert.equal(THEME_STORAGE_KEY, "url-cleaner.theme");
});

test("resolveActiveTheme does not throw when localStorage access is blocked", () => {
  const blocked = {
    get localStorage() {
      throw new Error("SecurityError");
    }
  };
  assert.equal(openThemeStorage(blocked), null);
  assert.equal(resolveActiveTheme(blocked, true), "dark");
  assert.equal(resolveActiveTheme(blocked, false), "light");
});

test("toggleAppliedTheme flips from the applied theme even when persistence fails", () => {
  const storage = {
    setItem() {
      throw new Error("QuotaExceededError");
    }
  };
  assert.equal(toggleAppliedTheme("dark", storage), "light");
  assert.equal(toggleAppliedTheme("light", storage), "dark");
});
