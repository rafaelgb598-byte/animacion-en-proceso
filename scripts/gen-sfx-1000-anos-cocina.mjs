// Efectos NUEVOS de «1000 años» · Cocina (episodio 2), sintetizados por código (sin licencias, sin música).
// WAV 48 kHz, mono, 16 bits, semilla fija → public/videos/04-1000-anos-cocina/sfx/
// Utilidades copiadas de gen-sfx-1000-anos-final.mjs. Uso: node scripts/gen-sfx-1000-anos-cocina.mjs
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/04-1000-anos-cocina/sfx");
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

// ---------- recetas (sección 8 del prompt) ----------
const recipes = {
  // motor de la heladera: ~100 Hz + armónicos, 2,0 s que se repiten sin costura (ciclos enteros, AM de 0,5 Hz)
  "fridge-hum"(rnd) {
    const len = 2.0;
    const x = buf(len);
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      const am = 0.85 + 0.15 * Math.sin(TAU * 0.5 * t);
      x[i] = am * (Math.sin(TAU * 100 * t) + 0.5 * Math.sin(TAU * 200 * t) + 0.28 * Math.sin(TAU * 300 * t) + 0.12 * Math.sin(TAU * 400 * t) + 0.18 * Math.sin(TAU * 50 * t));
    }
    // un poco de ruido de ventilador, con cruce para que el loop no haga clic
    const n = biquad(pink(x.length + SR / 5, rnd), "lp", 500);
    const xf = SR / 5;
    for (let i = 0; i < x.length; i++) {
      const v = i < xf ? n[i] * (i / xf) + n[x.length + i] * (1 - i / xf) : n[i];
      x[i] += 0.35 * v;
    }
    return x;
  },
  // tic de reloj de pared: clic de madera (ruido a 2,5 kHz) + resonancia corta a 1,2 kHz, 120 ms
  "clock-tick"(rnd) {
    const x = buf(0.12);
    add(x, env(biquad(white(Math.round(0.008 * SR), rnd), "bp", 2500, 1.5), (t) => Math.exp(-t * 500)), 0, 1);
    add(x, sine(0.06, 1200, 90), 0, 0.5);
    add(x, sine(0.04, 3100, 160), Math.round(0.002 * SR), 0.2);
    return x;
  },
  // moscas: tres zumbidos (~210–260 Hz) con vibrato errático que van y vienen, filtrados; 4 s (muy bajo en la mezcla)
  flies(rnd) {
    const len = 4.0;
    const x = buf(len);
    for (const [f0, ph, pan] of [[214, 0.3, 1], [238, 1.7, 0.8], [261, 3.1, 0.6]]) {
      let phase = 0, drift = 0;
      for (let i = 0; i < x.length; i++) {
        const t = i / SR;
        drift += (rnd() - 0.5) * 0.002; drift *= 0.9995;
        const f = f0 * (1 + 0.04 * Math.sin(TAU * 7 * t + ph) + drift * 4);
        phase += (TAU * f) / SR;
        const saw = ((phase / TAU) % 1) * 2 - 1;
        const near = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * ((t / len + ph / 7) % 1)), 2);
        x[i] += saw * near * pan;
      }
    }
    return env(biquad(biquad(x, "bp", 700, 0.8), "lp", 2500), (t) => Math.min(1, t / 0.3, (len - t) / 0.3));
  },
  // alacena que cae: crujido seco + golpe grave (55 → 35 Hz) + madera y polvo que se acomodan, 1,3 s
  "cupboard-crash"(rnd) {
    const len = 1.3;
    const x = buf(len);
    add(x, env(biquad(white(Math.round(0.05 * SR), rnd), "hp", 300), (t) => Math.exp(-t * 60)), 0, 0.7);
    const thud = buf(0.9).map((_, i) => { const t = i / SR; return Math.sin(TAU * (55 - 20 * Math.min(1, t / 0.5)) * t) * Math.exp(-t * 7) * Math.min(1, t / 0.003); });
    add(x, thud, Math.round(0.01 * SR), 1.0);
    add(x, env(biquad(pink(Math.round(0.6 * SR), rnd), "lp", 600), (t) => Math.exp(-t * 9)), Math.round(0.01 * SR), 0.9);
    for (let k = 0; k < 40; k++) {
      const at = 0.05 + Math.pow(rnd(), 1.6) * 1.0;
      const g = env(biquad(white(Math.round(0.006 * SR), rnd), "bp", 500 + rnd() * 2500, 2), (t) => Math.exp(-t * 600));
      add(x, g, Math.round(at * SR), (0.25 + rnd() * 0.35) * Math.exp(-at * 2));
    }
    return x;
  },
  // ruido grave del techo que cae: retumbo + golpes escalonados + cascotes, 2,6 s
  "roof-collapse"(rnd) {
    const len = 2.6;
    const x = buf(len);
    const rumble = biquad(biquad(pink(x.length, rnd), "lp", 180), "lp", 260);
    add(x, env(rumble, (t) => Math.min(1, t / 0.08) * Math.exp(-t * 1.4)), 0, 2.2);
    for (const [at, f, g] of [[0.0, 62, 1], [0.22, 75, 0.7], [0.41, 58, 0.8], [0.7, 85, 0.5], [1.05, 66, 0.4]]) {
      const th = buf(0.5).map((_, i) => { const t = i / SR; return Math.sin(TAU * (f - 18 * Math.min(1, t / 0.3)) * t) * Math.exp(-t * 11) * Math.min(1, t / 0.003); });
      add(x, th, Math.round(at * SR), g);
    }
    for (let k = 0; k < 120; k++) {
      const at = Math.pow(rnd(), 1.3) * 2.2;
      const gr = env(biquad(white(Math.round(0.008 * SR), rnd), "bp", 300 + rnd() * 1800, 1.5), (t) => Math.exp(-t * 400));
      add(x, gr, Math.round(at * SR), (0.2 + rnd() * 0.4) * Math.exp(-at * 1.2));
    }
    return x;
  },
  // papel que cae en el agua del piso: chapoteo suave + gotitas, 450 ms
  "paper-splash"(rnd) {
    const x = buf(0.45);
    add(x, env(biquad(white(Math.round(0.25 * SR), rnd), "bp", 1400, 0.9), (t) => Math.min(1, t / 0.004) * Math.exp(-t * 22)), 0, 0.9);
    for (let k = 0; k < 5; k++) {
      const f0 = 900 + rnd() * 900;
      const d = buf(0.05).map((_, i) => { const t = i / SR; return Math.sin(TAU * (f0 + 2200 * t) * t) * Math.exp(-t * 90); });
      add(x, d, Math.round((0.05 + rnd() * 0.3) * SR), 0.25);
    }
    return x;
  },
};

// tres tintineos cerámicos distintos: parciales inarmónicos con caídas rápidas + astillado, 350 ms
for (const [name, base] of [["ceramic-a", 2300], ["ceramic-b", 2750], ["ceramic-c", 2050]]) {
  recipes[name] = (rnd) => {
    const x = buf(0.35);
    for (const [ratio, amp, dec] of [[1, 1, 28], [1.61, 0.7, 34], [2.23, 0.5, 40], [2.97, 0.35, 48], [3.8, 0.2, 60]]) {
      add(x, sine(0.35, base * ratio * (1 + (rnd() - 0.5) * 0.02), dec, rnd() * TAU), 0, amp);
    }
    add(x, env(biquad(white(Math.round(0.03 * SR), rnd), "hp", 4000), (t) => Math.exp(-t * 160)), 0, 1.2);
    for (let k = 0; k < 6; k++) add(x, click(rnd, 2, 3000), Math.round((0.03 + rnd() * 0.2) * SR), 0.3 + rnd() * 0.3);
    return x;
  };
}

let seed = 70;
for (const [name, fn] of Object.entries(recipes)) {
  seed++;
  const rnd = mulberry32(4000 + seed);
  const loopable = name === "fridge-hum";
  writeWav(name, fn(rnd), { fadeMs: loopable ? 0.01 : name === "flies" ? 30 : 2, peakDb: -1 });
}
