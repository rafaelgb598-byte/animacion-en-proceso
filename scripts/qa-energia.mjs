// Curva de energía del audio de un MP4: RMS en dB por cuarto de segundo, PNG de la curva y tramos planos sin voz.
// Uso: node scripts/qa-energia.mjs <video.mp4> <salida.png> [voz=f0-f1,f0-f1,...]
//   «plano» = 1,5 s o más sin voz en los que la energía no se mueve más de 3 dB.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { canvas, encodePng } from "./lib/png.mjs";

const [mp4, png, vozArg = ""] = process.argv.slice(2);
const SR = 48000;
const isWin = process.platform === "win32";
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "energia-")), "a.wav");
execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-vn", "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", tmp], { shell: isWin });
const b = fs.readFileSync(tmp);
let o = 12;
while (b.toString("ascii", o, o + 4) !== "data") o += 8 + b.readUInt32LE(o + 4);
o += 8;
const n = Math.floor((b.length - o) / 2);
const Q = SR / 4;
const curva = [];
for (let i = 0; i + Q <= n; i += Q) {
  let s = 0;
  for (let j = i; j < i + Q; j++) {
    const v = b.readInt16LE(o + j * 2) / 32768;
    s += v * v;
  }
  curva.push(10 * Math.log10(s / Q + 1e-12));
}
const voz = vozArg.split(",").filter(Boolean).map((r) => r.split("-").map(Number));
const conVoz = (q) => voz.some(([a, c]) => q * 7.5 < c && (q + 1) * 7.5 > a);

// pico
let pk = 0;
curva.forEach((v, i) => {
  if (v > curva[pk]) pk = i;
});
console.log(`pico de energía: ${curva[pk].toFixed(1)} dB en ${(pk / 4).toFixed(2)} s (f${Math.round(pk * 7.5)})`);
// tramos planos sin voz
const planos = [];
let ini = null;
for (let q = 0; q < curva.length; q++) {
  if (conVoz(q)) {
    ini = null;
    continue;
  }
  if (ini === null) ini = q;
  const seg = curva.slice(ini, q + 1);
  if (Math.max(...seg) - Math.min(...seg) > 3) ini = q;
  else if (q - ini + 1 >= 6) {
    const last = planos[planos.length - 1];
    if (last && last[1] >= ini - 1) last[1] = q;
    else planos.push([ini, q]);
  }
}
console.log(planos.length ? `tramos planos sin voz ≥ 1,5 s: ${planos.map(([a, c]) => `f${Math.round(a * 7.5)}–f${Math.round((c + 1) * 7.5)}`).join(", ")}` : "sin tramos planos sin voz de 1,5 s o más");
console.log("RMS por cuarto de segundo (dB):");
for (let i = 0; i < curva.length; i += 8) console.log(`  ${String((i / 4).toFixed(0)).padStart(2)} s  ${curva.slice(i, i + 8).map((v) => v.toFixed(0).padStart(4)).join("")}`);

// PNG: barras (ámbar con voz, gris sin voz), guías cada 10 dB
const W = 4 * curva.length * 3;
const H = 300;
const img = canvas(W, H, [17, 18, 20]);
const y = (db) => Math.round(H - ((Math.max(-60, db) + 60) / 60) * (H - 10));
const set = (x, yy, c) => {
  const i = (yy * W + x) * 4;
  img.data[i] = c[0];
  img.data[i + 1] = c[1];
  img.data[i + 2] = c[2];
};
for (let db = -50; db <= 0; db += 10) for (let x = 0; x < W; x++) set(x, y(db), [55, 55, 60]);
curva.forEach((v, q) => {
  const c = conVoz(q) ? [224, 163, 59] : [150, 150, 158];
  for (let x = q * 12; x < q * 12 + 10; x++) for (let yy = y(v); yy < H; yy++) set(x, yy, c);
});
fs.mkdirSync(path.dirname(png), { recursive: true });
fs.writeFileSync(png, encodePng(img));
console.log(png);
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
