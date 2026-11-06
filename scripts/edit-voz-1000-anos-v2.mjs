// Edición de la voz de «1000 años» (v2) (sin créditos): decodifica las tomas originales de ElevenLabs,
// acorta pausas largas / recorta según el guion, normaliza, y calcula los tiempos de cada frase
// (las frases se alinean a las pausas detectadas) para los subtítulos.
// Entrada: guiones/MilAños/03-1000-anos/v2/voz-original/<id>.mp3
// Salida:  public/videos/03-1000-anos/v2/voz/<id>.wav  +  src/videos/03-1000-anos/v2/episodes/celular.voz.json
// Uso: node scripts/edit-voz-1000-anos-v2.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import console from "node:console";

const SR = 48000;
const IN = "guiones/MilAños/03-1000-anos/v2/voz-original";
const OUT = "public/videos/03-1000-anos/v2/voz";
const guion = JSON.parse(fs.readFileSync("guiones/MilAños/03-1000-anos/v2/guion.json", "utf8"));
fs.mkdirSync(OUT, { recursive: true });

/** Edición por segmento: recorte final (s), texto efectivamente usado y pausa máxima (s). */
const EDIT = {
  year200: { maxPause: 0.2 },
  year1000: { cutAt: 0.76, text: "Mil años." },
};

const decode = (file) => {
  const tmp = path.join(os.tmpdir(), `uep-${path.basename(file)}.wav`);
  execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", tmp], { shell: true });
  const w = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  let o = 12;
  let b = Buffer.alloc(0);
  while (o < w.length) {
    const id = w.toString("ascii", o, o + 4);
    const len = w.readUInt32LE(o + 4);
    if (id === "data") { b = w.subarray(o + 8, o + 8 + len); break; }
    o += 8 + len;
  }
  return Float64Array.from({ length: b.length / 2 }, (_, i) => b.readInt16LE(i * 2) / 32768);
};

const frames = (x, win = 480) => {
  const out = [];
  for (let w = 0; w * win < x.length; w++) {
    let e = 0;
    for (let i = w * win; i < Math.min(x.length, (w + 1) * win); i++) e += x[i] * x[i];
    out.push(10 * Math.log10(e / win + 1e-12));
  }
  return out;
};

/** Pausas (> 0,12 s bajo −45 dB) como [inicio, fin] en segundos. */
const pauses = (x) => {
  const db = frames(x);
  const res = [];
  let s0 = -1;
  db.forEach((v, w) => {
    const t = w * 0.01;
    if (v < -45 && s0 < 0) s0 = t;
    if (v >= -45 && s0 >= 0) { if (t - s0 > 0.12 && s0 > 0) res.push([s0, t]); s0 = -1; }
  });
  return res;
};

const speechSpan = (x) => {
  const db = frames(x);
  const first = db.findIndex((v) => v > -45);
  let last = db.length - 1;
  while (last > 0 && db[last] <= -45) last--;
  return [first * 0.01, (last + 1) * 0.01];
};

/** Acorta cada pausa a `maxPause` con fundidos cortos. */
const squeeze = (x, maxPause) => {
  const ps = pauses(x).filter(([a, b]) => b - a > maxPause);
  const parts = [];
  let cur = 0;
  for (const [a, b] of ps) {
    const keepA = a + maxPause / 2, keepB = b - maxPause / 2;
    parts.push(x.subarray(Math.round(cur * SR), Math.round(keepA * SR)));
    cur = keepB;
  }
  parts.push(x.subarray(Math.round(cur * SR)));
  const out = new Float64Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  const f = Math.round(0.004 * SR);
  parts.forEach((p, k) => {
    out.set(p, o);
    for (let i = 0; i < f && k > 0; i++) out[o + i] *= i / f;
    for (let i = 0; i < f && k < parts.length - 1; i++) out[o + p.length - 1 - i] *= i / f;
    o += p.length;
  });
  return out;
};

const writeWav = (file, x) => {
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  const g = Math.pow(10, -1 / 20) / (peak || 1);
  const data = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * g * 32767))), i * 2));
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
};

/** Frases del texto (corta en . … : ?) alineadas a las pausas más cercanas a su posición proporcional. */
const phrasesFor = (text, x) => {
  const parts = text.match(/[^.…:?!]+[.…:?!]*/g).map((s) => s.trim()).filter(Boolean);
  const [t0, t1] = speechSpan(x);
  const ps = pauses(x).map(([a, b]) => (a + b) / 2);
  const total = parts.reduce((n, p) => n + p.length, 0);
  let acc = 0;
  const cuts = [t0];
  parts.slice(0, -1).forEach((p) => {
    acc += p.length;
    const target = t0 + ((t1 - t0) * acc) / total;
    const snap = ps.length ? ps.reduce((best, c) => (Math.abs(c - target) < Math.abs(best - target) ? c : best)) : target;
    cuts.push(Math.max(cuts[cuts.length - 1] + 0.2, snap));
  });
  cuts.push(t1);
  return parts.map((p, i) => ({ text: p, start: +cuts[i].toFixed(3), end: +cuts[i + 1].toFixed(3) }));
};

const result = {};
for (const s of guion.segmentos) {
  let x = decode(path.join(IN, `${s.id}.mp3`));
  const e = EDIT[s.id] ?? {};
  if (e.cutAt) {
    x = x.slice(0, Math.round(e.cutAt * SR));
    const f = Math.round(0.03 * SR);
    for (let i = 0; i < f; i++) x[x.length - 1 - i] *= i / f;
  }
  if (e.maxPause) x = squeeze(x, e.maxPause);
  writeWav(path.join(OUT, `${s.id}.wav`), x);
  const text = e.text ?? s.texto;
  result[s.id] = { text, duration: +(x.length / SR).toFixed(3), phrases: phrasesFor(text, x) };
  console.log(`${s.id.padEnd(9)} ${result[s.id].duration.toFixed(2)} s  ${result[s.id].phrases.map((p) => `[${p.start}-${p.end}] ${p.text}`).join(" | ")}`);
}
fs.writeFileSync("src/videos/03-1000-anos/v2/episodes/celular.voz.json", JSON.stringify(result, null, 1) + "\n");
