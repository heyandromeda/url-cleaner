import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function withHttpServer(run) {
  const token = randomBytes(32).toString("hex");
  const port = 20000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ["server.mjs", "--http"], {
    cwd: ROOT,
    env: { ...process.env, MCP_AUTH_TOKEN: token, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "ignore", "pipe"]
  });
  await new Promise((resolve) => child.stderr.once("data", resolve));
  try {
    await run({ token, port });
  } finally {
    child.kill();
  }
}

function postChunks(port, token, chunks) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        }
      },
      (res) => {
        const bufs = [];
        res.on("data", (c) => bufs.push(c));
        res.on("end", () => resolve({
          status: res.statusCode,
          body: Buffer.concat(bufs).toString("utf8")
        }));
      }
    );
    req.on("error", reject);
    for (const chunk of chunks) req.write(chunk);
    req.end();
  });
}

test("http: UTF-8 body split across chunks decodes correctly (DEV-17)", async () => {
  await withHttpServer(async ({ token, port }) => {
    const url = "https://example.com/?note=café";
    const raw = Buffer.from(
      `{"jsonrpc":"2.0","id":17,"method":"tools/call","params":{"name":"clean_url","arguments":{"url":"${url}"}}}`,
      "utf8"
    );
    const eBytes = Buffer.from("é", "utf8");
    const idx = raw.indexOf(eBytes);
    assert.ok(idx >= 0, "expected literal UTF-8 in JSON body");
    const res = await postChunks(port, token, [raw.subarray(0, idx + 1), raw.subarray(idx + 1)]);
    assert.equal(res.status, 200, res.body);
    const json = JSON.parse(res.body);
    assert.ok(json.result?.structuredContent, () => res.body);
    assert.equal(json.result.structuredContent.original, url);
    assert.ok(json.result.structuredContent.cleaned.startsWith("https://example.com/?note=caf"));
  });
});

test("http: clean_urls_batch reports empty item without failing others (DEV-18)", async () => {
  await withHttpServer(async ({ token, port }) => {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 18,
        method: "tools/call",
        params: {
          name: "clean_urls_batch",
          arguments: {
            urls: [
              "https://example.com/?utm_source=x",
              "",
              "https://example.org/?gclid=1"
            ]
          }
        }
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.result?.structuredContent, () => JSON.stringify(json));
    const batch = json.result.structuredContent;
    assert.equal(batch.okCount, 2);
    assert.equal(batch.count, 3);
    assert.equal(batch.results.filter((r) => r.ok).length, 2);
    const empty = batch.results.find((r) => r.index === 1);
    assert.equal(empty.ok, false);
    assert.match(empty.error, /non-empty single-line string/i);
  });
});

test("http: oversized POST returns 413 JSON error (DEV-19)", async () => {
  await withHttpServer(async ({ token, port }) => {
    const padding = "x".repeat(1_000_050);
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: `{"jsonrpc":"2.0","id":19,"method":"ping","pad":"${padding}"}`
    });
    assert.equal(res.status, 413);
    const json = await res.json();
    assert.equal(json.error?.code, -32000);
    assert.match(json.error?.message ?? "", /too large/i);
  });
});
