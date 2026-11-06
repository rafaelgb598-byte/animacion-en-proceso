// Contraste texto/fondo (WCAG) medido sobre la zona real: mediana de luminancia del fondo en una caja vs color del texto.
// Uso: node scripts/qa-contrast.mjs <png> <x0,y0,x1,y1> <#texto> [más ternas]
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
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const a = process.argv.slice(2);
for (let i = 0; i + 2 < a.length; i += 3) {
  const img = decode(a[i]);
  const [x0, y0, x1, y1] = a[i + 1].split(",").map(Number);
  const hex = a[i + 2].replace("#", "");
  const tl = lum(parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16));
  const ls = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const p = (y * img.w + x) * img.bpp; ls.push(lum(img.px[p], img.px[p + 1], img.px[p + 2])); }
  ls.sort((p, q) => p - q);
  // fondo = percentil 30 (descarta los píxeles del texto, más claros)
  const bg = ls[Math.floor(ls.length * 0.3)];
  const ratio = (Math.max(tl, bg) + 0.05) / (Math.min(tl, bg) + 0.05);
  console.log(`${a[i].split(/[\/]/).pop()} [${a[i + 1]}] ${a[i + 2]}: ${ratio.toFixed(2)}:1`);
}
