// Hoja de contactos de «1000 años» (final): copia los stills a public/videos/03-1000-anos/final/qa/ (temporal), renderiza el Still y limpia.
// Uso: node scripts/contact-sheet-1000-anos-final.mjs <carpetaStills> <salida.png>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const [inDir = "videosPrueba/MilAños/qa/03-1000-anos-final/stills", output = "videosPrueba/MilAños/qa/03-1000-anos-final/stills/contact-sheet.png"] = process.argv.slice(2);
const prefix = process.env.SHEET_PREFIX ?? "MilAnosCelularV3";
const tmp = path.resolve("public/videos/03-1000-anos/final/qa");
fs.mkdirSync(tmp, { recursive: true });
const files = fs.readdirSync(inDir).filter((n) => new RegExp(`^${prefix}-\\d{4}\\.png$`).test(n)).sort();
for (const f of files) fs.copyFileSync(path.join(inDir, f), path.join(tmp, f));
const frames = files.map((f) => Number(f.slice(prefix.length + 1, prefix.length + 5)));
try {
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const inputProps = { frames, prefix };
  const composition = await selectComposition({ serveUrl, id: "MilAnosV3HojaContactos", inputProps });
  await renderStill({ serveUrl, composition, output, frame: 0, inputProps });
  console.log(output);
} finally {
  for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f));
  fs.rmdirSync(tmp);
}
