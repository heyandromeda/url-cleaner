#!/usr/bin/env node
// URL Cleaner MCP server. Zero dependencies. Thin adapter over the real URL Cleaner engine:
// every result comes from engine functions; nothing here cleans URLs itself and nothing fetches them.
// Modes: `node server.mjs --stdio` (default if no --http) or `node server.mjs --http` (Streamable HTTP, JSON responses).
import http from "node:http";
import { execSync } from "node:child_process";
import { timingSafeEqual, createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_DIR = path.resolve(HERE, process.env.ENGINE_DIR || "..");
const engine = await import(pathToFileURL(path.join(ENGINE_DIR, "cleaner.js")).href);
const explain = await import(pathToFileURL(path.join(ENGINE_DIR, "explanations.js")).href);

function resolveEngineSha() {
  if (process.env.ENGINE_SHA) return process.env.ENGINE_SHA;
  try {
    return execSync("git rev-parse HEAD", { cwd: ENGINE_DIR, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}
const ENGINE_SHA = resolveEngineSha();

const SERVER_INFO = { name: "url-cleaner", version: "0.1.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_BATCH = 100;
const MAX_URL_LEN = 8192;
const MAX_HTTP_BODY_BYTES = 1_000_000;
const BATCH_ITEM_ERROR = "Every item must be a non-empty single-line string.";

const proof = (...fns) => ({ engineInvoked: { functions: fns, module: "url-cleaner/cleaner.js", sha: ENGINE_SHA } });
const queryNames = (href) => [...new URL(href).searchParams.keys()];

class InputError extends Error {}
function needUrl(args) {
  const url = args?.url;
  if (typeof url !== "string" || !url.trim()) throw new InputError("Missing required argument `url` (a string).");
  if (url.length > MAX_URL_LEN) throw new InputError(`URL is longer than ${MAX_URL_LEN} characters.`);
  return url;
}
function opts(args) {
  const o = args?.options || {};
  return { aggressive: o.aggressive === true, removeDuplicateParameters: o.removeDuplicateParameters === true };
}

function cleanedShape(input, r) {
  const keptDetail = engine.fingerprintRemovedKeptDetail(input, r.removedParameters, { aggressive: false });
  const warnings = [...r.inspection.weirdness];
  if (r.unwrapLimitReached) warnings.push(`Stopped unwrapping after ${engine.MAX_UNWRAP_DEPTH} redirect layers.`);
  if (keptDetail) warnings.push(`Tracking-related parameters kept: ${keptDetail.keptText}`);
  if (engine.isOpaqueShortener(input)) warnings.push("Opaque shortener host: the real destination is hidden and URL Cleaner does not follow links, so it cannot be cleaned further.");
  return {
    original: input,
    cleaned: r.url,
    changed: r.changed,
    removedParams: r.removedParameters,
    aggressiveRemovedParams: r.aggressiveRemovedParameters,
    duplicateParams: r.duplicateParameters,
    preservedParams: queryNames(r.url),
    unwrappedFrom: r.unwrappedFrom,
    explanations: Object.fromEntries(r.removedParameters.map((n) => [n, explain.explainParameter(n)])),
    fingerprint: r.fingerprint,
    warnings
  };
}

const TOOLS = {
  clean_url: {
    description: "Clean one URL with the real URL Cleaner engine (cleanUrl): unwraps known redirect wrappers, removes tracking parameters. Pure string transformation; the URL is never fetched.",
    inputSchema: { type: "object", properties: {
      url: { type: "string", description: "http(s) URL to clean" },
      options: { type: "object", properties: {
        aggressive: { type: "boolean", description: "Also remove affiliate/referral-style params (ref, source, partner...)" },
        removeDuplicateParameters: { type: "boolean", description: "Drop exact duplicate name=value pairs" } }, additionalProperties: false } },
      required: ["url"], additionalProperties: false },
    run(args) { const url = needUrl(args); return { ...cleanedShape(url, engine.cleanUrl(url, opts(args))), ...proof("cleanUrl", "fingerprintRemovedKeptDetail", "explainParameter") }; }
  },
  clean_urls_batch: {
    description: `Clean up to ${MAX_BATCH} URLs with the engine's own cleanBatch. Bad items are reported per item, not as a whole failure.`,
    inputSchema: { type: "object", properties: {
      urls: { type: "array", items: { type: "string" }, minItems: 1, maxItems: MAX_BATCH },
      options: { type: "object", properties: { aggressive: { type: "boolean" }, removeDuplicateParameters: { type: "boolean" } }, additionalProperties: false } },
      required: ["urls"], additionalProperties: false },
    run(args) {
      const urls = args?.urls;
      if (!Array.isArray(urls) || urls.length === 0) throw new InputError("Missing required argument `urls` (non-empty array of strings).");
      if (urls.length > MAX_BATCH) throw new InputError(`At most ${MAX_BATCH} URLs per batch.`);
      const results = new Array(urls.length);
      const validLines = [];
      for (let index = 0; index < urls.length; index += 1) {
        const u = urls[index];
        if (typeof u !== "string" || /[\r\n]/.test(u) || !u.trim()) {
          results[index] = { index, ok: false, original: String(u ?? ""), error: BATCH_ITEM_ERROR };
          continue;
        }
        validLines.push({ index, input: u.trim() });
      }
      let batchEntries = [];
      if (validLines.length > 0) {
        batchEntries = engine.cleanBatch(validLines.map((v) => v.input).join("\n"), opts(args));
        for (let i = 0; i < batchEntries.length; i += 1) {
          const e = batchEntries[i];
          const slot = validLines[i].index;
          results[slot] = e.ok
            ? { index: slot, ok: true, ...cleanedShape(e.input, e.result) }
            : { index: slot, ok: false, original: e.input, error: e.error };
        }
      }
      return {
        count: urls.length,
        okCount: results.filter((r) => r?.ok).length,
        cleanedUrls: engine.cleanedUrlsFromBatch(batchEntries),
        results: Array.from({ length: urls.length }, (_, i) => results[i]),
        ...proof("cleanBatch", "cleanedUrlsFromBatch")
      };
    }
  },
  inspect_url: {
    description: "X-ray a URL with the engine's inspectUrl: scheme/host/port/path/fragment, each parameter's category (tracking, affiliate/referral, redirect-related, functional, unknown) and decoded values, redirect layers, and weirdness flags. Does not modify or fetch it.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"], additionalProperties: false },
    run(args) {
      const url = needUrl(args);
      return { original: url, inspection: engine.inspectUrl(url), fingerprint: engine.trackingFingerprint(url),
        opaqueShortener: engine.isOpaqueShortener(url), ...proof("inspectUrl", "trackingFingerprint", "isOpaqueShortener") };
    }
  },
  explain_changes: {
    description: "Explain what URL Cleaner removed or preserved for a URL, using the engine's own parameter explanations and curated tracker profiles.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, options: { type: "object" } }, required: ["url"], additionalProperties: false },
    run(args) {
      const url = needUrl(args);
      const r = engine.cleanUrl(url, opts(args));
      const host = new URL(r.url).hostname;
      const removed = r.removedParameters.map((name) => {
        const p = explain.getTrackerProfile(name);
        return { name, category: engine.categorizeParameter(name, host), why: explain.explainParameter(name),
          aggressiveOnly: r.aggressiveRemovedParameters.includes(name),
          profile: p ? { what: p.what, safeToRemove: p.safeToRemove } : null };
      });
      const preserved = queryNames(r.url).map((name) => ({ name, category: engine.categorizeParameter(name, host),
        reason: !opts(args).aggressive && engine.AGGRESSIVE_PARAMETERS.has(name.toLowerCase())
          ? "Kept: aggressive mode is off (would be removed with options.aggressive=true)"
          : "Kept: not on URL Cleaner's tracking list for this host" }));
      const unwrapped = r.unwrappedFrom.map((h) => `Unwrapped redirect wrapper on ${h}`);
      const kept = engine.fingerprintRemovedKeptDetail(url, r.removedParameters, opts(args));
      return { original: url, cleaned: r.url, changed: r.changed, unwrapped, removed, preserved,
        duplicatesRemoved: r.duplicateParameters, keptTrackingDetail: kept?.detail ?? null,
        ...proof("cleanUrl", "categorizeParameter", "explainParameter", "getTrackerProfile", "fingerprintRemovedKeptDetail") };
    }
  },
  get_cleaner_capabilities: {
    description: "Report what the currently loaded URL Cleaner engine supports, derived from its exports and constants, plus the engine commit SHA.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run() {
      const has = (n) => typeof engine[n] === "function";
      return {
        engine: { sha: ENGINE_SHA, source: "https://github.com/heyandromeda/url-cleaner", exports: Object.keys(engine).sort() },
        features: {
          trackingParameterRemoval: has("cleanUrl"),
          trackingParameterCount: engine.TRACKING_PARAMETERS.size,
          trackingPrefixes: engine.TRACKING_PARAMETER_PREFIXES,
          hostScopedParameters: Object.fromEntries([...engine.HOST_TRACKING_PARAMETERS].map(([h, s]) => [h, [...s]])),
          aggressiveMode: { supported: has("cleanUrl"), extraParameters: [...engine.AGGRESSIVE_PARAMETERS] },
          duplicateParameterRemoval: has("cleanUrl"),
          redirectUnwrapping: { supported: true, maxDepth: engine.MAX_UNWRAP_DEPTH,
            wrappers: "google(/url, country domains), googleadservices, facebook l.php, l.instagram.com, outlook safelinks, youtube /redirect, linkedin safety/redir, href.li (per engine getWrapperInfo)" },
          inspection: has("inspectUrl"), weirdnessDetection: has("detectWeirdness"), trackingFingerprint: has("trackingFingerprint"),
          parameterCategorization: has("categorizeParameter"), batch: has("cleanBatch"),
          explanations: typeof explain.explainParameter === "function", trackerProfiles: Object.keys(explain.TRACKER_PROFILES).length,
          opaqueShortenerDetection: { supported: has("isOpaqueShortener"), hosts: [...engine.OPAQUE_SHORTENER_HOSTS] }
        },
        notSupported: [
          "Following/expanding links (shorteners stay as-is; URL Cleaner never fetches URLs)",
          "Non-http(s) schemes (engine rejects them)",
          "Custom per-call rule lists"
        ],
        ...proof("module exports introspection")
      };
    }
  }
};

// ---------- JSON-RPC ----------
const ok = (id, result) => ({ jsonrpc: "2.0", id, result });
const err = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const list = (a) => a.join(", ");
function cleanLine(r) {
  if (!r.changed) return `Already clean: ${r.cleaned} (nothing removed).`;
  const parts = [`Cleaned: ${r.cleaned}`];
  if (r.unwrappedFrom?.length) parts.push(`Unwrapped a redirect from ${list(r.unwrappedFrom)}.`);
  if (r.removedParams?.length) parts.push(`Removed ${list(r.removedParams.map((n) => `${n} (${r.explanations?.[n] || "tracking"})`))}.`);
  if (r.preservedParams?.length) parts.push(`Kept ${list(r.preservedParams)}.`);
  return parts.join("\n");
}
function summarize(name, o, isError) {
  if (isError) return `URL Cleaner couldn't process that: ${o.error}`;
  if (name === "clean_url") return cleanLine(o);
  if (name === "clean_urls_batch") return `Cleaned ${o.okCount} of ${o.count} URLs:\n` + o.results.map((r) => r.ok ? `- ${r.cleaned}${r.removedParams?.length ? ` (removed ${list(r.removedParams)})` : ""}` : `- couldn't clean ${r.original}: ${r.error}`).join("\n");
  if (name === "inspect_url") return `Tracking level: ${o.fingerprint?.label ?? "unknown"}.` + (o.opaqueShortener ? " This is a short link; URL Cleaner can't see where it goes without opening it, and it never does." : "");
  if (name === "explain_changes") return [`Cleaned: ${o.cleaned}`, ...o.unwrapped, ...o.removed.map((r) => `Removed ${r.name}: ${r.why}`), ...o.preserved.map((p) => `Kept ${p.name}: ${p.reason.replace(/^Kept: /, "")}`)].join("\n");
  if (name === "get_cleaner_capabilities") return `URL Cleaner engine ${String(o.engine.sha).slice(0, 7)}: removes ${o.features.trackingParameterCount} known tracking parameters, unwraps redirects up to ${o.features.redirectUnwrapping.maxDepth} layers, explains changes with ${o.features.trackerProfiles} tracker profiles. It never opens or expands links.`;
  return "Done.";
}
const toolResult = (obj, isError = false, name = "") =>
  ({ content: [{ type: "text", text: summarize(name, obj, isError) }], ...(isError ? { isError: true } : {}) });

function log(fields) { process.stderr.write(JSON.stringify({ t: new Date().toISOString(), ...fields }) + "\n"); } // never logs arguments

function handle(msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return err(msg?.id, -32600, "Invalid Request");
  const isNote = msg.id === undefined;
  const { method, params } = msg;
  if (method === "notifications/initialized" || method.startsWith("notifications/")) return null;
  if (isNote) return null;
  if (method === "initialize") {
    const v = PROTOCOL_VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0];
    return ok(msg.id, { protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO,
      instructions: "Official URL Cleaner tools. Use clean_url when asked to 'clean this using URL Cleaner'. Results come from the real engine (see engineInvoked). URLs are never fetched. Reply to the user with the tool's plain-language text as-is; don't add raw JSON." });
  }
  if (method === "ping") return ok(msg.id, {});
  if (method === "tools/list") return ok(msg.id, { tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema,
    annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true } })) });
  if (method === "tools/call") {
    const name = params?.name; const tool = TOOLS[name];
    if (!tool) return err(msg.id, -32602, `Unknown tool: ${String(name).slice(0, 64)}`);
    const t0 = performance.now(); let status = "ok";
    try { return ok(msg.id, toolResult(tool.run(params.arguments || {}), false, name)); }
    catch (e) {
      status = e instanceof InputError || e instanceof TypeError ? "input_error" : "error";
      const message = status === "error" ? "Internal error while running the URL Cleaner engine." : e.message;
      return ok(msg.id, toolResult({ error: message, tool: name, engine: { sha: ENGINE_SHA } }, true, name));
    } finally { log({ tool: name, ms: Math.round(performance.now() - t0), status }); }
  }
  return err(msg.id, -32601, `Method not found: ${method.slice(0, 64)}`);
}
function dispatch(payload) {
  if (Array.isArray(payload)) { const out = payload.map(handle).filter(Boolean); return out.length ? out : null; }
  return handle(payload);
}

// ---------- stdio ----------
function startStdio() {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buf += chunk; let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      let res; try { res = dispatch(JSON.parse(line)); } catch { res = err(null, -32700, "Parse error"); }
      if (res) process.stdout.write(JSON.stringify(res) + "\n");
    }
  });
  process.stdin.on("end", () => process.exit(0));
}

// ---------- Streamable HTTP (JSON response mode) ----------
function tokenOk(header, expected) {
  const m = /^Bearer\s+(.+)$/i.exec(header || ""); if (!m) return false;
  const a = createHash("sha256").update(m[1]).digest(), b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
function startHttp() {
  const TOKEN = process.env.MCP_AUTH_TOKEN;
  if (!TOKEN || TOKEN.length < 24) { console.error("MCP_AUTH_TOKEN must be set (>= 24 chars) for HTTP mode."); process.exit(1); }
  const HOST = process.env.HOST || "127.0.0.1"; const PORT = Number(process.env.PORT || 8787);
  const send = (res, code, body, extra = {}) => { res.writeHead(code, { "content-type": "application/json", ...extra }); res.end(body === undefined ? "" : JSON.stringify(body)); };
  const server = http.createServer((req, res) => {
    const pathname = (req.url || "").split("?")[0];
    if (req.method === "GET" && pathname === "/healthz") return send(res, 200, { ok: true, engineSha: ENGINE_SHA });
    if (pathname !== "/mcp") return send(res, 404, { error: "not found" });
    if (!tokenOk(req.headers.authorization, TOKEN)) { log({ http: "auth_rejected" }); return send(res, 401, err(null, -32001, "Unauthorized"), { "www-authenticate": 'Bearer realm="url-cleaner-mcp"' }); }
    if (req.method === "GET") return send(res, 405, { error: "SSE stream not offered; use POST" }, { allow: "POST" });
    if (req.method === "DELETE") return send(res, 405, { error: "stateless server" }, { allow: "POST" });
    if (req.method !== "POST") return send(res, 405, { error: "method not allowed" }, { allow: "POST" });
    const chunks = [];
    let size = 0;
    let bodyTooLarge = false;
    req.on("data", (chunk) => {
      if (bodyTooLarge) return;
      size += chunk.length;
      if (size > MAX_HTTP_BODY_BYTES) {
        bodyTooLarge = true;
        send(res, 413, err(null, -32000, "Request body too large"));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (bodyTooLarge) return;
      const body = Buffer.concat(chunks).toString("utf8");
      let payload; try { payload = JSON.parse(body); } catch { return send(res, 400, err(null, -32700, "Parse error")); }
      const out = dispatch(payload);
      if (!out) return send(res, 202);
      send(res, 200, out);
    });
  });
  server.listen(PORT, HOST, () => log({ http: "listening", host: HOST, port: PORT, engineSha: ENGINE_SHA }));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) { if (process.argv.includes("--http")) startHttp(); else startStdio(); }
export { TOOLS, handle };
