// Antes / después / diff de fotogramas concretos.
//   antes   = fotograma del MP4 aprobado (se extrae con el ffmpeg de Remotion, fotograma exacto)
//   después = still de la composición actual (capa "todo")
//   diff    = |antes − después| ×3 sobre el «después» en gris (lo que no cambió queda gris)
// Uso: node scripts/qa-antes-despues.mjs <Composicion> <mp4 aprobado> <dirSalida> <f1,f2,...>
// Salida: <dir>/<f>-{antes,despues,diff}.png, hojas <dir>/hoja-N.png (6 fotogramas por hoja) y <dir>/diff.json
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { blit, canvas, decodePng, downscale, encodePng } from "./lib/png.mjs";

const [comp, mp4, out, lista] = process.argv.slice(2);
const frames = lista.split(",").map(Number);
const props = comp === "GiroDatoStroopV2" ? { showSafeZones: false, hasVoiceover: true, capa: "todo" } : { debug: false, capa: "todo" };
fs.mkdirSync(out, { recursive: true });
const ffmpeg = (args) => execFileSync("npx", ["remotion", "ffmpeg", ...args], { stdio: "pipe", shell: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id: comp, inputProps: props, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
const resumen = [];
const tiles = [];
for (const f of frames) {
  const id = String(f).padStart(4, "0");
  const pa = path.join(out, `${id}-antes.png`);
  const pd = path.join(out, `${id}-despues.png`);
  // búsqueda exacta (después de -i). Los MP4 de Remotion arrancan con un desfase de ~1 fotograma en el contenedor:
  // (f − 0,5)/fps cae en el fotograma f (verificado comparando la mitad de arriba contra f−2…f+2)
  ffmpeg(["-y", "-v", "error", "-i", `"${mp4}"`, "-ss", (Math.max(0, f - 0.5) / composition.fps).toFixed(4), "-frames:v", "1", `"${pa}"`]);
  await renderStill({ serveUrl, composition, frame: f, output: pd, imageFormat: "png", inputProps: props, puppeteerInstance: browser, chromiumOptions: { gl: "angle" } });
  const a = decodePng(fs.readFileSync(pa));
  const d = decodePng(fs.readFileSync(pd));
  const diff = { width: d.width, height: d.height, data: new Uint8Array(d.data.length) };
  let cambia = 0;
  let cambiaArriba = 0;
  for (let i = 0; i < d.data.length; i += 4) {
    const m = Math.max(Math.abs(a.data[i] - d.data[i]), Math.abs(a.data[i + 1] - d.data[i + 1]), Math.abs(a.data[i + 2] - d.data[i + 2]));
    const g = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3;
    const y = Math.floor(i / 4 / d.width);
    if (m > 24) {
      cambia++;
      if (y < 1270) cambiaArriba++;
      diff.data[i] = 255;
      diff.data[i + 1] = Math.max(0, 80 - m);
      diff.data[i + 2] = 255 - Math.min(255, m * 3);
    } else {
      diff.data[i] = diff.data[i + 1] = diff.data[i + 2] = g * 0.35;
    }
    diff.data[i + 3] = 255;
  }
  fs.writeFileSync(path.join(out, `${id}-diff.png`), encodePng(diff));
  resumen.push({ f, pxCambian: cambia, pxCambianArribaDe1270: cambiaArriba });
  tiles.push({ f, imgs: [a, d, diff] });
  console.log(`f${f}: ${cambia} px cambian (${cambiaArriba} arriba de y = 1270)`);
}
await browser.close({ silent: true });
fs.writeFileSync(path.join(out, "diff.json"), JSON.stringify(resumen, null, 1));

// hojas: 6 fotogramas (2 columnas × 3 filas), cada uno antes | después | diff a 1/4
const ESC = 4;
const tw = 1080 / ESC;
const th = 1920 / ESC;
const ROT = 34;
const glyph = {
  0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 3: "111001111001111", 4: "101101111001001",
  5: "111100111001111", 6: "111100111101111", 7: "111001001001001", 8: "111101111101111", 9: "111101111001111", f: "111100110100100",
};
const texto = (img, x, y, s, k = 4) => {
  [...s].forEach((ch, n) => {
    const g = glyph[ch];
    if (!g) return;
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (g[r * 3 + c] === "1")
          for (let yy = 0; yy < k; yy++)
            for (let xx = 0; xx < k; xx++) {
              const i = ((y + r * k + yy) * img.width + (x + n * 4 * k + c * k + xx)) * 4;
              img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
            }
  });
};
for (let h = 0; h * 6 < tiles.length; h++) {
  const grupo = tiles.slice(h * 6, h * 6 + 6);
  const hoja = canvas(2 * (3 * tw + 20), Math.ceil(grupo.length / 2) * (th + ROT), [24, 24, 24]);
  grupo.forEach((t, k) => {
    const x0 = (k % 2) * (3 * tw + 20);
    const y0 = Math.floor(k / 2) * (th + ROT);
    texto(hoja, x0 + 6, y0 + 7, `f${t.f}`);
    t.imgs.forEach((im, j) => blit(hoja, downscale(im, ESC), x0 + j * tw, y0 + ROT));
  });
  fs.writeFileSync(path.join(out, `hoja-${h + 1}.png`), encodePng(hoja));
}
console.log(`listo: ${out}`);
