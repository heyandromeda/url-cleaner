export const STORAGE_KEYS = {
  cleanOnPaste: "url-cleaner.clean-on-paste",
  autoCopy: "url-cleaner.auto-copy",
  totdCollapsed: "url-cleaner.totd-collapsed",
  aggressiveMode: "url-cleaner.aggressive-mode",
  removeDuplicates: "url-cleaner.remove-duplicates",
  theme: "url-cleaner.theme",
  horrible: "url-cleaner.horrible"
};

/** @param {Pick<Storage, "getItem" | "setItem"> | null | undefined} storage */
export function readBooleanSetting(storage, key, fallback) {
  if (!storage) return fallback;
  try {
    const value = storage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

/** @param {Pick<Storage, "getItem" | "setItem"> | null | undefined} storage */
export function writeBooleanSetting(storage, key, value) {
  if (!storage) return;
  try {
    storage.setItem(key, String(value));
  } catch {
    // Settings are a convenience; the cleaner still works if storage is unavailable.
  }
}

/** @param {Pick<Storage, "getItem" | "setItem"> | null | undefined} storage */
export function readThemePreference(storage) {
  if (!storage) return null;
  try {
    const value = storage.getItem(STORAGE_KEYS.theme);
    if (value === "light" || value === "dark") return value;
    return null;
  } catch {
    return null;
  }
}

/** @param {Pick<Storage, "getItem" | "setItem"> | null | undefined} storage */
export function writeThemePreference(storage, theme) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // Theme still applies for this session if storage is unavailable.
  }
}

export function openAppStorage(globalObject) {
  try {
    return globalObject.localStorage;
  } catch {
    return null;
  }
}
