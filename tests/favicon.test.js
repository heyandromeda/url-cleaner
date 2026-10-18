import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const FAVICON_FILES = ["favicon.ico", "favicon.png", "apple-touch-icon.png"];

function icoSizes(buffer) {
  assert.equal(buffer.readUInt16LE(0), 0, "ICO reserved field");
  assert.equal(buffer.readUInt16LE(2), 1, "ICO type");
  const count = buffer.readUInt16LE(4);
  const sizes = [];
  for (let i = 0; i < count; i += 1) {
    const offset = 6 + i * 16;
    const width = buffer[offset];
    const height = buffer[offset + 1];
    sizes.push({ width: width === 0 ? 256 : width, height: height === 0 ? 256 : height });
  }
  return sizes;
}

function pngInfo(buffer) {
  assert.equal(buffer.subarray(0, 8).toString("binary"), "\x89PNG\r\n\x1a\n", "PNG signature");
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  if (pb <= pc) {
    return b;
  }
  return c;
}

function pngPixel(buffer, x, y) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  assert.equal(bitDepth, 8);
  assert.ok(colorType === 2 || colorType === 6, "RGB or RGBA PNG");
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IDAT") {
      chunks.push(data);
    }
    if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const inflated = inflateSync(Buffer.concat(chunks));
  const recon = Buffer.alloc(height * stride);
  let src = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = inflated[src];
    src += 1;
    const dest = row * stride;
    for (let col = 0; col < stride; col += 1) {
      const raw = inflated[src + col];
      const left = col >= channels ? recon[dest + col - channels] : 0;
      const up = row > 0 ? recon[dest - stride + col] : 0;
      const upLeft = row > 0 && col >= channels ? recon[dest - stride + col - channels] : 0;
      let value;
      if (filter === 0) {
        value = raw;
      } else if (filter === 1) {
        value = (raw + left) & 255;
      } else if (filter === 2) {
        value = (raw + up) & 255;
      } else if (filter === 3) {
        value = (raw + ((left + up) >> 1)) & 255;
      } else if (filter === 4) {
        value = (raw + paeth(left, up, upLeft)) & 255;
      } else {
        assert.fail(`unsupported PNG filter ${filter}`);
      }
      recon[dest + col] = value;
    }
    src += stride;
  }

  const i = y * stride + x * channels;
  return { r: recon[i], g: recon[i + 1], b: recon[i + 2] };
}

test("root index.html matches the dist copy used by Vercel", () => {
  const rootHtml = readFileSync(join(root, "index.html"), "utf8");
  const distHtml = readFileSync(join(dist, "index.html"), "utf8");
  assert.equal(rootHtml, distHtml);
});

test("favicon binaries exist in both root and dist and are identical", () => {
  for (const name of FAVICON_FILES) {
    const rootPath = join(root, name);
    const distPath = join(dist, name);
    assert.equal(existsSync(rootPath), true, `${name} at repo root`);
    assert.equal(existsSync(distPath), true, `${name} in dist/`);
    assert.deepEqual(readFileSync(rootPath), readFileSync(distPath), `${name} root/dist mismatch`);
  }
});

test("index.html links same-origin favicon files instead of a data URI", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.match(html, /<link rel="icon" href="\.\/favicon\.ico"/);
  assert.match(html, /<link rel="icon" type="image\/png" href="\.\/favicon\.png"/);
  assert.match(html, /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png"/);
  assert.doesNotMatch(html, /data:image\/svg\+xml/);
});

test("favicon.ico contains 16, 32, and 48 pixel sizes", () => {
  const sizes = icoSizes(readFileSync(join(root, "favicon.ico")));
  const pairs = sizes.map(({ width, height }) => `${width}x${height}`).sort();
  assert.deepEqual(pairs, ["16x16", "32x32", "48x48"]);
});

test("PNG favicons are squares and use the approved dark green", () => {
  const png = readFileSync(join(root, "favicon.png"));
  const apple = readFileSync(join(root, "apple-touch-icon.png"));
  const pngMeta = pngInfo(png);
  const appleMeta = pngInfo(apple);

  assert.equal(pngMeta.width, pngMeta.height);
  assert.ok(pngMeta.width >= 32);
  assert.deepEqual(appleMeta, { width: 180, height: 180 });

  const corner = pngPixel(png, 0, 0);
  assert.deepEqual(corner, { r: 6, g: 58, b: 26 });
  assert.deepEqual(pngPixel(apple, 0, 0), { r: 6, g: 58, b: 26 });
});

test("CSP allows same-origin favicon files", () => {
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const csp = vercel.headers[0].headers.find((header) => header.key === "Content-Security-Policy").value;
  assert.match(csp, /img-src[^;]*'self'/);
  assert.equal(vercel.outputDirectory, "dist");
  assert.equal(vercel.buildCommand, "npm run build");
});
