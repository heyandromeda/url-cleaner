import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDist } from "../scripts/build.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

export function distSiteRoot() {
  buildDist(repoRoot);
  return join(repoRoot, "dist");
}

export function startDistServer() {
  const siteRoot = distSiteRoot();

  return new Promise((resolve) => {
    const server = createServer((request, response) => {
      const path = request.url === "/" ? "/index.html" : request.url.split("?")[0];
      const filePath = join(siteRoot, decodeURIComponent(path.slice(1)));
      if (!existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const ext = filePath.slice(filePath.lastIndexOf("."));
      response.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      response.end(readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}
