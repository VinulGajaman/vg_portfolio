// Generates /public/textures/grain.png: a 256×256 tileable fractal-noise tile (DESIGN.md §1.6.1).
// Approximates SVG feTurbulence (fractalNoise, baseFrequency .8, numOctaves 4, stitchTiles) with
// tileable value noise, contrast-normalised, encoded as 2-bit greyscale PNG (4 levels is plenty at 4.5% opacity) via zlib (≤ 20KB).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const N = 256;
let seed = 1337;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function octave(cells) {
  const g = Array.from({ length: cells * cells }, rand);
  const at = (x, y) => g[((y + cells) % cells) * cells + ((x + cells) % cells)];
  const s = (t) => t * t * (3 - 2 * t);
  return (px, py) => {
    const fx = (px / N) * cells, fy = (py / N) * cells;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = s(fx - x0), ty = s(fy - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return a + (b - a) * ty;
  };
}
// baseFrequency .8 → ~205 cycles per 256px; 4 octaves (doubling, halving amplitude), capped at pixel pitch.
const octs = [64, 128, 256, 256].map(octave);
const amps = [1, 0.5, 0.25, 0.125];
const v = new Float32Array(N * N);
let min = Infinity, max = -Infinity;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    let s = 0;
    for (let i = 0; i < 4; i++) s += octs[i](x, y) * amps[i];
    v[y * N + x] = s;
    min = Math.min(min, s);
    max = Math.max(max, s);
  }

const rowBytes = N / 4; // 2-bit
const raw = Buffer.alloc((rowBytes + 1) * N);
for (let y = 0; y < N; y++) {
  raw[y * (rowBytes + 1)] = 0;
  for (let x = 0; x < N; x += 4) {
    const q = (i) => Math.min(3, Math.floor(((v[y * N + x + i] - min) / (max - min)) * 4));
    raw[y * (rowBytes + 1) + 1 + x / 4] = (q(0) << 6) | (q(1) << 4) | (q(2) << 2) | q(3);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 2; // bit depth
ihdr[9] = 0; // greyscale
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("../public/textures/grain.png", import.meta.url), png);
console.log(`grain.png ${png.length} bytes`);
