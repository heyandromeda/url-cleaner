import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeViewUrl, cleanUrl, isOriginalQuerySegmentRemoved, querySegments } from "../dist/cleaner.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function markedSegmentNames(input, result) {
  const url = new URL(beforeViewUrl(input, result));
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

test("Before view uses the unwrapped destination when duplicate indices come from it", () => {
  const destination = "https://example.com/page?tag=a&tag=a";
  const wrapper = `https://www.google.com/url?q=${encodeURIComponent(destination)}&safe=active`;
  const result = cleanUrl(wrapper, { removeDuplicateParameters: true });

  assert.deepEqual(result.removedDuplicateIndices, [1]);
  assert.equal(beforeViewUrl(wrapper, result), destination);
  assert.deepEqual(markedSegmentNames(wrapper, result), [null, "tag"]);
});

test("app.js highlights the before-view URL resolved from the clean result", () => {
  const app = readFileSync(join(root, "app.js"), "utf8");
  assert.match(app, /renderOriginalUrl\(beforeViewUrl\(originalValue, result\), result\.removedParameters, result\.removedDuplicateIndices\)/);
  assert.match(app, /beforeViewUrl/);
});
