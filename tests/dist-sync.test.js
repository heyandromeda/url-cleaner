import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

// Vercel serves dist/, while the tests and local development use the root copies.
const WEB_EXTENSIONS = new Set([".js", ".html", ".css", ".webmanifest", ".png", ".ico"]);

const rootWebFiles = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile() && WEB_EXTENSIONS.has(extname(entry.name)))
  .map((entry) => entry.name)
  .sort();

const distFiles = readdirSync(dist, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

test("every root web file has a dist copy and dist has nothing extra", () => {
  assert.deepEqual(distFiles, rootWebFiles);
});

for (const name of rootWebFiles) {
  test(`dist/${name} is byte-for-byte identical to the root copy`, () => {
    const distPath = join(dist, name);
    assert.ok(existsSync(distPath), `dist/${name} is missing; copy ${name} into dist/`);
    assert.ok(
      readFileSync(join(root, name)).equals(readFileSync(distPath)),
      `dist/${name} differs from ${name}; copy ${name} into dist/`
    );
  });
}
