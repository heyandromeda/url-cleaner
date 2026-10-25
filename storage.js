export const STORAGE_KEYS = {
  cleanOnPaste: "url-cleaner.clean-on-paste",
  autoCopy: "url-cleaner.auto-copy",
  totdCollapsed: "url-cleaner.totd-collapsed",
  aggressiveMode: "url-cleaner.aggressive-mode",
  removeDuplicates: "url-cleaner.remove-duplicates",
  theme: "url-cleaner.theme",
  horrible: "url-cleaner.horrible",
  horribleSettings: "url-cleaner.horrible-settings"
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

export function parseHorribleSettingsSnapshot(value) {
  if (value == null || value === "") return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      paste: Boolean(parsed.paste),
      copy: Boolean(parsed.copy),
      aggressive: Boolean(parsed.aggressive),
      duplicates: Boolean(parsed.duplicates)
    };
  } catch {
    return null;
  }
}

/** @param {Pick<Storage, "getItem" | "setItem"> | null | undefined} storage */
export function readHorribleSettingsSnapshot(storage) {
  if (!storage) return null;
  try {
    return parseHorribleSettingsSnapshot(storage.getItem(STORAGE_KEYS.horribleSettings));
  } catch {
    return null;
  }
}

/** @param {Pick<Storage, "getItem" | "setItem" | "removeItem"> | null | undefined} storage */
export function writeHorribleSettingsSnapshot(storage, snapshot) {
  const parsed = parseHorribleSettingsSnapshot(snapshot);
  if (!storage || !parsed) return;
  try {
    storage.setItem(STORAGE_KEYS.horribleSettings, JSON.stringify(parsed));
  } catch {
    // Snapshot is a convenience; disable still restores in-memory values.
  }
}

/** @param {Pick<Storage, "removeItem"> | null | undefined} storage */
export function clearHorribleSettingsSnapshot(storage) {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.horribleSettings);
  } catch {
    // Ignore storage failures.
  }
}

export function openAppStorage(globalObject) {
  try {
    return globalObject.localStorage;
  } catch {
    return null;
  }
}
