export function cleanUrl() {
  throw new Error("legacy engine cleanUrl should not run in this fixture");
}
export function cleanBatch() {
  return [];
}
export function cleanedUrlsFromBatch() {
  return [];
}
export function inspectUrl() {
  return {};
}
export function trackingFingerprint() {
  return {};
}
export function fingerprintRemovedKeptDetail() {
  return null;
}
export function isOpaqueShortener() {
  return false;
}
export function categorizeParameter() {
  return "unknown";
}
export const TRACKING_PARAMETERS = new Set();
export const TRACKING_PARAMETER_PREFIXES = [];
export const HOST_TRACKING_PARAMETERS = new Map();
export const AGGRESSIVE_PARAMETERS = new Set();
export const OPAQUE_SHORTENER_HOSTS = new Set();
export const MAX_UNWRAP_DEPTH = 5;
