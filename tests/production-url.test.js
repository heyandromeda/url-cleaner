import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION_URL = "https://andromeda-url-cleaner.vercel.app";
const NIGHTLY_URL = "https://andromeda-url-cleaner-nightly.vercel.app";
const SKIP_DIRS = new Set([".git", "node_modules"]);
const TEXT_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".json",
  ".md",
  ".css",
  ".txt",
  ".yml",
  ".yaml",
  ".toml",
]);

const OUTDATED_PRODUCTION_HOSTS = [
  "url-cleaner-chi.vercel.app",
  "andromeda-url.vercel.app",
  "url-cleaner.heyandromeda.chatgpt.site",
  "url-cleaner-nightly.heyandromeda.chatgpt.site",
];

function walkFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkFiles(full));
      continue;
    }
    const ext = entry.includes(".") ? entry.slice(entry.lastIndexOf(".")) : "";
    if (TEXT_EXTENSIONS.has(ext)) {
      files.push(full);
    }
  }
  return files;
}

test("HTML canonical and Open Graph tags point at the production URL", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  const distHtml = readFileSync(join(root, "dist/index.html"), "utf8");

  assert.equal(html, distHtml);
  assert.match(html, new RegExp(`<link rel="canonical" href="${PRODUCTION_URL}"`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${PRODUCTION_URL}"`));
  assert.doesNotMatch(html, /url-cleaner-chi\.vercel\.app/);
  assert.doesNotMatch(html, /andromeda-url\.vercel\.app/);
  assert.doesNotMatch(html, /chatgpt\.site/);
});

test("package.json homepage is the production URL", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.homepage, PRODUCTION_URL);
});

test("README uses the production URL and keeps the nightly Vercel preview", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, new RegExp(PRODUCTION_URL.replaceAll(".", "\\.")));
  assert.match(readme, new RegExp(NIGHTLY_URL.replaceAll(".", "\\.")));
  assert.doesNotMatch(readme, /chatgpt\.site/);
  assert.doesNotMatch(readme, /url-cleaner-chi\.vercel\.app/);
  assert.doesNotMatch(readme, /andromeda-url\.vercel\.app/);
});

test("repo text files do not mention outdated production hosts", () => {
  const thisFile = fileURLToPath(import.meta.url);
  const hits = [];
  for (const file of walkFiles(root)) {
    if (file === thisFile) {
      continue;
    }
    const text = readFileSync(file, "utf8");
    for (const host of OUTDATED_PRODUCTION_HOSTS) {
      if (text.includes(host)) {
        hits.push(`${relative(root, file)}: ${host}`);
      }
    }
  }

  assert.deepEqual(hits, []);
});
