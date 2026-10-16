import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function playwrightArtifactsDir() {
  const configured = process.env.URL_CLEANER_PLAYWRIGHT_ARTIFACTS?.trim();
  const dir = configured || join(root, ".playwright-artifacts");
  mkdirSync(dir, { recursive: true });
  return dir;
}
