// Voz de un episodio de Ciberseguridad a partir de UNA toma por idioma (plugin de ElevenLabs) + su transcripción Scribe.
// 1. masteriza la toma entera con normalize-voice.mjs (--drive 6: misma ganancia para todos los bloques);
// 2. la corta en bloques (voz-lineas-<lang>.json) usando los tiempos por palabra de Scribe;
// 3. escribe las palabras de cada bloque (tiempos relativos al bloque) para los subtítulos y los captions.
// Uso: node scripts/voz-ciberseguridad.mjs <nn-episodio> <es|en> [toma]
//   entra: guiones/Ciberseguridad/<nn>/voz-original/<lang>-<toma>.mp3 y <lang>-<toma>.words.json
//   sale:  public/videos/ciberseguridad/<nn>/voz/<lang>/{toma.mp3, vNN.wav, manifest.json}
//          public/videos/ciberseguridad/<nn>/captions/<lang>.json   (formato Caption de @remotion/captions)
//          src/canales/ciberseguridad/episodios/<nn>/voz/<lang>.json (lo lee vozReal.ts)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const [ep = "01-codigo-por-error", lang = "es", toma = "toma1"] = process.argv.slice(2);
const ORIG = path.join("guiones/Ciberseguridad", ep, "voz-original");
const LINEAS = JSON.parse(fs.readFileSync(path.join("guiones/Ciberseguridad", ep, `voz-lineas-${lang}.json`), "utf8"));
const WORDS = JSON.parse(fs.readFileSync(path.join(ORIG, `${lang}-${toma}.words.json`), "utf8")).words.filter((w) => w.type === "word");
const PUB = path.join("public/videos/ciberseguridad", ep);
const VOZ = path.join(PUB, "voz", lang);
const SR = 48000;
const PAD_IN = 0.06;
const PAD_OUT = 0.14;
const MAX_GAP = 0.8;
fs.mkdirSync(VOZ, { recursive: true });
fs.mkdirSync(path.join(PUB, "captions"), { recursive: true });
const isWin = process.platform === "win32";
const ffmpeg = (args) => execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", ...args], { shell: isWin, maxBuffer: 1 << 28 });

/** fundido lineal de entrada/salida sobre un WAV PCM 16 bits mono (in situ) */
const fundidos = (file, inS, outS) => {
  const b = fs.readFileSync(file);
  let pos = 12;
  while (pos + 8 <= b.length) {
    const id = b.toString("ascii", pos, pos + 4);
    const size = b.readUInt32LE(pos + 4);
    if (id === "data") {
      const n = Math.floor(size / 2);
      const ni = Math.round(inS * SR);
      const no = Math.round(outS * SR);
      for (let i = 0; i < n; i++) {
        const g = Math.min(1, i / ni, (n - 1 - i) / no);
        if (g < 1) b.writeInt16LE(Math.round(b.readInt16LE(pos + 8 + i * 2) * Math.max(0, g)), pos + 8 + i * 2);
      }
      fs.writeFileSync(file, b);
      return;
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`${file}: sin chunk data`);
};

// 1 · master de la toma entera
fs.copyFileSync(path.join(ORIG, `${lang}-${toma}.mp3`), path.join(VOZ, "toma.raw.mp3"));
const manifestPath = path.join(VOZ, "manifest.json");
const manifest = { origen: `ElevenLabs (plugin) · ${toma} · eleven_multilingual_v2 · Donovan DMyrgzQFny3JI1Y1paM5 · velocidad 1,0`, scenes: { toma: {} } };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
execFileSync(process.execPath, ["scripts/normalize-voice.mjs", "--dir", VOZ, "--drive", "6"], { stdio: "inherit" });
fs.rmSync(path.join(VOZ, "toma.raw.mp3"));

// 2 · reparto de palabras por bloque (mismo orden, misma cantidad de palabras)
const squash = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
let k = 0;
const bloques = LINEAS.map((l) => {
  const tokens = l.spoken.split(/\s+/).filter(Boolean);
  const ws = WORDS.slice(k, k + tokens.length);
  k += tokens.length;
  tokens.forEach((t, i) => {
    if (!ws[i] || squash(ws[i].text) !== squash(t)) throw new Error(`${l.id}: «${t}» ≠ «${ws[i]?.text}» (la transcripción no coincide con el guion)`);
  });
  return { id: l.id, tokens, ws };
});
if (k !== WORDS.length) throw new Error(`sobran ${WORDS.length - k} palabras en la transcripción`);

// 3 · cortes y palabras relativas
const salida = {};
const captions = [];
const problemas = [];
for (const [i, b] of bloques.entries()) {
  const prevEnd = i > 0 ? bloques[i - 1].ws.at(-1).end : 0;
  const nextStart = i < bloques.length - 1 ? bloques[i + 1].ws[0].start : Infinity;
  const s0 = Math.max(0, b.ws[0].start - PAD_IN, (prevEnd + b.ws[0].start) / 2);
  const e0 = Math.min(b.ws.at(-1).end + PAD_OUT, (b.ws.at(-1).end + nextStart) / 2);
  for (let j = 1; j < b.ws.length; j++) if (b.ws[j].start - b.ws[j - 1].end > MAX_GAP) problemas.push(`${b.id}: silencio de ${(b.ws[j].start - b.ws[j - 1].end).toFixed(2)} s antes de «${b.tokens[j]}»`);
  const wav = path.join(VOZ, `${b.id}.wav`);
  ffmpeg(["-y", "-ss", s0.toFixed(3), "-to", e0.toFixed(3), "-i", path.join(VOZ, "toma.mp3"), "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", wav]);
  fundidos(wav, 0.005, 0.012); // el ffmpeg de Remotion no trae afade: los fundidos se hacen acá
  const palabras = b.ws.map((w, j) => ({ t: b.tokens[j], s: Number((w.start - s0).toFixed(3)), e: Number((w.end - s0).toFixed(3)) }));
  salida[b.id] = { audio: `videos/ciberseguridad/${ep}/voz/${lang}/${b.id}.wav`, duracion: Number((e0 - s0).toFixed(3)), palabras };
  for (const [j, w] of b.ws.entries()) captions.push({ text: (captions.length ? " " : "") + b.tokens[j], startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), timestampMs: Math.round(((w.start + w.end) / 2) * 1000), confidence: null });
  console.log(`${b.id}: ${s0.toFixed(2)}–${e0.toFixed(2)} s · ${(e0 - s0).toFixed(2)} s · ${b.tokens.length} palabras`);
}
const SRC = path.join("src/canales/ciberseguridad/episodios", ep, "voz");
fs.mkdirSync(SRC, { recursive: true });
fs.writeFileSync(path.join(SRC, `${lang}.json`), JSON.stringify(salida, null, 1) + "\n");
fs.writeFileSync(path.join(PUB, "captions", `${lang}.json`), JSON.stringify(captions, null, 1) + "\n");
console.log(problemas.length ? `PROBLEMAS: ${problemas.join("; ")}` : "alineación OK: todas las palabras, en orden, sin silencios internos > 0,8 s");
