import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEYS,
  clearHorribleSettingsSnapshot,
  openAppStorage,
  parseHorribleSettingsSnapshot,
  readBooleanSetting,
  readHorribleSettingsSnapshot,
  readThemePreference,
  writeBooleanSetting,
  writeHorribleSettingsSnapshot,
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
  removeItem(key) {
    this.#values.delete(key);
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

test("horrible settings snapshot survives reload and clears on restore", () => {
  const storage = new MemoryStorage();
  assert.equal(STORAGE_KEYS.horribleSettings, "url-cleaner.horrible-settings");
  assert.equal(readHorribleSettingsSnapshot(storage), null);
  assert.equal(parseHorribleSettingsSnapshot("not-json"), null);

  writeHorribleSettingsSnapshot(storage, { paste: true, copy: false, aggressive: false, duplicates: true });
  assert.deepEqual(readHorribleSettingsSnapshot(storage), {
    paste: true,
    copy: false,
    aggressive: false,
    duplicates: true
  });

  const reloaded = readHorribleSettingsSnapshot(storage);
  writeHorribleSettingsSnapshot(storage, { paste: false, copy: true, aggressive: true, duplicates: false });
  assert.deepEqual(reloaded, {
    paste: true,
    copy: false,
    aggressive: false,
    duplicates: true
  });
  assert.deepEqual(readHorribleSettingsSnapshot(storage), {
    paste: false,
    copy: true,
    aggressive: true,
    duplicates: false
  });

  clearHorribleSettingsSnapshot(storage);
  assert.equal(readHorribleSettingsSnapshot(storage), null);
});

test("openAppStorage returns null when localStorage is blocked", () => {
  const blocked = {
    get localStorage() {
      throw new Error("SecurityError");
    }
  };
  assert.equal(openAppStorage(blocked), null);
});
