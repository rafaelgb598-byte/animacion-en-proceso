// QA de imagen del Short Stroop (sección 9): loop, daltonismo, legibilidad y hoja de contactos.
// Uso: node scripts/qa-stroop.mjs [dirStills] [dirQA] [prefijo] [desde-hasta del desafío difícil]
//   por defecto (V2, GiroDatoStroopV2): videosPrueba/GiroDato/qa/02-stroop/stills videosPrueba/GiroDato/qa/02-stroop/qa GiroDatoStroopV2 426-602
//   (nivel 3 de la V2: L_START[3] = 426 hasta FREEZE = 602; la V1 era StroopShort 281-521)
import fs from "node:fs";
import path from "node:path";
import console from "node:console";
import process from "node:process";
import { blit, canvas, decodePng, downscale, encodePng } from "./lib/png.mjs";

const [argDir, argQa, argPrefix, argRange] = process.argv.slice(2);
const DIR = argDir ?? "videosPrueba/GiroDato/qa/02-stroop/stills";
const QA = argQa ?? "videosPrueba/GiroDato/qa/02-stroop/qa";
const PREFIX = argPrefix ?? "GiroDatoStroopV2";
const [R0, R1] = (argRange ?? "426-602").split("-").map(Number);
fs.mkdirSync(QA, { recursive: true });
const load = (f) => decodePng(fs.readFileSync(path.join(DIR, `${PREFIX}-${String(f).padStart(4, "0")}.png`)));

/* ── 1. hoja de contactos (con y sin guías) + versión de 360 px de ancho ── */
const FRAMES = fs.readdirSync(DIR).filter((n) => n.startsWith(`${PREFIX}-`) && /-\d{4}\.png$/.test(n)).map((n) => Number(n.slice(PREFIX.length + 1, PREFIX.length + 5))).sort((a, b) => a - b);
const sheet = (dir, cols, factor) => {
  const imgs = FRAMES.map((f) => downscale(decodePng(fs.readFileSync(path.join(dir, `${PREFIX}-${String(f).padStart(4, "0")}.png`))), factor));
  const w = imgs[0].width;
  const h = imgs[0].height;
  const gap = 8;
  const rows = Math.ceil(imgs.length / cols);
  const c = canvas(cols * (w + gap) + gap, rows * (h + gap) + gap, [24, 24, 28]);
  imgs.forEach((im, i) => blit(c, im, gap + (i % cols) * (w + gap), gap + Math.floor(i / cols) * (h + gap)));
  return c;
};
fs.writeFileSync(path.join(QA, "hoja-contactos.png"), encodePng(sheet(DIR, 7, 4)));
if (fs.existsSync(path.join(DIR, "guias"))) fs.writeFileSync(path.join(QA, "hoja-contactos-guias.png"), encodePng(sheet(path.join(DIR, "guias"), 7, 4)));
// legibilidad móvil: cada fotograma a 360 px de ancho (factor 3)
fs.writeFileSync(path.join(QA, "hoja-360px.png"), encodePng(sheet(DIR, 7, 3)));

/* ── 2. loop: fotograma final vs 0 ── */
const a = load(0);
const b = load(FRAMES[FRAMES.length - 1]);
let sum = 0;
let max = 0;
let over = 0;
for (let i = 0; i < a.data.length; i += 4) {
  for (let c = 0; c < 3; c++) {
    const d = Math.abs(a.data[i + c] - b.data[i + c]);
    sum += d;
    max = Math.max(max, d);
    if (d > 24) over++;
  }
}
const px = (a.data.length / 4) * 3;
console.log(`LOOP f0 vs f${FRAMES[FRAMES.length - 1]}: diferencia media ${(sum / px).toFixed(3)} / 255 · máx ${max} · canales > 24: ${((100 * over) / px).toFixed(3)} %`);

/* ── 3. daltonismo: matrices de Machado (2009, severidad 1) sobre las tintas y los stills de la ronda 2 ── */
const M = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
};
const toLin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toSrgb = (v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)));
const sim = (rgb, m) => {
  const l = rgb.map(toLin);
  return [0, 1, 2].map((k) => toSrgb(m[k * 3] * l[0] + m[k * 3 + 1] * l[1] + m[k * 3 + 2] * l[2]));
};
const lab = ([r, g, b]) => {
  const [R, G, B] = [r, g, b].map(toLin);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const dE = (p, q) => Math.hypot(...lab(p).map((v, i) => v - lab(q)[i]));
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const INKS = { red: hex("#F0443A"), blue: hex("#3D8BFF"), yellow: hex("#F5D547"), white: hex("#F3EFE6") };
for (const [name, m] of Object.entries(M)) {
  const names = Object.keys(INKS);
  let min = Infinity;
  let pair = "";
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      const d = dE(sim(INKS[names[i]], m), sim(INKS[names[j]], m));
      if (d < min) {
        min = d;
        pair = `${names[i]}/${names[j]}`;
      }
    }
  console.log(`DALTONISMO ${name}: ΔE mínimo entre tintas ${min.toFixed(1)} (${pair}) → ${min >= 20 ? "se distinguen" : "RIESGO"}`);
  // stills de la ronda 2 simulados
  const r2 = FRAMES.filter((f) => f >= R0 && f < R1);
  const imgs = r2.map((f) => {
    const im = downscale(load(f), 3);
    for (let i = 0; i < im.data.length; i += 4) {
      const s = sim([im.data[i], im.data[i + 1], im.data[i + 2]], m);
      im.data[i] = s[0];
      im.data[i + 1] = s[1];
      im.data[i + 2] = s[2];
    }
    return im;
  });
  const c = canvas(imgs.length * (imgs[0].width + 8) + 8, imgs[0].height + 16, [24, 24, 28]);
  imgs.forEach((im, i) => blit(c, im, 8 + i * (im.width + 8), 8));
  fs.writeFileSync(path.join(QA, `daltonismo-${name}.png`), encodePng(c));
}
console.log(`hojas en ${QA}`);
