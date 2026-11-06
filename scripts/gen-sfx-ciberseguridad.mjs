// Efectos de la serie «Anatomía de una estafa» (canal Ciberseguridad), sintetizados por código (sin licencias).
// WAV 48 kHz, mono, 16 bits, semilla fija → public/videos/ciberseguridad/sfx/ (compartidos por todos los episodios)
// Uso: node scripts/gen-sfx-ciberseguridad.mjs   ·   formas de onda: node scripts/qa-wave-png.mjs public/videos/ciberseguridad/sfx videosPrueba/Ciberseguridad/qa/01-codigo-por-error/sfx-ondas
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const SR = 48000;
const OUT = path.resolve("public/videos/ciberseguridad/sfx");
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
/** seno con frecuencia variable (fase integrada, sin saltos) */
function sweep(sec, f0, f1, curve = 1) {
  const x = buf(sec);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / x.length;
    ph += (TAU * (f0 + (f1 - f0) * Math.pow(t, curve))) / SR;
    x[i] = Math.sin(ph);
  }
  return x;
}

// ---------- recetas (prompt 01, § 9) ----------
const DUR_VIDEO_S = 40; // loop exacto de la duración del video (1.200 frames a 30 fps)
const recipes = {
  // SMS y burbujas: dos senos 1.320 / 1.760 Hz, 70 ms, caída rápida
  notif() {
    const x = buf(0.07);
    add(x, sine(0.07, 1320, 0.6));
    add(x, sine(0.07, 1760, 0.4));
    return env(x, (t) => Math.min(1, t / 0.003) * Math.exp(-t * 55));
  },
  // «escribiendo…»: clics suaves irregulares, 0,6 s
  typing(rnd) {
    const x = buf(0.6);
    let t = 0.02;
    while (t < 0.56) {
      add(x, click(rnd, 4, 2200), Math.round(t * SR), 0.35 + rnd() * 0.4);
      t += 0.05 + rnd() * 0.08;
    }
    return biquad(x, "lp", 6000);
  },
  // toque del dedo: clic seco 8 ms
  tap(rnd) {
    const x = buf(0.012);
    add(x, env(biquad(white(Math.round(0.008 * SR), rnd), "bp", 2400, 1.2), (t) => Math.exp(-t * 700)));
    add(x, env(sine(0.008, 180, 0.5), (t) => Math.exp(-t * 600)));
    return x;
  },
  // envío: barrido de ruido 600 Hz → 3 kHz, 180 ms
  send(rnd) {
    const n = Math.round(0.18 * SR);
    const x = biquad(white(n, rnd), "bp", (i) => 600 + (3000 - 600) * (i / n), 2.2);
    return env(x, (t) => Math.sin(Math.PI * Math.min(1, t / 0.18)) ** 1.5);
  },
  // cuenta perdida: seno 140 Hz modulado + clic, 400 ms
  alert(rnd) {
    const x = buf(0.4);
    add(x, env(sine(0.4, 140), (t) => (0.6 + 0.4 * Math.sin(TAU * 9 * t)) * Math.exp(-t * 4.5)));
    add(x, click(rnd, 5, 900), 0, 0.6);
    return x;
  },
  // rebobinado: ruido filtrado con barrido descendente + tren de clics que desacelera, 1,2 s
  rewind(rnd) {
    const sec = 1.2;
    const n = Math.round(sec * SR);
    const x = env(biquad(pink(n, rnd), "bp", (i) => 4200 - 3600 * (i / n), 1.4), (t) => Math.min(1, t / 0.05) * Math.min(1, (sec - t) / 0.2) * 0.8);
    let t = 0.02;
    let gap = 0.025;
    while (t < sec - 0.05) {
      add(x, click(rnd, 3, 2500), Math.round(t * SR), 0.5);
      t += gap;
      gap *= 1.12;
    }
    return x;
  },
  // marcador: golpe de plástico sobre la mesa — seno 220 Hz + ruido corto, 90 ms
  marker(rnd) {
    const x = buf(0.09);
    add(x, env(sweep(0.09, 260, 200), (t) => Math.exp(-t * 45)));
    add(x, env(biquad(white(Math.round(0.02 * SR), rnd), "bp", 1800, 0.9), (t) => Math.exp(-t * 260)), 0, 0.6);
    return x;
  },
  // línea que une los teléfonos: seno 880 Hz con glissando, 300 ms
  link() {
    return env(sweep(0.3, 760, 980, 0.7), (t) => Math.min(1, t / 0.02) * Math.exp(-t * 7));
  },
  // nodo del grafo: pop de 600–1.200 Hz
  spread(rnd) {
    const f0 = 600 + rnd() * 600;
    return env(sweep(0.06, f0 * 1.25, f0), (t) => Math.min(1, t / 0.002) * Math.exp(-t * 70));
  },
  // interruptor: dos clics de 20 ms
  toggle(rnd) {
    const x = buf(0.11);
    for (const [at, hp] of [[0, 1800], [0.075, 2600]]) {
      const c = env(biquad(white(Math.round(0.02 * SR), rnd), "hp", hp), (t) => Math.exp(-t * 300));
      add(x, c, Math.round(at * SR), at ? 0.8 : 1);
    }
    return x;
  },
  // candado: clic metálico grave
  lock(rnd) {
    const x = buf(0.22);
    add(x, env(biquad(white(Math.round(0.03 * SR), rnd), "bp", 1200, 3), (t) => Math.exp(-t * 160)));
    for (const [f, a] of [[310, 0.5], [740, 0.3], [1460, 0.15]]) add(x, env(sine(0.22, f, a), (t) => Math.exp(-t * 22)), Math.round(0.004 * SR));
    return x;
  },
  // ambiente: ruido rosa pasabajos 350 Hz, loop exacto de la duración del video (fundido cruzado fin → inicio)
  room(rnd) {
    const n = Math.round(DUR_VIDEO_S * SR);
    const xf = Math.round(1.5 * SR);
    const raw = biquad(biquad(pink(n + xf, rnd), "lp", 350), "lp", 350);
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = raw[i];
    // las primeras muestras se mezclan con la cola: el último sample empalma con el primero
    for (let i = 0; i < xf; i++) {
      const g = i / xf;
      x[i] = raw[n + i] * (1 - g) + raw[i] * g;
    }
    return x;
  },
};

for (const [i, [name, fn]] of Object.entries(recipes).entries()) {
  const rnd = mulberry32(0xc1be5 + i * 101);
  // el ambiente no lleva fundido en los extremos (es un loop); los demás, 2–5 ms
  writeWav(name, fn(rnd), { fadeMs: name === "room" ? 0 : 3, peakDb: name === "room" ? -6 : -1 });
}
