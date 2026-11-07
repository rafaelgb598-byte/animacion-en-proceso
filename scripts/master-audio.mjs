// Masterizado del audio de un MP4 renderizado: ganancia hacia −14 LUFS integrados + limitador con anticipación
// (el ffmpeg de Remotion no trae filtros de dinámica: la ganancia y el limitador se hacen en Node; loudnorm solo mide).
// El video se copia sin recomprimir. Uso: node scripts/master-audio.mjs <entrada.mp4> <salida.mp4> [--lufs -14] [--techo -1.8]
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";

const argv = process.argv.slice(2);
const [input, output] = argv;
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 ? Number(argv[i + 1]) : def;
};
const TARGET = opt("--lufs", -14);
const CEIL_DB = opt("--techo", -1.8);
const SR = 48000;
const isWin = process.platform === "win32";
const ffmpeg = (args, opts = {}) =>
  execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", ...args], { maxBuffer: 1 << 30, shell: isWin, ...opts });

/** Mide con loudnorm (pasada de análisis; el resultado sale por stderr). */
const measureFile = (file) => {
  const r = spawnSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-i", file, "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"], {
    shell: isWin,
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });
  const err = r.stderr ?? "";
  const json = JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1));
  return { i: Number(json.input_i), tp: Number(json.input_tp), lra: Number(json.input_lra) };
};

/** Lee el audio como PCM 16 bits estéreo 48 kHz (vía WAV temporal: este ffmpeg no trae el formato crudo f32le). */
const readPcm = (file, dir) => {
  const wav = path.join(dir, "in.wav");
  ffmpeg(["-loglevel", "error", "-y", "-i", file, "-vn", "-ac", "2", "-ar", String(SR), "-c:a", "pcm_s16le", wav]);
  const b = fs.readFileSync(wav);
  let o = 12;
  while (o < b.length && b.toString("ascii", o, o + 4) !== "data") o += 8 + b.readUInt32LE(o + 4);
  const start = o + 8;
  const n = Math.floor((b.length - start) / 4);
  const L = new Float64Array(n);
  const R = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = b.readInt16LE(start + i * 4) / 32768;
    R[i] = b.readInt16LE(start + i * 4 + 2) / 32768;
  }
  return { L, R, n };
};

/** Mínimo deslizante centrado (deque). */
const slidingMin = (x, half) => {
  const n = x.length;
  const out = new Float64Array(n);
  const dq = [];
  let head = 0;
  for (let i = 0; i < n + half; i++) {
    if (i < n) {
      while (dq.length > head && x[dq[dq.length - 1]] >= x[i]) dq.pop();
      dq.push(i);
    }
    const c = i - half;
    if (c >= 0) {
      while (dq[head] < c - half) head++;
      out[c] = x[dq[head]];
    }
  }
  return out;
};

/** Limitador estéreo enlazado: anticipación de `lookMs`, relajación de `relMs`, techo en dBFS. */
const limit = (L, R, ceilDb, lookMs = 3, relMs = 80) => {
  const n = L.length;
  const ceil = Math.pow(10, ceilDb / 20);
  const la = Math.max(1, Math.round((lookMs / 1000) * SR));
  const req = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    req[i] = p > ceil ? ceil / p : 1;
  }
  const m = slidingMin(req, la);
  // promedio móvil (≤ requerido en cada muestra, porque cada mínimo cubre la ventana del promedio)
  const half = Math.floor(la / 2);
  const g = new Float64Array(n);
  let acc = 0;
  for (let i = 0; i < n + half; i++) {
    if (i < n) acc += m[i];
    if (i - la >= 0) acc -= m[i - la];
    const c = i - half;
    if (c >= 0 && c < n) g[c] = acc / Math.min(la, i + 1);
  }
  const rel = 1 - Math.exp(-1 / ((relMs / 1000) * SR));
  let prev = 1;
  let reduced = 0;
  for (let i = 0; i < n; i++) {
    const target = Math.min(g[i], req[i]);
    prev = target < prev ? target : prev + rel * (1 - prev);
    if (prev > target) prev = target;
    if (prev < 0.999) reduced++;
    L[i] *= prev;
    R[i] *= prev;
  }
  return reduced / n;
};

const writeWav = (file, L, R) => {
  const n = L.length;
  const data = Buffer.alloc(n * 4 * 2);
  for (let i = 0; i < n; i++) {
    data.writeFloatLE(L[i], i * 8);
    data.writeFloatLE(R[i], i * 8 + 4);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "master-"));
try {
  const before = measureFile(input);
  console.log(`entrada: ${before.i.toFixed(1)} LUFS, pico real ${before.tp.toFixed(1)} dBTP, LRA ${before.lra.toFixed(1)}`);
  const src = readPcm(input, tmp);
  let gainDb = TARGET - before.i;
  let result = before;
  const wav = path.join(tmp, "master.wav");
  for (let pass = 0; pass < 4; pass++) {
    const k = Math.pow(10, gainDb / 20);
    const L = src.L.map((v) => v * k);
    const R = src.R.map((v) => v * k);
    const red = limit(L, R, CEIL_DB);
    writeWav(wav, L, R);
    result = measureFile(wav);
    console.log(`pasada ${pass + 1}: ganancia ${gainDb.toFixed(2)} dB → ${result.i.toFixed(2)} LUFS, ${result.tp.toFixed(2)} dBTP (limitador activo ${(100 * red).toFixed(2)} % del tiempo)`);
    if (Math.abs(result.i - TARGET) < 0.3) break;
    gainDb += TARGET - result.i;
  }
  ffmpeg(["-loglevel", "error", "-y", "-i", input, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", String(SR), "-shortest", output]);
  const fin = measureFile(output);
  console.log(`salida: ${output} · ${fin.i.toFixed(1)} LUFS, pico real ${fin.tp.toFixed(1)} dBTP`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
