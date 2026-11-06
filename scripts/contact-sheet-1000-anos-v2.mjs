// Hoja de contactos de «1000 años» (v2): copia los stills a public/videos/03-1000-anos/v2/qa/ (carpeta temporal),
// renderiza el Still UltimoEnPieHojaContactos y borra la carpeta temporal.
// Uso: node scripts/contact-sheet-1000-anos-v2.mjs <carpetaStills> <salida.png>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const [inDir = "videosPrueba/MilAños/qa/03-1000-anos-v2/stills", output = "videosPrueba/MilAños/qa/03-1000-anos-v2/stills/contact-sheet.png"] = process.argv.slice(2);
const tmp = path.resolve("public/videos/03-1000-anos/v2/qa");
fs.mkdirSync(tmp, { recursive: true });
for (const f of fs.readdirSync(inDir).filter((n) => /^MilAnosCelularV2-\d{4}\.png$/.test(n))) {
  fs.copyFileSync(path.join(inDir, f), path.join(tmp, f));
}
try {
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const composition = await selectComposition({ serveUrl, id: "MilAnosV2HojaContactos" });
  await renderStill({ serveUrl, composition, output, frame: 0 });
  console.log(output);
} finally {
  for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f));
  fs.rmdirSync(tmp);
}
