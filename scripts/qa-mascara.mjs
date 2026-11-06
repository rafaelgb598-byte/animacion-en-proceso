// Diagnóstico de choques: para cada fotograma pinta en rojo la máscara (escena ≠ fondo) y en cian el subtítulo.
// Uso: node scripts/qa-mascara.mjs <Composicion> <dirSalida> <f1,f2,...>
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { decodePng, encodePng } from "./lib/png.mjs";

const [comp, out, lista] = process.argv.slice(2);
const props = comp === "GiroDatoStroopV2" ? { showSafeZones: false, hasVoiceover: true } : { debug: false };
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const comps = {};
for (const capa of ["subtitulos", "escena", "fondo"]) comps[capa] = await selectComposition({ serveUrl, id: comp, inputProps: { ...props, capa }, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
const r = async (frame, capa) => {
  const o = path.join(out, `_${capa}.png`);
  await renderStill({ serveUrl, composition: comps[capa], frame, output: o, imageFormat: "png", inputProps: { ...props, capa }, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
  return decodePng(fs.readFileSync(o));
};
for (const f of lista.split(",").map(Number)) {
  const [s, e, b] = [await r(f, "subtitulos"), await r(f, "escena"), await r(f, "fondo")];
  const img = { width: e.width, height: e.height, data: new Uint8Array(e.data) };
  for (let i = 0; i < img.data.length; i += 4) {
    const d = Math.max(Math.abs(e.data[i] - b.data[i]), Math.abs(e.data[i + 1] - b.data[i + 1]), Math.abs(e.data[i + 2] - b.data[i + 2]));
    if (d > 24) { img.data[i] = Math.min(255, img.data[i] * 0.4 + 150); img.data[i + 1] *= 0.4; img.data[i + 2] *= 0.4; }
    if (s.data[i + 3] > 0) { img.data[i] = 0; img.data[i + 1] = 220; img.data[i + 2] = 255; }
  }
  fs.writeFileSync(path.join(out, `mascara-${String(f).padStart(4, "0")}.png`), encodePng(img));
  console.log(f);
}
for (const c of ["subtitulos", "escena", "fondo"]) fs.rmSync(path.join(out, `_${c}.png`), { force: true });
await browser.close({ silent: true });
