// Tramos muertos de un MP4: compara cada fotograma con el de 1 s después (en chico, 108 × 192) y reporta dónde casi no cambia.
// También mide el gancho (cambio f0 → f10 y primer cambio de estado grande) y el loop (último fotograma vs f0).
// Uso: node scripts/qa-tramos-muertos.mjs <video.mp4> <dirSalida> [--umbral 0.5]
// Métrica: % de píxeles cuyo canal cambia más de 12 niveles. «Quieto» = por debajo del umbral (por defecto 0,5 %).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { decodePng } from "./lib/png.mjs";

const argv = process.argv.slice(2);
const [video, out] = argv;
const umbral = argv.includes("--umbral") ? Number(argv[argv.indexOf("--umbral") + 1]) : 0.5;
if (!video || !out) {
  console.error("Uso: node scripts/qa-tramos-muertos.mjs <video.mp4> <dirSalida> [--umbral 0.5]");
  process.exit(2);
}
const dir = path.join(out, "frames-chicos");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const isWin = process.platform === "win32";
execFileSync(isWin ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", video, "-vf", "scale=108:192", path.join(dir, "%05d.png")], { shell: isWin, stdio: "inherit" });
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
const imgs = files.map((f) => decodePng(fs.readFileSync(path.join(dir, f))));
const bpp = imgs[0].data.length / (imgs[0].width * imgs[0].height);
const cambio = (a, b) => {
  let n = 0;
  const px = a.width * a.height;
  for (let i = 0; i < px; i++) {
    for (let c = 0; c < 3; c++) {
      if (Math.abs(a.data[i * bpp + c] - b.data[i * bpp + c]) > 12) {
        n++;
        break;
      }
    }
  }
  return (100 * n) / px;
};
const FPS = 30;
const quietos = [];
const serie = [];
for (let f = 0; f + FPS < imgs.length; f++) {
  const d = cambio(imgs[f], imgs[f + FPS]);
  serie.push(d);
  if (d < umbral) quietos.push(f);
}
// agrupa los fotogramas quietos en tramos
const tramos = [];
for (const f of quietos) {
  const t = tramos[tramos.length - 1];
  if (t && f === t.hasta + 1) t.hasta = f;
  else tramos.push({ desde: f, hasta: f });
}
const gancho010 = cambio(imgs[0], imgs[10]);
let primerCambioGrande = null;
for (let f = 1; f < imgs.length; f++)
  if (cambio(imgs[0], imgs[f]) > 10) {
    primerCambioGrande = f;
    break;
  }
const loop = cambio(imgs[imgs.length - 1], imgs[0]);
const min = Math.min(...serie);
const fMin = serie.indexOf(min);
const rep = {
  video,
  fotogramas: imgs.length,
  umbral,
  tramosQuietos: tramos.map((t) => ({ ...t, segundos: [(t.desde / FPS).toFixed(2), ((t.hasta + FPS) / FPS).toFixed(2)] })),
  minimo: { f: fMin, cambio: Number(min.toFixed(2)) },
  gancho: { cambio_f0_f10: Number(gancho010.toFixed(2)), primerCambioGrande },
  loop: { cambio_ultimo_vs_f0: Number(loop.toFixed(2)) },
};
fs.writeFileSync(path.join(out, "tramos-muertos.json"), JSON.stringify(rep, null, 2));
fs.rmSync(dir, { recursive: true, force: true });
console.log(JSON.stringify(rep, null, 2));
process.exit(tramos.length ? 1 : 0);
