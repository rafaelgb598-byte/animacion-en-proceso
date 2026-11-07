// Hoja de contactos sin dependencias: junta los PNG de una carpeta (1080 × 1920) reducidos a 360 × 640, en orden de frame.
// Debajo de cada miniatura va una barra cuyo largo marca el frame (0 → 1199) para ubicarse sin texto.
// Uso: node scripts/contact-sheet-1000-anos-cocina.mjs <carpetaStills> <salida.png> [prefijo] [columnas]
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { blit, canvas, decodePng, downscale, encodePng } from "./lib/png.mjs";

const [inDir, output, prefix = "MilAnosCocinaV1", colsArg = "8", total = "1200"] = process.argv.slice(2);
const cols = Number(colsArg);
const files = fs
  .readdirSync(inDir)
  .filter((n) => new RegExp(`^${prefix}-\\d{4}\\.png$`).test(n))
  .sort();
const TW = 360, TH = 640, GAP = 10, BAR = 14;
const rows = Math.ceil(files.length / cols);
const sheet = canvas(cols * TW + (cols + 1) * GAP, rows * (TH + BAR + GAP) + GAP, [11, 12, 14]);
files.forEach((f, i) => {
  const img = downscale(decodePng(fs.readFileSync(path.join(inDir, f))), 3);
  const ox = GAP + (i % cols) * (TW + GAP);
  const oy = GAP + Math.floor(i / cols) * (TH + BAR + GAP);
  blit(sheet, img, ox, oy);
  const frame = Number(f.slice(prefix.length + 1, prefix.length + 5));
  const w = Math.max(2, Math.round((frame / (Number(total) - 1)) * TW));
  blit(sheet, canvas(w, 6, [224, 163, 59]), ox, oy + TH + 4);
});
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, encodePng(sheet));
console.log(`${output} · ${files.length} miniaturas: ${files.map((f) => Number(f.slice(prefix.length + 1, prefix.length + 5))).join(", ")}`);
