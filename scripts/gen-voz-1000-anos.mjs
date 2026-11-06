// Voz de «1000 años» con ElevenLabs (voz Isaac). GASTA CRÉDITOS: correr solo con autorización.
// Un MP3 por segmento + tiempos por palabra (endpoint with-timestamps, sin costo extra de Scribe).
// La clave va SOLO por variable de entorno: ELEVENLABS_API_KEY.
// Uso: node scripts/gen-voz-1000-anos.mjs [idSegmento ...]   (sin ids: genera los que falten)
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Falta ELEVENLABS_API_KEY en el entorno.");
  process.exit(1);
}
const VOICE = "QmPfzE500cXXHM9uQKGc";
const guion = JSON.parse(fs.readFileSync("produccion/03-1000-anos/v2/guion.json", "utf8"));
const OUT = path.resolve("public/videos/03-1000-anos/v2/voz");
fs.mkdirSync(OUT, { recursive: true });
const wordsFile = path.join(OUT, "palabras.json");
const all = fs.existsSync(wordsFile) ? JSON.parse(fs.readFileSync(wordsFile, "utf8")) : {};
const only = process.argv.slice(2);

const toWords = (al) => {
  const words = [];
  let cur = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; }
    if (!cur) cur = { text: "", start: al.character_start_times_seconds[i], end: 0 };
    cur.text += ch;
    cur.end = al.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words;
};

const segs = guion.segmentos;
for (let i = 0; i < segs.length; i++) {
  const s = segs[i];
  const file = path.join(OUT, `${s.id}.mp3`);
  if (only.length ? !only.includes(s.id) : fs.existsSync(file)) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: s.texto,
      model_id: guion.modelo,
      previous_text: segs[i - 1]?.texto,
      next_text: segs[i + 1]?.texto,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error(`${s.id}: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const j = await res.json();
  fs.writeFileSync(file, Buffer.from(j.audio_base64, "base64"));
  const words = toWords(j.alignment);
  all[s.id] = { text: s.texto, duration: words.length ? words[words.length - 1].end : 0, words };
  console.log(`${s.id}.mp3  ${all[s.id].duration.toFixed(2)} s  ${s.texto.length} caracteres`);
}
fs.writeFileSync(wordsFile, JSON.stringify(all, null, 1));
