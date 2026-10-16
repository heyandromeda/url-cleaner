export const THEME_STORAGE_KEY = "url-cleaner.theme";

export const THEME_COLORS = {
  light: "#ffffff",
  dark: "#141414"
};

/** @returns {"light" | "dark" | null} */
export function readStoredThemePreference(storage) {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
    return null;
  } catch {
    return null;
  }
}

/** @param {"light" | "dark" | null} preference */
export function resolveTheme(preference, systemPrefersDark) {
  if (preference === "light" || preference === "dark") return preference;
  return systemPrefersDark ? "dark" : "light";
}

export function openThemeStorage(globalObject) {
  try {
    return globalObject.localStorage;
  } catch {
    return null;
  }
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
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still applies for this session if storage is unavailable.
  }
}

/** @param {"light" | "dark"} appliedTheme */
export function toggleAppliedTheme(appliedTheme, storage) {
  const next = nextThemeAfterToggle(appliedTheme);
  saveThemePreference(storage, next);
  return next;
}
