// Diagnóstico de choques. Pinta sobre la escena: cian = subtítulo.
//   Sin --cuerpo: rojo = todo lo que no es escenario (escena ≠ fondo).
//   Con --cuerpo: azul = objetos y textos · rojo = cara y manos de Tomi · verde = torso/piernas de Tomi (permitido).
// Uso: node scripts/qa-mascara.mjs <Composicion> <dirSalida> <f1,f2,...> [--cuerpo]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { decodePng, encodePng } from "./lib/png.mjs";

const args = process.argv.slice(2);
const cuerpo = args.includes("--cuerpo");
const [comp, out, lista] = args.filter((a) => a !== "--cuerpo");
const props = comp === "GiroDatoStroopV2" ? { showSafeZones: false, hasVoiceover: true } : { debug: false };
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const capas = ["subtitulos", "escena", "fondo", ...(cuerpo ? ["sinTomi", "tomiClave"] : [])];
const comps = {};
for (const capa of capas) comps[capa] = await selectComposition({ serveUrl, id: comp, inputProps: { ...props, capa }, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
const r = async (frame, capa) => {
  const o = path.join(out, `_${capa}.png`);
  await renderStill({ serveUrl, composition: comps[capa], frame, output: o, imageFormat: "png", inputProps: { ...props, capa }, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
  return decodePng(fs.readFileSync(o));
};
const dif = (a, b, i) => Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 24;
const tinte = (img, i, rgb) => {
  img.data[i] = img.data[i] * 0.35 + rgb[0] * 0.65;
  img.data[i + 1] = img.data[i + 1] * 0.35 + rgb[1] * 0.65;
  img.data[i + 2] = img.data[i + 2] * 0.35 + rgb[2] * 0.65;
};
for (const f of lista.split(",").map(Number)) {
  const L = {};
  for (const c of capas) L[c] = await r(f, c);
  const e = L.escena;
  const img = { width: e.width, height: e.height, data: new Uint8Array(e.data) };
  for (let i = 0; i < img.data.length; i += 4) {
    if (!cuerpo) {
      if (dif(e, L.fondo, i)) tinte(img, i, [255, 40, 40]);
    } else {
      const T = dif(e, L.sinTomi, i);
      if (T && L.tomiClave.data[i + 3] > 0) tinte(img, i, [255, 30, 30]);
      else if (T) tinte(img, i, [40, 200, 90]);
      else if (dif(L.sinTomi, L.fondo, i)) tinte(img, i, [40, 90, 255]);
    }
    if (L.subtitulos.data[i + 3] > 0) {
      img.data[i] = 0;
      img.data[i + 1] = 220;
      img.data[i + 2] = 255;
    }
  }
  fs.writeFileSync(path.join(out, `mascara-${String(f).padStart(4, "0")}.png`), encodePng(img));
  console.log(f);
}
for (const c of capas) fs.rmSync(path.join(out, `_${c}.png`), { force: true });
await browser.close({ silent: true });
