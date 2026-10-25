import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildExtensionVendor } from "../extension/build.mjs";

const WEB_EXTENSIONS = new Set([".js", ".html", ".css", ".webmanifest", ".png", ".ico"]);
const SKIP_WEB_FILES = new Set(["middleware.js"]);

export function listWebRootFiles(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => (
      entry.isFile()
      && WEB_EXTENSIONS.has(extname(entry.name))
      && !SKIP_WEB_FILES.has(entry.name)
    ))
    .map((entry) => entry.name)
    .sort();
}

export function buildDist(root = join(dirname(fileURLToPath(import.meta.url)), "..")) {
  const dist = join(root, "dist");
  if (existsSync(dist)) {
    rmSync(dist, { recursive: true, force: true });
  }
  mkdirSync(dist, { recursive: true });
  for (const name of listWebRootFiles(root)) {
    cpSync(join(root, name), join(dist, name));
  }
  return dist;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildDist();
  buildExtensionVendor();
}
