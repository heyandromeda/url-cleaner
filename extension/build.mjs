import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ENGINE_FILES = ["cleaner.js", "explanations.js", "tracker-profiles.js"];

export function committedVendorPath(root, name) {
  return join(root, "extension", "vendor", name);
}

/** @returns {string[]} vendor file names that differ from the repo engine copies */
export function findExtensionVendorDrift(root, freshVendorDir) {
  const drifted = [];
  for (const name of ENGINE_FILES) {
    const committed = readFileSync(committedVendorPath(root, name), "utf8");
    const fresh = readFileSync(join(freshVendorDir, name), "utf8");
    if (committed !== fresh) drifted.push(name);
  }
  return drifted;
}

export function formatExtensionVendorDriftMessage(drifted) {
  const files = drifted.map((name) => `extension/vendor/${name}`).join(", ");
  return `Committed extension vendor is stale (${files}); run node extension/build.mjs and commit the updated copies.`;
}

export function extensionVendorDir(root = join(dirname(fileURLToPath(import.meta.url)), "..")) {
  return join(root, "extension", "vendor");
}

export function buildExtensionVendor(
  root = join(dirname(fileURLToPath(import.meta.url)), ".."),
  dest = extensionVendorDir(root)
) {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dest, { recursive: true });
  for (const name of ENGINE_FILES) {
    cpSync(join(root, name), join(dest, name));
  }
  return dest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildExtensionVendor();
}
