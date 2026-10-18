import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanUrl, isOriginalQuerySegmentRemoved, querySegments } from "../dist/cleaner.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function markedSegmentNames(input, result) {
  const url = new URL(input);
  return querySegments(url.search).map(({ name }, index) => (
    isOriginalQuerySegmentRemoved(name, index, result.removedParameters, result.removedDuplicateIndices)
      ? name
      : null
  ));
}

test("Before view marks only removed identical duplicate occurrences", () => {
  const input = "https://example.com/?tag=a&tag=a";
  const result = cleanUrl(input, { removeDuplicateParameters: true });

  assert.deepEqual(markedSegmentNames(input, result), [null, "tag"]);
});

test("Before view keeps differing values and the first identical copy unmarked", () => {
  const input = "https://example.com/?tag=a&tag=b&tag=a";
  const result = cleanUrl(input, { removeDuplicateParameters: true });

  assert.deepEqual(markedSegmentNames(input, result), [null, null, "tag"]);
});

test("app.js passes per-occurrence duplicate indices into the original URL renderer", () => {
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(app, /renderOriginalUrl\(originalValue, result\.removedParameters, result\.removedDuplicateIndices\)/);
  assert.match(app, /isOriginalQuerySegmentRemoved/);
});
