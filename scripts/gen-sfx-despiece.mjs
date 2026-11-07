// Efectos del canal Despiece, sintetizados por código (sin licencias, sin música). Utilidades copiadas de
// el generador del viejo canal Ciberseguridad (borrado). WAV 48 kHz, mono, 16 bits, semilla fija.
// Salida: public/videos/despiece/sfx/ (compartidos por todos los episodios) · lista en src/canales/despiece/marca/sfx.ts
// Uso: node scripts/gen-sfx-despiece.mjs
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/despiece/sfx");
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

const sine = (sec, f, amp = 1, ph = 0) => buf(sec).map((_, i) => amp * Math.sin(ph + TAU * (typeof f === "function" ? f(i / SR) : f) * (i / SR)));

// metal: suma de parciales inarmónicos con caída exponencial
const metal = (sec, f0, ratios, decay, amp = 1) => {
  const x = buf(sec);
  ratios.forEach(([r, a], k) => add(x, env(sine(sec, f0 * r, a * amp), (t) => Math.exp(-t * decay * (1 + k * 0.35)))));
  return x;
};

const recipes = {
  // la línea de corte: zumbido filtrado que sube de tono (1,0 s)
  corte(rnd) {
    const sec = 1.0;
    const n = white(Math.round(sec * SR), rnd);
    const x = env(biquad(n, "bp", (i) => 900 + 2600 * (i / (sec * SR)), 6), (t) => Math.min(1, t / 0.08) * (0.55 + 0.45 * (t / sec)));
    add(x, env(sine(sec, (t) => 180 + 120 * t, 0.12), (t) => Math.min(1, t / 0.1)));
    return x;
  },
  // apertura: soplo de aire + clic seco (0,5 s)
  apertura(rnd) {
    const x = buf(0.5);
    add(x, env(biquad(pink(Math.round(0.5 * SR), rnd), "bp", 700, 0.8), (t) => Math.exp(-Math.pow((t - 0.12) / 0.09, 2))), 0, 0.9);
    add(x, click(rnd, 4, 1800), Math.round(0.03 * SR), 0.7);
    add(x, metal(0.3, 520, [[1, 0.5], [2.76, 0.25]], 30), Math.round(0.03 * SR), 0.4);
    return x;
  },
  // trazo: tic de lápiz sobre papel (0,12 s)
  trazo(rnd) {
    const x = buf(0.12);
    add(x, env(biquad(white(Math.round(0.12 * SR), rnd), "bp", 3800, 1.2), (t) => Math.exp(-t * 60)), 0, 0.6);
    return x;
  },
  // tic: perno que se asienta (metálico, corto, 0,14 s)
  tic(rnd) {
    const x = buf(0.14);
    add(x, click(rnd, 2, 3000), 0, 0.8);
    add(x, metal(0.14, 2400, [[1, 0.6], [1.58, 0.35], [2.31, 0.2]], 55), 0, 0.7);
    return x;
  },
  // llave: roce metálico (0,9 s) con microgolpes de los dientes
  llave(rnd) {
    const sec = 0.9;
    const x = env(biquad(white(Math.round(sec * SR), rnd), "bp", 5200, 2.5), (t) => 0.35 * Math.sin(Math.PI * Math.min(1, t / sec)));
    for (let k = 0; k < 7; k++) add(x, metal(0.06, 3100 + 180 * k, [[1, 0.5], [1.7, 0.3]], 90), Math.round((0.08 + k * 0.11) * SR), 0.5);
    return x;
  },
  // destello: campanita brillante (0,9 s)
  destello() {
    const x = buf(0.9);
    for (const [f, a, d] of [[1568, 0.4, 5], [2093, 0.3, 6], [3136, 0.18, 8]]) add(x, env(sine(0.9, f, a), (t) => Math.min(1, t / 0.01) * Math.exp(-t * d)));
    return x;
  },
  // clac: el rotor gira y traba (0,35 s)
  clac(rnd) {
    const x = buf(0.35);
    add(x, click(rnd, 5, 900), 0, 1);
    add(x, metal(0.35, 210, [[1, 0.8], [2.4, 0.4], [4.1, 0.2]], 18), 0, 0.9);
    add(x, click(rnd, 3, 2000), Math.round(0.045 * SR), 0.6);
    return x;
  },
  // rebote: intenta girar, golpe apagado y vuelve (0,45 s)
  rebote(rnd) {
    const x = buf(0.45);
    add(x, metal(0.3, 160, [[1, 0.9], [2.2, 0.35]], 26), 0, 1);
    add(x, env(biquad(white(Math.round(0.05 * SR), rnd), "lp", 700), (t) => Math.exp(-t * 80)), 0, 0.8);
    add(x, metal(0.2, 150, [[1, 0.5], [2.2, 0.2]], 34), Math.round(0.16 * SR), 0.5);
    return x;
  },
  // chip: pop suave del aviso (0,25 s)
  chip() {
    const x = buf(0.25);
    add(x, env(sine(0.25, (t) => 660 + 500 * Math.min(1, t / 0.05), 0.6), (t) => Math.min(1, t / 0.005) * Math.exp(-t * 18)));
    return x;
  },
  // whoosh: el corte que abre la cerradura en el gancho (0,4 s): soplo que barre de grave a agudo + chasquido final
  whoosh(rnd) {
    const sec = 0.4;
    const n = Math.round(sec * SR);
    const x = env(biquad(pink(n, rnd), "bp", (i) => 300 + 4200 * Math.pow(i / n, 1.6), 1.4), (t) => Math.sin(Math.PI * Math.min(1, t / sec)) ** 1.5);
    add(x, click(rnd, 3, 2500), Math.round(0.3 * SR), 0.5);
    return x;
  },
  // bzz: la llave incorrecta, zumbido metálico seco (0,35 s)
  bzz() {
    const sec = 0.35;
    const x = buf(sec);
    // diente de sierra a 110 Hz con armónicos ásperos, recortado
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      const saw = 2 * ((t * 110) % 1) - 1;
      x[i] = Math.tanh(3 * saw) * 0.5 * Math.min(1, t / 0.01) * Math.exp(-t * 6);
    }
    const b = biquad(x, "bp", 1400, 0.9);
    add(b, metal(0.2, 180, [[1, 0.6], [2.2, 0.3]], 30), 0, 0.6);
    return b;
  },
  // ambiente: ruido rosa pasabajos 300 Hz (40 s)
  ambiente(rnd) {
    const n = Math.round(40 * SR);
    return biquad(biquad(pink(n, rnd), "lp", 300), "lp", 300);
  },
};

for (const [i, [name, fn]] of Object.entries(recipes).entries()) {
  const rnd = mulberry32(0xde5b1 + i * 97);
  writeWav(name, fn(rnd), { fadeMs: name === "ambiente" ? 400 : 3, peakDb: name === "ambiente" ? -6 : -1 });
}

// tics crecientes: cada columna un poco más aguda y más fuerte que la anterior (la progresión termina en el clac)
for (let k = 0; k < 5; k++) {
  const rnd = mulberry32(0x71c0 + k * 31);
  const x = buf(0.16);
  add(x, click(rnd, 2, 3000), 0, 0.8);
  add(x, metal(0.16, 1900 * Math.pow(1.12, k), [[1, 0.6], [1.58, 0.35], [2.31, 0.2]], 50), 0, 0.7);
  writeWav(`tic${k + 1}`, x, { fadeMs: 3, peakDb: -7 + k * 1.5 });
}
// clac fuerte: el giro de frente (más grave y con más cuerpo que el clac)
{
  const rnd = mulberry32(0xc1ac);
  const x = buf(0.5);
  add(x, click(rnd, 6, 700), 0, 1);
  add(x, metal(0.5, 150, [[1, 1], [2.4, 0.5], [4.1, 0.25]], 12), 0, 1);
  add(x, env(biquad(white(Math.round(0.08 * SR), rnd), "lp", 500), (t) => Math.exp(-t * 40)), 0, 0.9);
  add(x, click(rnd, 3, 2000), Math.round(0.05 * SR), 0.7);
  writeWav("clac-fuerte", x, { fadeMs: 3, peakDb: -0.5 });
}
