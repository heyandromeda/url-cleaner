import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ENGINE_FILES = ["cleaner.js", "explanations.js", "tracker-profiles.js"];

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
