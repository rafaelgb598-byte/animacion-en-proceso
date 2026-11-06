// Formas de onda en PNG (sin dependencias) + pico y RMS de cada WAV de una carpeta.
// Uso: node scripts/qa-wave-png.mjs [carpetaWav] [carpetaSalida]
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import process from "node:process";
import console from "node:console";

const inDir = path.resolve(process.argv[2] ?? "public/videos/03-1000-anos/v2/sfx");
const outDir = path.resolve(process.argv[3] ?? "out/1000-anos/v2/sfx-waves");
fs.mkdirSync(outDir, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (b) => {
  let c = 0xffffffff;
  for (const v of b) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const W = 900, H = 160;
for (const f of fs.readdirSync(inDir).filter((n) => n.endsWith(".wav"))) {
  const b = fs.readFileSync(path.join(inDir, f));
  const n = (b.length - 44) / 2;
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = b.readInt16LE(44 + i * 2) / 32768;
  const rgb = Buffer.alloc(W * H * 3, 0x14);
  let peak = 0, sum = 0;
  for (const v of s) { peak = Math.max(peak, Math.abs(v)); sum += v * v; }
  for (let x = 0; x < W; x++) {
    const a = Math.floor((x / W) * n), z = Math.max(a + 1, Math.floor(((x + 1) / W) * n));
    let mn = 0, mx = 0;
    for (let i = a; i < z; i++) { mn = Math.min(mn, s[i]); mx = Math.max(mx, s[i]); }
    const y0 = Math.round(H / 2 - mx * (H / 2 - 2)), y1 = Math.round(H / 2 - mn * (H / 2 - 2));
    for (let y = y0; y <= y1; y++) { const o = (y * W + x) * 3; rgb[o] = 0xe0; rgb[o + 1] = 0xa3; rgb[o + 2] = 0x3b; }
    const o = ((H / 2) * W + x) * 3; rgb[o] = 0x55; rgb[o + 1] = 0x55; rgb[o + 2] = 0x55;
  }
  fs.writeFileSync(path.join(outDir, f.replace(".wav", ".png")), png(W, H, rgb));
  const db = (v) => (v > 0 ? (20 * Math.log10(v)).toFixed(1) : "-inf");
  console.log(`${f.padEnd(18)} ${(n / 48000).toFixed(3)} s  pico ${db(peak)} dBFS  RMS ${db(Math.sqrt(sum / n))} dBFS`);
}
