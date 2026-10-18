import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("createIcon never passes a multi-token string to classList.add", () => {
  for (const file of ["icons.js", "dist/icons.js"]) {
    // dist/icons.js comes from npm run build (pretest runs it automatically).
    const source = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(
      source,
      /classList\.add\(className\)/,
      `${file} must split className before classList.add`
    );
    assert.match(
      source,
      /classList\.add\(\.\.\./,
      `${file} must spread class tokens into classList.add`
    );
  }
});
