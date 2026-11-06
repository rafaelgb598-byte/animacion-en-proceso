// Recetas nuevas para el Short Stroop (no toca las existentes). 48 kHz · mono · 16 bit.
// Tic de tarjeta: seno de 12 ms; ronda 1 a 1,6 kHz suave; ronda 2 sube de 1,6 a 2,6 kHz tarjeta a tarjeta.
// Uso: node scripts/gen-sfx-stroop.mjs
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import console from "node:console";

const SR = 48000;
const OUT = join(process.cwd(), "public", "stroop", "sfx");
mkdirSync(OUT, { recursive: true });

const writeWav = (name, data) => {
  const bytes = 44 + data.length * 2;
  const b = Buffer.alloc(bytes);
  b.write("RIFF", 0);
  b.writeUInt32LE(bytes - 8, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i])) * 32767), 44 + i * 2);
  writeFileSync(join(OUT, name), b);
};

/** tic: seno de 12 ms con ataque de 1 ms y caída exponencial; pico −1 dBFS */
const tick = (freq) => {
  const n = Math.round(0.012 * SR);
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.001) * Math.exp(-t / 0.004);
    d[i] = Math.sin(2 * Math.PI * freq * t) * env;
  }
  let peak = 0;
  for (const v of d) peak = Math.max(peak, Math.abs(v));
  const g = 10 ** (-1 / 20) / peak;
  for (let i = 0; i < n; i++) d[i] *= g;
  return d;
};

writeWav("tic-r1.wav", tick(1600));
for (let k = 0; k < 8; k++) writeWav(`tic-r2-${k + 1}.wav`, tick(1600 + (1000 * k) / 7));
// V2: niveles 2 y 3 (9 tarjetas incongruentes), de 1,6 a 2,6 kHz
for (let k = 0; k < 9; k++) writeWav(`tic-v2-${k + 1}.wav`, tick(1600 + (1000 * k) / 8));
console.log("tics escritos en public/stroop/sfx");
