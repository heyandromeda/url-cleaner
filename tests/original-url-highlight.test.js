import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cleanUrl,
  isOriginalQuerySegmentRemoved,
  querySegments,
  removedDuplicateIndicesForBeforeView
} from "../dist/cleaner.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function markedSegmentNames(input, result) {
  const url = new URL(input);
  const duplicateIndices = removedDuplicateIndicesForBeforeView(result);
  return querySegments(url.search).map(({ name }, index) => (
    isOriginalQuerySegmentRemoved(name, index, result.removedParameters, duplicateIndices)
      ? name
      : null
  ));
}

test("Before view marks only removed identical duplicate occurrences", () => {
  const input = "https://example.com/?tag=a&tag=a";
  const result = cleanUrl(input, { removeDuplicateParameters: true });

  assert.deepEqual(markedSegmentNames(input, result), [null, "tag"]);
});

test("Before view does not apply destination duplicate indices to a wrapper URL", () => {
  const destination = "https://example.com/?tag=a&tag=a";
  const wrapper = `https://www.google.com/url?q=${encodeURIComponent(destination)}&safe=active`;
  const result = cleanUrl(wrapper, { removeDuplicateParameters: true });

  assert.deepEqual(result.removedDuplicateIndices, [1]);
  assert.deepEqual(result.unwrappedFrom, ["www.google.com"]);
  assert.deepEqual(removedDuplicateIndicesForBeforeView(result), []);
  assert.deepEqual(markedSegmentNames(wrapper, result), [null, null]);
});

test("Before view keeps differing values and the first identical copy unmarked", () => {
  const input = "https://example.com/?tag=a&tag=b&tag=a";
  const result = cleanUrl(input, { removeDuplicateParameters: true });

  assert.deepEqual(markedSegmentNames(input, result), [null, null, "tag"]);
});

test("app.js passes Before-safe duplicate indices into the original URL renderer", () => {
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(app, /removedDuplicateIndicesForBeforeView\(result\)/);
  assert.match(app, /isOriginalQuerySegmentRemoved/);
});
