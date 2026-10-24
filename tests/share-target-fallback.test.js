import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import middleware, { isShareTargetPost, shareTargetFallbackResponse } from "../middleware.js";
import { listWebRootFiles } from "../scripts/build.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function wrapBodyReaders(request) {
  let read = false;
  for (const name of ["text", "json", "formData", "arrayBuffer", "blob"]) {
    const original = request[name].bind(request);
    request[name] = (...args) => {
      read = true;
      return original(...args);
    };
  }
  return () => read;
}

test("share-target fallback 303s POST / without reading the body (DEV-22 F4)", async () => {
  const request = new Request("http://127.0.0.1/", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "url=https://secret.example/reset?token=abc"
  });
  const bodyWasRead = wrapBodyReaders(request);
  const response = await middleware(request);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("Location"), "/");
  assert.equal(bodyWasRead(), false);
  assert.equal(isShareTargetPost("POST", "/index.html"), true);
  assert.equal(isShareTargetPost("GET", "/"), false);
  assert.equal(shareTargetFallbackResponse().status, 303);
});

test("share-target fallback lets GET / through (DEV-22 F4)", async () => {
  const response = await middleware(new Request("http://127.0.0.1/", { method: "GET" }));
  assert.equal(response, undefined);
});

test("local static server 303s share POST without serving the body (DEV-22 F4)", async () => {
  const server = http.createServer((request, response) => {
    const pathname = (request.url || "/").split("?")[0];
    if (isShareTargetPost(request.method, pathname)) {
      request.resume();
      response.writeHead(303, { Location: "/" });
      response.end();
      return;
    }
    response.writeHead(200);
    response.end("should-not-serve-share-post");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "url=https://secret.example/reset?token=abc",
      redirect: "manual"
    });
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "/");
    const body = await res.text();
    assert.doesNotMatch(body, /should-not-serve-share-post|secret\.example/);
  } finally {
    server.close();
  }
});

test("middleware.js is not copied into dist (DEV-22 F4)", () => {
  assert.equal(existsSync(join(root, "middleware.js")), true);
  assert.equal(listWebRootFiles(root).includes("middleware.js"), false);
  const source = readFileSync(join(root, "middleware.js"), "utf8");
  assert.doesNotMatch(source, /\.text\s*\(|\.json\s*\(|\.formData\s*\(/);
});
