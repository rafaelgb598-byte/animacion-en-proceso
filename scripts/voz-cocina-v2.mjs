// Arma la voz de «1000 años · Cocina v2» a partir de las tomas crudas del plugin de ElevenLabs (0 créditos):
//   1. pasa la toma elegida de cada frase a WAV 48 kHz mono;
//   2. compresión leve (3:1 sobre −22 dBFS, ataque 3 ms, relajación 60 ms) y nivelado de todas las frases al mismo volumen
//      de habla (RMS de la parte con voz → −17 dBFS, pico ≤ −1 dBFS): mastering suave, para que el limitador final casi no trabaje;
//   3. escribe src/videos/04-1000-anos-cocina/v2/episodes/cocina.voz.json con el texto del guion y los tiempos de Scribe,
//      y la duración real (fin de la energía de la voz), e informa si alguna frase no entra en su ventana.
// Uso: node scripts/voz-cocina-v2.mjs [--tomas v01=t1,v10=t2]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";

const ORIG = "guiones/MilAños/04-1000-anos-cocina/v2/voz-original";
const PUB = "public/videos/04-1000-anos-cocina/v2/voz";
const OUT = "src/videos/04-1000-anos-cocina/v2/episodes/cocina.voz.json";
const SR = 48000;
const FPS = 30;
const TARGET_RMS_DB = -17;
const COMP = { thresholdDb: -22, ratio: 3, attackMs: 3, releaseMs: 60 };

/** Compresor simple (detector de pico con ataque y relajación). */
const compress = (x) => {
  const thr = Math.pow(10, COMP.thresholdDb / 20);
  const a = Math.exp(-1 / ((COMP.attackMs / 1000) * SR));
  const r = Math.exp(-1 / ((COMP.releaseMs / 1000) * SR));
  let env = 0;
  return x.map((v) => {
    const lvl = Math.abs(v);
    env = lvl > env ? a * env + (1 - a) * lvl : r * env + (1 - r) * lvl;
    const g = env > thr ? Math.pow(env / thr, 1 / COMP.ratio - 1) : 1;
    return v * g;
  });
};
const PEAK_DB = -1;
const isWin = process.platform === "win32";

const argv = process.argv.slice(2);
const ti = argv.indexOf("--tomas");
const elegidas = { v01: "t1", v10: "t2", ...Object.fromEntries((ti >= 0 ? argv[ti + 1] : "").split(",").filter(Boolean).map((s) => s.split("="))) };

const ts = fs.readFileSync("src/videos/04-1000-anos-cocina/v2/episodes/cocina.ts", "utf8");
const bloque = ts.slice(ts.indexOf("export const VOICE_TEXT"), ts.indexOf("};", ts.indexOf("export const VOICE_TEXT")));
const textos = Object.fromEntries([...bloque.matchAll(/(v\d\d): "([^"]+)"/g)].map((m) => [m[1], m[2]]));
const tl = fs.readFileSync("src/videos/04-1000-anos-cocina/v2/episodes/cocina.timeline.ts", "utf8");
const vb = tl.slice(tl.indexOf("export const VOICE_WINDOWS"), tl.indexOf("} as const", tl.indexOf("export const VOICE_WINDOWS")));
const ventanas = Object.fromEntries([...vb.matchAll(/(v\d\d): \[(\d+), (\d+)\]/g)].map((m) => [m[1], [Number(m[2]), Number(m[3])]]));

const readWav = (file) => {
  const b = fs.readFileSync(file);
  let o = 12;
  while (b.toString("ascii", o, o + 4) !== "data") o += 8 + b.readUInt32LE(o + 4);
  o += 8;
  const n = Math.floor((b.length - o) / 2);
  return Float64Array.from({ length: n }, (_, i) => b.readInt16LE(o + i * 2) / 32768);
};
const writeWav = (file, x) => {
  const data = Buffer.alloc(x.length * 2);
  for (let i = 0; i < x.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
};

fs.mkdirSync(PUB, { recursive: true });
const out = {};
const informe = [];
for (const id of Object.keys(textos)) {
  const toma = elegidas[id] ?? "t1";
  const base = path.join(ORIG, `${id}-${toma}`);
  const tmp = path.join(PUB, `${id}.tmp.wav`);
  execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", `${base}.mp3`, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", tmp], { shell: isWin });
  const raw = readWav(tmp);
  fs.unlinkSync(tmp);
  // pre-nivelado al pico (−3 dBFS) para que el umbral del compresor actúe igual en todas las tomas
  const pre = raw.reduce((p, v) => Math.max(p, Math.abs(v)), 0);
  const x = compress(raw.map((v) => (v * Math.pow(10, -3 / 20)) / pre));
  // energía por bloques de 10 ms: dónde hay voz
  const blk = SR / 100;
  const th = Math.pow(10, -38 / 20);
  let first = -1, last = -1, sum = 0, cnt = 0;
  for (let i = 0; i < x.length; i += blk) {
    let s = 0;
    for (let j = i; j < Math.min(x.length, i + blk); j++) s += x[j] * x[j];
    if (Math.sqrt(s / blk) > th) {
      if (first < 0) first = i;
      last = Math.min(x.length, i + blk);
      sum += s;
      cnt += blk;
    }
  }
  const rms = Math.sqrt(sum / cnt);
  let g = Math.pow(10, TARGET_RMS_DB / 20) / rms;
  const peak = x.reduce((p, v) => Math.max(p, Math.abs(v)), 0);
  g = Math.min(g, Math.pow(10, PEAK_DB / 20) / peak);
  writeWav(path.join(PUB, `${id}.wav`), x.map((v) => v * g));
  const sc = JSON.parse(fs.readFileSync(`${base}.words.json`, "utf8")).palabras;
  const palabras = textos[id].split(" ");
  if (palabras.length !== sc.length) throw new Error(`${id}: el guion tiene ${palabras.length} palabras y Scribe ${sc.length}`);
  const dur = last / SR;
  out[id] = {
    estimado: false,
    archivo: `videos/04-1000-anos-cocina/v2/voz/${id}.wav`,
    toma,
    duracion: +dur.toFixed(3),
    palabras: palabras.map((t, k) => ({ t, s: sc[k].s, e: Math.min(sc[k].e, dur) })),
  };
  const [a, b] = ventanas[id];
  const ventana = (b - a) / FPS;
  informe.push(`${id} ${toma}  voz ${dur.toFixed(2)} s / ventana ${ventana.toFixed(2)} s  ganancia ${(20 * Math.log10(g)).toFixed(1)} dB  ${dur <= ventana ? "entra" : "NO ENTRA"}`);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(informe.join("\n"));
