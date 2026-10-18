import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRACKED = "https://example.com/?utm_source=x";

async function withHttpServer(run) {
  const token = randomBytes(32).toString("hex");
  const port = 19000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ["server.mjs", "--http"], {
    cwd: ROOT,
    env: { ...process.env, MCP_AUTH_TOKEN: token, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "ignore", "pipe"]
  });
  await new Promise((resolve) => child.stderr.once("data", resolve));
  const base = `http://127.0.0.1:${port}`;
  try {
    await run({ token, base, port });
  } finally {
    child.kill();
  }
}

function postMcp(base, body, { token, origin } = {}) {
  return fetch(`${base}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(origin !== undefined ? { Origin: origin } : {})
    },
    body: JSON.stringify(body)
  });
}

test("http: rejects disallowed Origin before auth (DEV-16)", async () => {
  await withHttpServer(async ({ token, base }) => {
    const evil = await postMcp(
      base,
      { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "clean_url", arguments: { url: TRACKED } } },
      { token, origin: "http://evil.example" }
    );
    assert.equal(evil.status, 403);
    const evilBody = await evil.json();
    assert.equal(evilBody.error?.code, -32003);
    assert.match(evilBody.error?.message ?? "", /Origin/i);
    assert.equal(evilBody.result, undefined);

    const evilNoAuth = await postMcp(
      base,
      { jsonrpc: "2.0", id: 2, method: "ping" },
      { origin: "http://evil.example" }
    );
    assert.equal(evilNoAuth.status, 403);
    assert.notEqual(evilNoAuth.status, 401);

    const allowed = await postMcp(
      base,
      { jsonrpc: "2.0", id: 3, method: "tools/list" },
      { token, origin: "http://localhost:5173" }
    );
    assert.equal(allowed.status, 200);
    const list = await allowed.json();
    assert.ok(Array.isArray(list.result?.tools));

    const noOrigin = await postMcp(base, { jsonrpc: "2.0", id: 4, method: "tools/list" }, { token });
    assert.equal(noOrigin.status, 200);
    const noOriginBody = await noOrigin.json();
    assert.ok(Array.isArray(noOriginBody.result?.tools));
  });
});

test("http: /healthz ignores Origin checks", async () => {
  await withHttpServer(async ({ base }) => {
    const res = await fetch(`${base}/healthz`, { headers: { Origin: "http://evil.example" } });
    assert.equal(res.status, 200);
  });
});
