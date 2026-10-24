import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const USES = /^\s*-?\s*uses:\s*(\S+)/gm;

test("CI pin scanner matches uses with or without a list dash (DEV-22 F5)", () => {
  const sample = [
    "uses: actions/checkout@0123456789abcdef0123456789abcdef01234567",
    "      - uses: actions/setup-node@89abcdef0123456789abcdef0123456789abcdef",
    "  uses: actions/cache@not-a-sha"
  ].join("\n");
  const uses = [...sample.matchAll(USES)].map((match) => match[1]);
  assert.deepEqual(uses, [
    "actions/checkout@0123456789abcdef0123456789abcdef01234567",
    "actions/setup-node@89abcdef0123456789abcdef0123456789abcdef",
    "actions/cache@not-a-sha"
  ]);
});

test("CI actions are pinned to full commit SHAs (DEV-22 F5)", () => {
  const dir = join(root, ".github/workflows");
  const files = readdirSync(dir).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
  assert.ok(files.length >= 1, "expected at least one workflow file");
  const uses = [];
  for (const name of files) {
    const yml = readFileSync(join(dir, name), "utf8");
    uses.push(...[...yml.matchAll(USES)].map((match) => match[1]));
  }
  assert.ok(uses.length >= 3, "expected checkout, setup-node, and cache");
  for (const spec of uses) {
    const at = spec.lastIndexOf("@");
    assert.ok(at > 0, spec);
    const pin = spec.slice(at + 1);
    assert.match(pin, /^[0-9a-f]{40}$/i, spec);
  }
});
