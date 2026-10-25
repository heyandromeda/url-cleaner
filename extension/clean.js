import { cleanUrl, InputError, isOpaqueShortener } from "./vendor/cleaner.js";
import { explainParameter } from "./vendor/explanations.js";

export const CLEANER_ORIGIN = "https://andromeda-url-cleaner.vercel.app";
export const MAX_URL_LENGTH = 8192;
export const NOTHING_TO_CLEAN = "Nothing to clean on this page.";
export const URL_TOO_LONG = "This URL is longer than 8192 characters.";
export const SHORTENER_WARNING =
  "Its destination cannot be inspected locally without following the redirect. The visible URL was cleaned, but the hidden destination was not opened or checked.";

const RESTRICTED_SCHEME = /^(about|chrome|chrome-extension|chrome-search|chrome-untrusted|devtools|edge|edge-extension|file|view-source|data|javascript|blob|ws|wss|ftp):/i;

function emptyResult(original, error) {
  return {
    original,
    cleaned: "",
    removedParams: [],
    error,
    warning: "",
    summary: "",
    handoffUrl: "",
    copy: false,
    openSite: false
  };
}

export function isRestrictedPageUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return true;
  try {
    const url = new URL(text);
    return url.protocol !== "http:" && url.protocol !== "https:";
  } catch {
    return RESTRICTED_SCHEME.test(text);
  }
}

export function handoffUrlFor(pageUrl) {
  return `${CLEANER_ORIGIN}/#url=${encodeURIComponent(pageUrl)}`;
}

function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export function describeRemoved(removedParams) {
  if (!removedParams.length) return "Nothing was removed.";
  const unique = [...new Set(removedParams)];
  if (unique.length === 1) {
    const explanation = explainParameter(unique[0]);
    return explanation ? `Removed ${unique[0]}. ${explanation}` : `Removed ${unique[0]}.`;
  }
  return `Removed ${formatList(unique)}.`;
}

export function cleanTabUrl(input) {
  const original = input == null ? "" : String(input);

  if (isRestrictedPageUrl(original)) {
    return emptyResult(original, NOTHING_TO_CLEAN);
  }

  if (original.length > MAX_URL_LENGTH) {
    return emptyResult(original, URL_TOO_LONG);
  }

  try {
    const result = cleanUrl(original);
    const removedParams = result.removedParameters;
    const warning = isOpaqueShortener(original) || isOpaqueShortener(result.url)
      ? SHORTENER_WARNING
      : "";
    return {
      original,
      cleaned: result.url,
      removedParams,
      error: "",
      warning,
      summary: describeRemoved(removedParams),
      handoffUrl: handoffUrlFor(original),
      copy: true,
      openSite: true
    };
  } catch (error) {
    const message = error instanceof InputError
      ? error.message
      : "This URL could not be cleaned.";
    return emptyResult(original, message);
  }
}
