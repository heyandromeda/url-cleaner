import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEYS,
  openAppStorage,
  readBooleanSetting,
  readThemePreference,
  writeBooleanSetting,
  writeThemePreference
} from "../storage.js";

class MemoryStorage {
  #values = new Map();
  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }
  setItem(key, value) {
    this.#values.set(key, String(value));
  }
}

test("storage keys keep the url-cleaner namespace", () => {
  for (const key of Object.values(STORAGE_KEYS)) {
    assert.match(key, /^url-cleaner\./);
  }
  assert.equal(STORAGE_KEYS.theme, "url-cleaner.theme");
});

test("boolean settings round-trip through the helper", () => {
  const storage = new MemoryStorage();
  assert.equal(readBooleanSetting(storage, STORAGE_KEYS.autoCopy, true), true);
  writeBooleanSetting(storage, STORAGE_KEYS.autoCopy, false);
  assert.equal(readBooleanSetting(storage, STORAGE_KEYS.autoCopy, true), false);
});

test("theme preference reads and writes light or dark only", () => {
  const storage = new MemoryStorage();
  assert.equal(readThemePreference(storage), null);
  writeThemePreference(storage, "dark");
  assert.equal(readThemePreference(storage), "dark");
  storage.setItem(STORAGE_KEYS.theme, "system");
  assert.equal(readThemePreference(storage), null);
});

test("openAppStorage returns null when localStorage is blocked", () => {
  const blocked = {
    get localStorage() {
      throw new Error("SecurityError");
    }
  };
  assert.equal(openAppStorage(blocked), null);
});
