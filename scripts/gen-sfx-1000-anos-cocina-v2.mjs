// Efectos NUEVOS de «1000 años» · Cocina v2, sintetizados por código (sin licencias, sin música).
// WAV 48 kHz, mono, 16 bits, semilla fija → public/videos/04-1000-anos-cocina/v2/sfx/
// Utilidades copiadas de gen-sfx-1000-anos-cocina.mjs. Uso: node scripts/gen-sfx-1000-anos-cocina-v2.mjs
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/04-1000-anos-cocina/v2/sfx");
fs.mkdirSync(OUT, { recursive: true });

// ---------- utilidades ----------
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const buf = (sec) => new Float64Array(Math.round(sec * SR));
const TAU = Math.PI * 2;

function biquad(x, type, f0, q = 0.707) {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const f = typeof f0 === "function" ? f0(i) : f0;
    const w = (TAU * Math.min(f, SR * 0.45)) / SR;
    const a = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    let b0, b1, b2;
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; } // bp (ganancia de pico 0 dB)
    const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
const white = (n, rnd) => Float64Array.from({ length: n }, () => rnd() * 2 - 1);
function pink(n, rnd) {
  const y = new Float64Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = rnd() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    y[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
  }
  return y;
}
const add = (dst, src, at = 0, gain = 1) => { for (let i = 0; i < src.length && at + i < dst.length; i++) dst[at + i] += src[i] * gain; return dst; };
const env = (x, fn) => { for (let i = 0; i < x.length; i++) x[i] *= fn(i / SR, i); return x; };
function fadeEdges(x, ms = 3) {
  const n = Math.round((ms / 1000) * SR);
  for (let i = 0; i < n && i < x.length; i++) { const g = i / n; x[i] *= g; x[x.length - 1 - i] *= g; }
  return x;
}
function normalize(x, peakDb = -1) {
  let p = 0; for (const v of x) p = Math.max(p, Math.abs(v));
  const g = p > 0 ? Math.pow(10, peakDb / 20) / p : 1;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}
function writeWav(name, x, { peakDb = -1, fadeMs = 3 } = {}) {
  fadeEdges(x, fadeMs);
  normalize(x, peakDb);
  const data = Buffer.alloc(x.length * 2);
  for (let i = 0; i < x.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`${name}.wav  ${(x.length / SR).toFixed(3)} s`);
}
const click = (rnd, ms = 3, hp = 1500) => env(biquad(white(Math.round((ms / 1000) * SR), rnd), "hp", hp), (t) => Math.exp(-t * 1400));

const sine = (sec, f, decay = 0, at = 0) => buf(sec).map((_, i) => { const t = i / SR; return Math.sin(TAU * f * t + at) * (decay ? Math.exp(-t * decay) : 1); });

void pink; // utilidad copiada que estas recetas no usan

// ---------- recetas (sección 4 del prompt v2) ----------
const recipes = {
  // gota que cae sobre la bacha de acero: «plink» metálico (1,9 kHz que sube un poco) + ring corto, 450 ms
  "drip-metal"(rnd) {
    const x = buf(0.45);
    const p = buf(0.06).map((_, i) => { const t = i / SR; return Math.sin(TAU * (1500 + 4000 * t) * t) * Math.exp(-t * 70); });
    add(x, p, 0, 0.9);
    for (const [f, a, d] of [[3150, 0.35, 18], [4720, 0.2, 22], [6900, 0.1, 30]]) add(x, sine(0.45, f, d, rnd() * TAU), Math.round(0.004 * SR), a);
    add(x, click(rnd, 2, 4000), 0, 0.4);
    return x;
  },
  // segundo goteo, más grave y más corto (para que no suenen iguales)
  "drip-metal-2"(rnd) {
    const x = buf(0.35);
    const p = buf(0.05).map((_, i) => { const t = i / SR; return Math.sin(TAU * (1200 + 3000 * t) * t) * Math.exp(-t * 80); });
    add(x, p, 0, 0.9);
    for (const [f, a, d] of [[2600, 0.3, 22], [3900, 0.18, 26]]) add(x, sine(0.35, f, d, rnd() * TAU), Math.round(0.003 * SR), a);
    return x;
  },
  // crujido de papel mojado: granos de ruido filtrado en ráfagas irregulares, 700 ms
  "paper-crinkle"(rnd) {
    const len = 0.7;
    const x = buf(len);
    for (let k = 0; k < 90; k++) {
      const at = Math.pow(rnd(), 0.9) * (len - 0.03);
      const g = env(biquad(white(Math.round((0.004 + rnd() * 0.01) * SR), rnd), "bp", 1800 + rnd() * 3500, 1.2), (t) => Math.exp(-t * 300));
      add(x, g, Math.round(at * SR), 0.3 + rnd() * 0.6);
    }
    return env(biquad(x, "hp", 600), (t) => Math.min(1, t / 0.05, (len - t) / 0.15));
  },
  // plato que gira en el piso y se detiene («moneda que gira»): golpecitos cerámicos que se aceleran y se apagan, 1,2 s
  "plate-spin"(rnd) {
    const len = 1.2;
    const x = buf(len);
    let t = 0;
    let gap = 0.11;
    while (t < len - 0.05) {
      const p = t / len;
      const tap = buf(0.06).map((_, i) => { const u = i / SR; return (Math.sin(TAU * 2350 * u) + 0.5 * Math.sin(TAU * 3790 * u)) * Math.exp(-u * 90); });
      add(x, tap, Math.round(t * SR), 0.35 + 0.4 * p);
      add(x, env(biquad(white(Math.round(0.02 * SR), rnd), "bp", 900, 1.5), (u) => Math.exp(-u * 120)), Math.round(t * SR), 0.25);
      t += gap;
      gap *= 0.86;
      if (gap < 0.012) gap = 0.012;
    }
    // asienta: un golpe final apagado
    add(x, env(biquad(white(Math.round(0.08 * SR), rnd), "lp", 1200), (u) => Math.exp(-u * 40)), Math.round((len - 0.08) * SR), 0.6);
    return x;
  },
};

let seed = 90;
for (const [name, fn] of Object.entries(recipes)) {
  seed++;
  const rnd = mulberry32(6000 + seed);
  writeWav(name, fn(rnd), { fadeMs: 2, peakDb: -1 });
}
