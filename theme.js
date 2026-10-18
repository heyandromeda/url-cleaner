import { STORAGE_KEYS, openAppStorage, readThemePreference, writeThemePreference } from "./storage.js";

export const THEME_STORAGE_KEY = STORAGE_KEYS.theme;

export const THEME_COLORS = {
  light: "#ffffff",
  dark: "#141414"
};

/** @returns {"light" | "dark" | null} */
export function readStoredThemePreference(storage) {
  return readThemePreference(storage);
}

/** @param {"light" | "dark" | null} preference */
export function resolveTheme(preference, systemPrefersDark) {
  if (preference === "light" || preference === "dark") return preference;
  return systemPrefersDark ? "dark" : "light";
}

export function openThemeStorage(globalObject) {
  return openAppStorage(globalObject);
}

export function resolveActiveTheme(globalObject, systemPrefersDark) {
  const storage = openThemeStorage(globalObject);
  const preference = storage ? readStoredThemePreference(storage) : null;
  return resolveTheme(preference, systemPrefersDark);
}

/** @param {"light" | "dark"} theme */
export function themeColorFor(theme) {
  return THEME_COLORS[theme];
}

/** @param {"light" | "dark"} theme */
export function nextThemeAfterToggle(currentTheme) {
  return currentTheme === "dark" ? "light" : "dark";
}

/** @param {"light" | "dark"} theme */
export function saveThemePreference(storage, theme) {
  writeThemePreference(storage, theme);
}

/** @param {"light" | "dark"} appliedTheme */
export function toggleAppliedTheme(appliedTheme, storage) {
  const next = nextThemeAfterToggle(appliedTheme);
  saveThemePreference(storage, next);
  return next;
}
