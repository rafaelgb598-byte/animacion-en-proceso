// Efectos NUEVOS de la V3 (1000 años · celular) sintetizados por código (sin licencias).
// WAV 48 kHz, mono, 16 bits, semilla fija → public/videos/03-1000-anos/final/sfx/
// Uso: node scripts/gen-sfx-1000-anos-final.mjs
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/03-1000-anos/final/sfx");
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

// ---------- recetas (sección 9) ----------
const recipes = {
  // motivo de la foto: dos senos suaves (660 → 880 Hz), 400 ms
  "photo-motif"() {
    const x = buf(0.9);
    for (const [f, at] of [[660, 0], [880, 0.16]]) {
      const n = buf(0.7).map((_, i) => {
        const t = i / SR;
        return (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)) * Math.min(1, t / 0.02) * Math.exp(-t * 5);
      });
      add(x, n, Math.round(at * SR), 0.6);
    }
    return x;
  },
  // pérdida de datos: tren de clics de bits que se espacia y baja de 4 kHz a 800 Hz, 2 s
  "data-loss"(rnd) {
    const x = buf(2.0);
    let t = 0.01, gap = 0.012;
    while (t < 1.95) {
      const p = t / 2;
      const f = 4000 * Math.pow(800 / 4000, p);
      const n = Math.round(0.006 * SR);
      const c = buf(0.006).map((_, i) => Math.sign(Math.sin((TAU * f * i) / SR)) * Math.exp(-(i / n) * 4));
      add(x, c, Math.round(t * SR), (0.35 + 0.3 * rnd()) * (1 - 0.6 * p));
      t += gap * (0.6 + rnd() * 0.8);
      gap *= 1.045;
    }
    return biquad(x, "lp", 6000);
  },
  // crujido de madera: ruido filtrado con resonancias 180 y 320 Hz, 600 ms
  "wood-creak"(rnd) {
    const n = white(Math.round(0.6 * SR), rnd);
    const a = biquad(n, "bp", (i) => 180 + 40 * Math.sin((TAU * 7 * i) / SR), 12);
    const b = biquad(n, "bp", 320, 10);
    return env(a.map((v, i) => v + 0.7 * b[i]), (t) => Math.min(1, t / 0.05) * Math.exp(-t * 4) * (0.6 + 0.4 * Math.sin(TAU * 23 * t)));
  },
  // golpe de panel: seno 70 Hz + ruido, 200 ms
  "panel-thud"(rnd) {
    const x = buf(0.3);
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      x[i] = Math.sin(TAU * (70 - 25 * Math.min(1, t / 0.2)) * t) * Math.exp(-t * 16) * Math.min(1, t / 0.004);
    }
    add(x, env(biquad(white(Math.round(0.12 * SR), rnd), "lp", 900), (t) => Math.exp(-t * 30)), 0, 0.5);
    return x;
  },
  // tierra: ruido rosa filtrado a 1,5 kHz con granos, 1 s
  soil(rnd) {
    const len = Math.round(1.0 * SR);
    const x = biquad(pink(len, rnd), "lp", 1500).map((v) => v * 0.4);
    for (let k = 0; k < 160; k++) {
      const g = env(biquad(white(Math.round(0.004 * SR), rnd), "bp", 1200 + rnd() * 2000, 2), (t) => Math.exp(-t * 900));
      add(x, g, Math.floor(rnd() * (len - 400)), 0.3 + rnd() * 0.5);
    }
    return env(x, (t) => Math.sin(Math.PI * Math.min(1, t)));
  },
  // clic seco del vidrio al levantarse: 3 kHz, 15 ms
  "glass-tick"(rnd) {
    const x = buf(0.03);
    add(x, buf(0.015).map((_, i) => Math.sin((TAU * 3000 * i) / SR) * Math.exp(-(i / SR) * 260)), 0, 0.8);
    add(x, click(rnd, 2, 3000), 0, 0.5);
    return x;
  },
};

let seed = 50;
for (const [name, fn] of Object.entries(recipes)) {
  seed++;
  const rnd = mulberry32(2000 + seed);
  writeWav(name, fn(rnd), { fadeMs: 2 });
}
