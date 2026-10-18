// node --test tests/  — exercises the MCP server over stdio and HTTP against the repo engine. No network beyond 127.0.0.1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as engine from "../../cleaner.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(ROOT, "..");

function engineSha() {
  if (process.env.ENGINE_SHA) return process.env.ENGINE_SHA;
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const SHA = engineSha();
const TRACKED = "https://example.com/p?utm_source=x&utm_medium=y&id=5&fbclid=abc";

function stdioSession() {
  const p = spawn(process.execPath, ["server.mjs", "--stdio"], { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  let buf = ""; const waiters = new Map();
  p.stdout.on("data", (c) => { buf += c; let i; while ((i = buf.indexOf("\n")) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); waiters.get(m.id)?.(m); } });
  const rpc = (id, method, params) => new Promise((r) => { waiters.set(id, r); p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  return { p, rpc, note: (method) => p.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n") };
}

test("stdio: handshake, list, clean_url matches engine.cleanUrl exactly", async () => {
  const s = stdioSession();
  const init = await s.rpc(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.equal(init.result.serverInfo.name, "url-cleaner");
  s.note("notifications/initialized");
  const list = await s.rpc(2, "tools/list");
  assert.deepEqual(list.result.tools.map((t) => t.name).sort(), ["clean_url", "clean_urls_batch", "explain_changes", "get_cleaner_capabilities", "inspect_url"]);
  const r = (await s.rpc(3, "tools/call", { name: "clean_url", arguments: { url: TRACKED } })).result;
  const direct = engine.cleanUrl(TRACKED);
  assert.equal(r.structuredContent.cleaned, direct.url);
  assert.deepEqual(r.structuredContent.removedParams, direct.removedParameters);
  assert.equal(r.structuredContent.engineInvoked.sha, SHA);
  assert.match(r.content[0].text, /^Cleaned: /);
  assert.deepEqual(JSON.parse(r.content[1].text.replace(/^[^\n]*\n/, "")), r.structuredContent);
  const bad = (await s.rpc(4, "tools/call", { name: "clean_url", arguments: { url: "ht!tp:/bad" } })).result;
  assert.equal(bad.isError, true);
  const missing = (await s.rpc(5, "tools/call", { name: "clean_url", arguments: {} })).result;
  assert.equal(missing.isError, true);
  s.p.stdin.end();
});

test("http: 401 without token, works with token, batch limit enforced", async () => {
  const token = randomBytes(32).toString("hex"); const port = 18000 + Math.floor(Math.random() * 1000);
  const p = spawn(process.execPath, ["server.mjs", "--http"], { cwd: ROOT, env: { ...process.env, MCP_AUTH_TOKEN: token, PORT: String(port), HOST: "127.0.0.1" }, stdio: ["ignore", "ignore", "pipe"] });
  await new Promise((r) => p.stderr.once("data", r));
  const url = `http://127.0.0.1:${port}/mcp`;
  const post = (body, auth = token) => fetch(url, { method: "POST", headers: { "content-type": "application/json", ...(auth ? { authorization: `Bearer ${auth}` } : {}) }, body: JSON.stringify(body) });
  try {
    assert.equal((await post({ jsonrpc: "2.0", id: 1, method: "ping" }, null)).status, 401);
    assert.equal((await post({ jsonrpc: "2.0", id: 1, method: "ping" }, "wrong")).status, 401);
    assert.equal((await post({ jsonrpc: "2.0", method: "notifications/initialized" })).status, 202);
    const batch = await (await post({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "clean_urls_batch", arguments: { urls: [TRACKED, "ht!tp:/bad", "https://youtu.be/a?si=1"] } } })).json();
    assert.equal(batch.result.structuredContent.okCount, 2);
    const tooMany = await (await post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "clean_urls_batch", arguments: { urls: Array(101).fill(TRACKED) } } })).json();
    assert.equal(tooMany.result.isError, true);
    const caps = await (await post({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_cleaner_capabilities", arguments: {} } })).json();
    assert.equal(caps.result.structuredContent.engine.sha, SHA);
  } finally { p.kill(); }
});

test("loads the repo engine modules from ENGINE_DIR=..", () => {
  assert.equal(typeof engine.cleanUrl, "function");
  assert.equal(typeof engine.inspectUrl, "function");
});
