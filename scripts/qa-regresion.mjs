// Regresión MP4 contra MP4: un fotograma cada N, del video aprobado y del nuevo (los dos comprimidos igual).
// Cuenta los píxeles que cambian (> 24 en algún canal) arriba y abajo de un corte en y, y los agrupa por bandas.
// Uso: node scripts/qa-regresion.mjs <mp4 aprobado> <mp4 nuevo> <dirSalida> [cada=30] [corteY=1265]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { decodePng } from "./lib/png.mjs";

const [antes, despues, out, cadaArg = "30", corteArg = "1265"] = process.argv.slice(2);
const cada = Number(cadaArg);
const corte = Number(corteArg);
fs.mkdirSync(out, { recursive: true });
const ffmpeg = (args) => execFileSync("npx", ["remotion", "ffmpeg", ...args], { stdio: "pipe", shell: true });
const ffprobe = (f) =>
  execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", `"${f}"`], { shell: true }).toString().trim();
const n = Math.min(Number(ffprobe(antes).replace(/,/g, "")), Number(ffprobe(despues).replace(/,/g, "")));
const frame = (mp4, f, nombre) => {
  const o = path.join(out, nombre);
  // los MP4 de Remotion arrancan con ~1 fotograma de desfase en el contenedor: (f − 0,5)/30 cae en f
  ffmpeg(["-y", "-v", "error", "-i", `"${mp4}"`, "-ss", (Math.max(0, f - 0.5) / 30).toFixed(4), "-frames:v", "1", `"${o}"`]);
  const img = decodePng(fs.readFileSync(o));
  fs.rmSync(o);
  return img;
};
const filas = [];
for (let f = 0; f < n; f += cada) {
  const a = frame(antes, f, "_a.png");
  const b = frame(despues, f, "_b.png");
  let arriba = 0;
  let abajo = 0;
  const bandas = {};
  for (let i = 0; i < a.data.length; i += 4) {
    const m = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
    if (m <= 24) continue;
    const y = Math.floor(i / 4 / a.width);
    if (y < corte) {
      arriba++;
      const k = Math.floor(y / 100) * 100;
      bandas[k] = (bandas[k] ?? 0) + 1;
    } else abajo++;
  }
  const zonas = Object.entries(bandas)
    .filter(([, v]) => v > 300)
    .map(([k, v]) => `y${k}–${Math.min(corte, Number(k) + 100)}: ${v}`);
  filas.push({ f, arriba, abajo, zonas });
  console.log(`f${f}: arriba de ${corte} ${arriba} px${zonas.length ? " (" + zonas.join(", ") + ")" : ""} · abajo ${abajo} px`);
}
fs.writeFileSync(path.join(out, "regresion.json"), JSON.stringify({ antes, despues, cada, corte, filas }, null, 1));
