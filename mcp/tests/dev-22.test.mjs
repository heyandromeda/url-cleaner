import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  TOOLS,
  handle,
  defaultAllowedHostHeaders,
  MAX_URL_LEN,
  resolveInputError
} from "../server.mjs";
import { InputError as EngineInputError } from "../../cleaner.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRACKED = "https://example.com/?utm_source=x";

function summaryText(result) {
  assert.equal(result.content?.length, 1);
  return result.content[0].text;
}

test("clean_urls_batch caps each item at MAX_URL_LEN (DEV-22 F1)", () => {
  const long = `https://example.com/${"a".repeat(9000)}`;
  const out = TOOLS.clean_urls_batch.run({ urls: [long, TRACKED] });
  assert.equal(out.results[0].ok, false);
  assert.match(out.results[0].error, new RegExp(String(MAX_URL_LEN)));
  assert.equal(out.results[1].ok, true);
  assert.equal(out.results[1].cleaned, "https://example.com/");
  assert.equal(out.okCount, 1);
  assert.equal(out.count, 2);
});

test("tools/call inherited names are unknown tools (DEV-22 F2)", () => {
  for (const name of ["__proto__", "constructor", "toString"]) {
    const res = handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: {} }
    });
    assert.equal(res.error?.code, -32602, name);
    assert.match(res.error?.message ?? "", /Unknown tool/, name);
    assert.equal(res.result, undefined, name);
  }
});

test("tools/call TypeError is not echoed (DEV-22 F3)", () => {
  const serverHref = pathToFileURL(path.join(ROOT, "server.mjs")).href;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", `
    import { handle, TOOLS } from ${JSON.stringify(serverHref)};
    TOOLS.clean_url.run = () => { throw new TypeError("internal detail"); };
    const res = handle({
      jsonrpc: "2.0",
      id: 99,
      method: "tools/call",
      params: { name: "clean_url", arguments: { url: "https://example.com/" } }
    });
    const text = res.result?.content?.[0]?.text ?? "";
    if (!res.result?.isError) { console.error("expected isError"); process.exit(1); }
    if (!text.includes("Internal error while running the URL Cleaner engine.")) { console.error(text); process.exit(1); }
    if (text.includes("internal detail")) { console.error("leaked: " + text); process.exit(1); }
  `], { encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr || child.stdout);
});

test("tools/call still echoes InputError validation messages (DEV-22 F3)", () => {
  const res = handle({
    jsonrpc: "2.0",
    id: 100,
    method: "tools/call",
    params: { name: "clean_url", arguments: { url: "ht!tp:/bad" } }
  });
  assert.equal(res.result.isError, true);
  assert.match(summaryText(res.result), /valid URL/);
  assert.doesNotMatch(summaryText(res.result), /Internal error/);
});

test("HOST=0.0.0.0 defaults include loopback Host names (DEV-22 F6)", () => {
  const allowed = defaultAllowedHostHeaders("0.0.0.0", 8787);
  for (const host of [
    "0.0.0.0:8787",
    "0.0.0.0",
    "127.0.0.1:8787",
    "localhost:8787",
    "[::1]:8787",
    "127.0.0.1",
    "localhost",
    "[::1]"
  ]) {
    assert.equal(allowed.has(host), true, host);
  }

  const loopbackOnly = defaultAllowedHostHeaders("127.0.0.1", 8787);
  assert.equal(loopbackOnly.has("127.0.0.1:8787"), true);
  assert.equal(loopbackOnly.has("0.0.0.0:8787"), false);
});

function postMcpWithHost(port, body, { token, host } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: {
          host,
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {})
        }
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve({ status: res.statusCode }));
      }
    );
    req.on("error", reject);
    req.end(JSON.stringify(body));
  });
}

test("http: HOST=0.0.0.0 accepts loopback Host without MCP_ALLOWED_HOSTS (DEV-22 F6)", async () => {
  const token = randomBytes(32).toString("hex");
  const port = 21000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ["server.mjs", "--http"], {
    cwd: ROOT,
    env: { ...process.env, MCP_AUTH_TOKEN: token, PORT: String(port), HOST: "0.0.0.0" },
    stdio: ["ignore", "ignore", "pipe"]
  });
  await new Promise((resolve) => child.stderr.once("data", resolve));
  try {
    const ping = { jsonrpc: "2.0", id: 1, method: "ping" };
    assert.equal(
      (await postMcpWithHost(port, ping, { token, host: `localhost:${port}` })).status,
      200
    );
    assert.equal(
      (await postMcpWithHost(port, ping, { token, host: `127.0.0.1:${port}` })).status,
      200
    );
    assert.equal(
      (await postMcpWithHost(port, ping, { token, host: "evil.example" })).status,
      403
    );
  } finally {
    child.kill();
  }
});

test("resolveInputError falls back when the engine omits InputError (DEV-22 N1)", () => {
  const Fallback = resolveInputError({});
  const err = new Fallback("missing url");
  assert.equal(err.message, "missing url");
  assert.ok(err instanceof Error);
  assert.equal(resolveInputError({ InputError: EngineInputError }), EngineInputError);
});

test("legacy ENGINE_DIR without InputError still validates (DEV-22 N1)", () => {
  const fixture = path.join(ROOT, "tests/fixtures/legacy-engine");
  const serverHref = pathToFileURL(path.join(ROOT, "server.mjs")).href;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", `
    const { handle } = await import(${JSON.stringify(serverHref)});
    const res = handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "clean_url", arguments: {} }
    });
    const text = res.result?.content?.[0]?.text ?? "";
    if (res.result?.isError !== true) { console.error(JSON.stringify(res)); process.exit(1); }
    if (!text.includes("Missing required argument")) { console.error(text); process.exit(1); }
  `], {
    cwd: ROOT,
    env: { ...process.env, ENGINE_DIR: fixture },
    encoding: "utf8"
  });
  assert.equal(child.status, 0, child.stderr || child.stdout);
});

test("http-smoke.sh uses mktemp and cleans up (DEV-22 F8)", () => {
  const sh = readFileSync(path.join(ROOT, "scripts/http-smoke.sh"), "utf8");
  assert.match(sh, /mktemp -d/);
  assert.match(sh, /trap\s+\w+\s+EXIT/);
  assert.doesNotMatch(sh, /\/tmp\/ucmcp/);
});
