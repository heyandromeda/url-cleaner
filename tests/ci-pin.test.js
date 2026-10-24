import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("CI actions are pinned to full commit SHAs (DEV-22 F5)", () => {
  const yml = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
  const uses = [...yml.matchAll(/^\s*- uses:\s+(\S+)/gm)].map((match) => match[1]);
  assert.ok(uses.length >= 3, "expected checkout, setup-node, and cache");
  for (const spec of uses) {
    const at = spec.lastIndexOf("@");
    assert.ok(at > 0, spec);
    const pin = spec.slice(at + 1);
    assert.match(pin, /^[0-9a-f]{40}$/i, spec);
  }
  assert.match(yml, /# v4/);
});
