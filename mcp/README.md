# URL Cleaner MCP server

Official MCP adapter for [URL Cleaner](https://github.com/heyandromeda/url-cleaner). It lives in this repo at `mcp/` and imports the **real** engine from the parent directory (`../cleaner.js`, `../explanations.js`, `../tracker-profiles.js`) with no copies and no extra dependencies.

Every tool result comes from engine functions only. The server does not fetch or open URLs. Each result includes `engineInvoked` (function names + best-effort git SHA of the loaded engine).

- **stdio** (default): newline-delimited JSON-RPC for Cursor, Claude Code, Codex, and other local MCP clients.
- **HTTP**: Streamable HTTP on `POST /mcp` (JSON responses), bearer auth, binds `127.0.0.1` by default. `GET /healthz` is public.
- Protocol: `initialize`, `notifications/initialized`, `ping`, `tools/list`, `tools/call`. JSON-RPC batches accepted.
- Logs (stderr): tool name, duration, status, and auth rejections only — never URLs, arguments, or tokens.

This folder is **not** part of the static Vercel site (`npm run build` only copies root web assets into `dist/`).

## Tools

| Tool | Engine | Notes |
|---|---|---|
| `clean_url` | `cleanUrl`, `fingerprintRemovedKeptDetail`, `explainParameter` | One URL; optional `aggressive`, `removeDuplicateParameters` |
| `clean_urls_batch` | `cleanBatch`, `cleanedUrlsFromBatch` | Up to 100 URLs; per-item errors |
| `inspect_url` | `inspectUrl`, `trackingFingerprint`, `isOpaqueShortener` | X-Ray breakdown |
| `explain_changes` | `cleanUrl`, `categorizeParameter`, `explainParameter`, `getTrackerProfile`, … | Why params were removed or kept |
| `get_cleaner_capabilities` | introspection | Engine SHA, exports, feature flags |

All tools are read-only (`readOnlyHint: true`). Results include `structuredContent` and a JSON `text` block.

## Run locally

From the repo root:

```bash
cd mcp
node server.mjs --stdio
MCP_AUTH_TOKEN="$(openssl rand -hex 32)" node server.mjs --http   # http://127.0.0.1:8787/mcp
npm test
npm run smoke    # optional curl walkthrough (127.0.0.1 only)
```

Environment:

| Variable | Purpose |
|---|---|
| `MCP_AUTH_TOKEN` | Required for HTTP mode (≥ 24 characters) |
| `HOST` | Default `127.0.0.1` |
| `PORT` | Default `8787` |
| `ENGINE_DIR` | Default `..` (repo root) |
| `ENGINE_SHA` | Optional override for `engineInvoked.sha` |
| `MCP_ALLOWED_ORIGINS` | Optional comma-separated full origins (scheme + host + port, e.g. `https://app.example:8443`) for HTTP `/mcp`. Each entry is matched with `URL(entry).origin`. The default loopback rule (below) always applies too. |
| `MCP_ALLOWED_HOSTS` | Optional comma-separated `Host` header values (e.g. `mcp.example.com`, `proxy.internal:8080`) for reverse proxies in front of the server. The default loopback `Host` rule always applies too. |

## Auth (HTTP)

`Authorization: Bearer <MCP_AUTH_TOKEN>`. Comparison uses SHA-256 digests and `timingSafeEqual`. Wrong or missing token → `401` with `WWW-Authenticate: Bearer`.

**Origin (DNS rebinding):** On `POST /mcp`, if the client sends an `Origin` header it must pass **either** the default loopback rule (`http`/`https` on `localhost`, `127.0.0.1`, or `[::1]` on **any** port) **or** match a full origin in `MCP_ALLOWED_ORIGINS` (scheme, host, and port compared via `URL().origin` — `https://app.example:8443` does not admit `http://app.example` or `https://app.example:9999`). A disallowed Origin returns **403** before auth or body handling. Requests with no `Origin` header are still accepted.

**Host:** The `Host` header must match the bound loopback address/port **or** an entry in `MCP_ALLOWED_HOSTS` (comma-separated host or `host:port`, lowercase). Use this when a reverse proxy forwards to the MCP process with a public hostname. `/healthz` is not subject to Origin checks.

There is **no** public hosted MCP endpoint in this repo. Run stdio locally or bind HTTP on localhost for your own clients.

## Client configs

Examples in `examples/` (placeholders only — set paths and env vars on your machine):

- **Cursor** — `examples/cursor-mcp.json` (`${env:URL_CLEANER_MCP_TOKEN}` for remote)
- **Claude Code** — `examples/claude-mcp.json`
- **Codex** — `examples/codex-config.toml` (`bearer_token_env_var`)

Stdio (typical):

```bash
node /ABSOLUTE/PATH/url-cleaner/mcp/server.mjs --stdio
```

## Example

```json
{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{"name":"clean_url","arguments":{"url":"https://example.com/p?utm_source=x&utm_medium=y&id=5&fbclid=abc"}}}
```

→ `cleaned`: `https://example.com/p?id=5`, `removedParams`: `["utm_source","utm_medium","fbclid"]`.

## Engine quirk (unchanged)

`https://a.com/?a=1&&=&b` normalizes to `https://a.com/?a=1&=&b` but may report `changed: false` — same as the web app engine.

## Maintenance

When engine exports or shapes change, update `server.mjs` and `tests/server.test.mjs`. Do not duplicate cleaning logic in the MCP layer.
