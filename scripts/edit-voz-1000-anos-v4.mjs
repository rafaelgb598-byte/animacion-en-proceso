// V4 · 1000 años: recorta «La foto.» del principio de la toma v3photo (sin créditos).
// Entrada: public/videos/03-1000-anos/final/voz/v3photo.wav → Salida: public/videos/03-1000-anos/v4/voz/v4memory.wav
// Uso: node scripts/edit-voz-1000-anos-v4.mjs
import fs from "node:fs";
import console from "node:console";

const IN = "public/videos/03-1000-anos/final/voz/v3photo.wav";
const OUT = "public/videos/03-1000-anos/v4/voz/v4memory.wav";
const CUT = 0.42; // segundos: silencio después de «La foto.» (−36 a −44 dB), antes de la «S» de «Sin»
const b = fs.readFileSync(IN);
let o = 12, fmt = null, data = null;
while (o < b.length) {
  const id = b.toString("ascii", o, o + 4), len = b.readUInt32LE(o + 4);
  if (id === "fmt ") fmt = b.subarray(o + 8, o + 8 + len);
  if (id === "data") { data = b.subarray(o + 8, o + 8 + len); break; }
  o += 8 + len;
}
const sr = fmt.readUInt32LE(4);
const start = Math.round(CUT * sr) * 2;
const out = Buffer.from(data.subarray(start));
const fade = Math.round(0.012 * sr);
for (let i = 0; i < fade; i++) out.writeInt16LE(Math.round(out.readInt16LE(i * 2) * (i / fade)), i * 2);
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + out.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24);
h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(out.length, 40);
fs.writeFileSync(OUT, Buffer.concat([h, out]));
console.log(`${OUT}  ${(out.length / 2 / sr).toFixed(3)} s`);
