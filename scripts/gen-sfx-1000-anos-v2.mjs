// Efectos de «1000 años» (v2) sintetizados por código (sin licencias).
// WAV 48 kHz, mono, 16 bits, semilla fija → public/videos/03-1000-anos/v2/sfx/
// Uso: node scripts/gen-sfx-1000-anos-v2.mjs
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/03-1000-anos/v2/sfx");
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
  tick(rnd) {
    const x = buf(0.012);
    return env(x.map((_, i) => Math.sin((TAU * 2000 * i) / SR) * 0.7 + (rnd() * 2 - 1) * 0.3), (t) => Math.exp(-t * 380));
  },
  "charger-hum"() {
    const x = buf(3.2);
    return x.map((_, i) => 0.6 * Math.sin((TAU * 100 * i) / SR) + 0.4 * Math.sin((TAU * 200 * i) / SR));
  },
  buzz() {
    const x = buf(0.25);
    return env(x.map((_, i) => Math.sin((TAU * 160 * i) / SR) * (0.5 + 0.5 * Math.sin((TAU * 30 * i) / SR))), (t) => Math.min(1, t / 0.01));
  },
  "power-off"(rnd) {
    const x = buf(0.2);
    add(x, click(rnd, 4, 800), 0, 0.9);
    let ph = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      const f = 2000 * Math.pow(200 / 2000, Math.min(1, t / 0.12));
      ph += (TAU * f) / SR;
      x[i] += 0.5 * Math.sin(ph) * Math.exp(-t * 18);
    }
    return x;
  },
  timewarp(rnd) {
    const x = buf(1.0);
    const n = white(x.length, rnd);
    const swept = biquad(n, "bp", (i) => 200 * Math.pow(15, i / x.length), 1.4);
    add(x, env(swept, (t) => Math.sin(Math.PI * Math.min(1, t / 1.0)) ** 1.5), 0, 1);
    let t = 0.02, gap = 0.12;
    while (t < 0.95) {
      add(x, click(rnd, 2, 2500), Math.round(t * SR), 0.5 * Math.sin(Math.PI * t));
      t += gap; gap = Math.max(0.015, gap * 0.82);
    }
    return x;
  },
  odometer(rnd) {
    const x = buf(0.1);
    for (let k = 0; k < 3; k++) {
      const c = buf(0.012).map((_, i) => Math.sin((TAU * 1800 * i) / SR) * Math.exp(-(i / SR) * 600));
      add(x, c, Math.round(k * 0.025 * SR), 0.6);
      add(x, click(rnd, 3, 2000), Math.round(k * 0.025 * SR), 0.8);
    }
    return x;
  },
  "glass-break"(rnd) {
    const x = buf(1.2);
    add(x, env(biquad(white(Math.round(0.25 * SR), rnd), "hp", 3000), (t) => Math.exp(-t * 22)), 0, 1);
    for (let k = 0; k < 6; k++) {
      const f = 3000 + rnd() * 3000;
      const at = 0.03 + rnd() * 0.55;
      const d = 0.08 + rnd() * 0.12;
      const tk = buf(d * 4).map((_, i) => Math.sin((TAU * f * i) / SR) * Math.exp(-(i / SR) / d));
      add(x, tk, Math.round(at * SR), 0.35 + rnd() * 0.25);
    }
    return x;
  },
  "lamp-fall"(rnd) {
    const x = buf(0.4);
    let ph = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      ph += (TAU * (90 - 40 * Math.min(1, t / 0.15))) / SR;
      x[i] += Math.sin(ph) * Math.exp(-t * 14) * Math.min(1, t / 0.003);
    }
    const metal = buf(0.25).map((_, i) => {
      const t = i / SR;
      return (Math.sin(TAU * 1230 * t) + 0.7 * Math.sin(TAU * 2710 * t) + 0.5 * Math.sin(TAU * 4130 * t)) * Math.exp(-t * 26);
    });
    add(x, metal, Math.round(0.012 * SR), 0.35);
    add(x, click(rnd, 4, 1000), Math.round(0.01 * SR), 0.6);
    return x;
  },
  room(rnd) {
    return biquad(biquad(pink(Math.round(10 * SR), rnd), "lp", 300), "lp", 300);
  },
  wind(rnd) {
    const n = pink(Math.round(26.5 * SR), rnd);
    const lfo = (i) => 0.55 + 0.25 * Math.sin((TAU * 0.11 * i) / SR) + 0.2 * Math.sin((TAU * 0.037 * i) / SR + 1.3);
    const bp = biquad(biquad(n, "hp", 200), "lp", (i) => 700 + 500 * lfo(i));
    return bp.map((v, i) => v * lfo(i));
  },
  rain(rnd) {
    const len = Math.round(8 * SR);
    const base = biquad(white(len, rnd), "hp", 2000);
    const x = base.map((v) => v * 0.35);
    for (let k = 0; k < 900; k++) {
      const at = Math.floor(rnd() * len);
      const g = env(biquad(white(Math.round(0.006 * SR), rnd), "hp", 2500 + rnd() * 3000), (t) => Math.exp(-t * 700));
      add(x, g, at, 0.4 + rnd() * 0.6);
    }
    return x;
  },
  insects(rnd) {
    const x = buf(6.5);
    let t = 0.05;
    while (t < 6.3) {
      const f = 4000 + rnd() * 1000;
      const n = 2 + Math.floor(rnd() * 5);
      for (let k = 0; k < n; k++) {
        const p = buf(0.018).map((_, i) => Math.sin((TAU * f * i) / SR) * Math.sin((Math.PI * i) / (0.018 * SR)));
        add(x, p, Math.round((t + k * 0.035) * SR), 0.5 + rnd() * 0.5);
      }
      t += 0.15 + rnd() * 0.6;
    }
    return x;
  },
  glint() {
    const x = buf(0.3);
    return x.map((_, i) => {
      const t = i / SR;
      const e = Math.min(1, t / 0.01) * Math.exp(-t * 11);
      return e * (Math.sin(TAU * 3000 * t) + 0.35 * Math.sin(TAU * 6000 * t + 0.5) * (1 + Math.sin(TAU * 18 * t)) * 0.5);
    });
  },
  reveal() {
    const x = buf(2.1);
    return x.map((_, i) => {
      const t = i / SR;
      const e = t < 0.2 ? t / 0.2 : Math.exp(-(t - 0.2) / 0.6);
      return e * (0.65 * Math.sin(TAU * 55 * t) + 0.45 * Math.sin(TAU * 110 * t));
    });
  },
};

const only = process.argv.slice(2);
let seed = 1;
for (const [name, fn] of Object.entries(recipes)) {
  seed++;
  if (only.length && !only.includes(name)) continue;
  const rnd = mulberry32(1000 + seed);
  const fadeMs = ["room", "wind", "rain", "insects", "charger-hum"].includes(name) ? 5 : 2;
  writeWav(name, recipes[name](rnd), { fadeMs });
  void fn;
}
