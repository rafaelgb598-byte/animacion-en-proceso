// Diferencia media entre pares de PNG (sin dependencias): loop (0 vs 1199) y continuidad (199/200, 529/530, 709/710).
// Uso: node scripts/qa-frame-diff.mjs a.png b.png [c.png d.png ...]
import fs from "node:fs";
import zlib from "node:zlib";
import process from "node:process";
import console from "node:console";

function decode(file) {
  const b = fs.readFileSync(file);
  let o = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o); const type = b.toString("ascii", o + 4, o + 8); const data = b.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    if (type === "IDAT") idat.push(data);
    o += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp; const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const up = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let r = v;
      if (f === 1) r = v + a; else if (f === 2) r = v + up; else if (f === 3) r = v + ((a + up) >> 1);
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? up : c); }
      px[y * stride + x] = r & 0xff;
    }
  }
  return { w, h, bpp, px };
}
const args = process.argv.slice(2);
for (let i = 0; i + 1 < args.length; i += 2) {
  const A = decode(args[i]), B = decode(args[i + 1]);
  let sum = 0, n = 0, big = 0;
  for (let p = 0; p < A.w * A.h; p++) {
    let d = 0;
    for (let k = 0; k < 3; k++) d += Math.abs(A.px[p * A.bpp + k] - B.px[p * B.bpp + k]);
    d /= 3; sum += d; n++; if (d > 40) big++;
  }
  console.log(`${args[i].split(/[\\/]/).pop()} vs ${args[i + 1].split(/[\\/]/).pop()}: diferencia media ${(sum / n).toFixed(2)}/255, píxeles >40: ${((100 * big) / n).toFixed(2)} %`);
}
