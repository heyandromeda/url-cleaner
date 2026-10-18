import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function summaryText(result) {
  assert.equal(result.content?.length, 1);
  assert.equal(result.structuredContent, undefined);
  return result.content[0].text;
}

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
  const body = Buffer.concat(chunks);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-length": String(body.length),
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
    if (chunks.length <= 1) {
      req.end(body);
      return;
    }
    req.write(chunks[0]);
    setImmediate(() => {
      for (const chunk of chunks.slice(1)) req.write(chunk);
      req.end();
    });
  });
}

test("http: UTF-8 body split across chunks decodes correctly (DEV-17)", async () => {
  await withHttpServer(async ({ token, port }) => {
    const raw = Buffer.concat([
      Buffer.from('{"jsonrpc":"2.0","id":17,"method":"tools/call","params":{"name":"clean_url","arguments":{"url":"https://example.com/?q=caf', "utf8"),
      Buffer.from([0xc3, 0xa9]),
      Buffer.from('&utm_source=x"}}}', "utf8")
    ]);
    const splitAt = raw.indexOf(0xc3);
    assert.ok(splitAt > 0);
    const res = await postChunks(port, token, [raw.subarray(0, splitAt + 1), raw.subarray(splitAt + 1)]);
    assert.equal(res.status, 200, res.body);
    const json = JSON.parse(res.body);
    assert.equal(json.error, undefined, res.body);
    const text = summaryText(json.result);
    assert.match(text, /^Cleaned: https:\/\/example\.com\/\?q=caf(?:é|%C3%A9)/);
    assert.match(text, /Removed utm_source/);
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
    assert.equal(json.error, undefined, JSON.stringify(json));
    const text = summaryText(json.result);
    assert.match(text, /^Cleaned 2 of 3 URLs:/);
    assert.match(text, /couldn't clean item 2 \(empty\): Every item must be a non-empty single-line string\./);
    assert.match(text, /example\.com/);
    assert.match(text, /example\.org/);
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
