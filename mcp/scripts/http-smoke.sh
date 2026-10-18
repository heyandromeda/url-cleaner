#!/usr/bin/env bash
# Local-only smoke test: starts the server on 127.0.0.1 with a random throwaway token (never printed), runs curl calls, stops it.
set -uo pipefail
cd "$(dirname "$0")/.."
export MCP_AUTH_TOKEN="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))')"
export PORT="${PORT:-8799}" HOST=127.0.0.1
node server.mjs --http 2> /tmp/ucmcp-http.log & PID=$!
trap 'kill $PID 2>/dev/null' EXIT
for i in $(seq 1 30); do curl -s "http://127.0.0.1:$PORT/healthz" >/dev/null && break; sleep 0.1; done
U="http://127.0.0.1:$PORT/mcp"
rpc() { curl -s -w '  [HTTP %{http_code}]\n' -H "Authorization: Bearer $MCP_AUTH_TOKEN" -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d "$1" "$U"; }
call() { rpc "{\"jsonrpc\":\"2.0\",\"id\":$1,\"method\":\"tools/call\",\"params\":{\"name\":\"$2\",\"arguments\":$3}}"; }
echo "### no token";   curl -s -i -X POST "$U" -d '{}' | sed -n '1p;/www-authenticate/Ip;$p'; echo
echo "### wrong token"; curl -s -o /dev/null -w '[HTTP %{http_code}]\n' -H 'Authorization: Bearer nope' -X POST "$U" -d '{}'
echo "### initialize"; rpc '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
echo "### initialized"; rpc '{"jsonrpc":"2.0","method":"notifications/initialized"}'
echo "### ping"; rpc '{"jsonrpc":"2.0","id":2,"method":"ping"}'
echo "### tools/list"; rpc '{"jsonrpc":"2.0","id":3,"method":"tools/list"}' > /tmp/ucmcp-list.json; cat /tmp/ucmcp-list.json | tail -c 40
for spec in \
 '10|clean_url|{"url":"https://example.com/p?utm_source=x&utm_medium=y&id=5&fbclid=abc"}' \
 '11|clean_url|{"url":"https://www.google.com/url?q=https%3A%2F%2Fexample.com%2F%3Futm_source%3Dx"}' \
 '12|clean_url|{"url":"ht!tp:/bad"}' \
 '13|clean_url|{"url":"https://a.com/?a=1&&=&b"}' \
 '14|clean_url|{"url":"https://shop.example.com/x?ref=abc&utm_campaign=z","options":{"aggressive":true}}' \
 '20|clean_urls_batch|{"urls":["https://example.com/?gclid=1&q=keep","ht!tp:/bad","https://youtu.be/abc?si=XYZ&t=10"]}' \
 '30|inspect_url|{"url":"https://www.google.com/url?q=https%3A%2F%2Fexample.com%2F%3Futm_source%3Dx"}' \
 '31|inspect_url|{"url":"https://a.com/?a=1&&=&b"}' \
 '40|explain_changes|{"url":"https://example.com/p?utm_source=x&utm_medium=y&id=5&fbclid=abc&ref=friend"}' \
 '50|get_cleaner_capabilities|{}' \
 '60|clean_url|{}' \
 '61|no_such_tool|{}' ; do
  IFS='|' read -r id name args <<< "$spec"
  echo "### $id $name $args"; call "$id" "$name" "$args" > "/tmp/ucmcp-$id.json"; tail -c 20 "/tmp/ucmcp-$id.json"
done
echo "### server log (stderr)"; cat /tmp/ucmcp-http.log
