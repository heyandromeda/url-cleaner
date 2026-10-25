import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listHorribleFiles, listWebRootFiles } from "../scripts/build.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// pretest already ran `npm run build`. Rebuilding here deletes dist/ while
// other files import from it and flakes `npm test` under parallel workers.
const dist = join(root, "dist");

const rootWebFiles = listWebRootFiles(root);

const distFiles = readdirSync(dist, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

test("npm run build copies every root web asset into dist/ with no extras", () => {
  assert.deepEqual(distFiles, rootWebFiles);
});

for (const name of rootWebFiles) {
  test(`build output dist/${name} matches the root source`, () => {
    const distPath = join(dist, name);
    assert.ok(existsSync(distPath), `dist/${name} is missing; run npm run build`);
    assert.ok(
      readFileSync(join(root, name)).equals(readFileSync(distPath)),
      `dist/${name} differs from ${name}; run npm run build`
    );
  });
}

for (const name of listHorribleFiles(root)) {
  test(`build output dist/${name} matches the source`, () => {
    const distPath = join(dist, name);
    assert.ok(existsSync(distPath), `dist/${name} is missing; run npm run build`);
    assert.ok(
      readFileSync(join(root, name)).equals(readFileSync(distPath)),
      `dist/${name} differs from ${name}; run npm run build`
    );
  });
}
