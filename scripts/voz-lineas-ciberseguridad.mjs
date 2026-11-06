// Saca las líneas de voz de un episodio de Ciberseguridad desde su i18n (única fuente del texto) al formato de gen-voice.mjs.
// Uso: node scripts/voz-lineas-ciberseguridad.mjs <nn-episodio>   → guiones/Ciberseguridad/<nn>/voz-lineas-{es,en}.json + total de caracteres
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const ep = process.argv[2] ?? "01-codigo-por-error";
const dir = path.join("src/canales/ciberseguridad/episodios", ep, "i18n");
let total = 0;
for (const lang of ["es", "en"]) {
  const src = fs.readFileSync(path.join(dir, `${lang}.ts`), "utf8");
  const lines = [...src.matchAll(/^\s+(v\d\d): \{ dicho: "((?:[^"\\]|\\.)*)"/gm)].map((m) => ({ id: m[1], spoken: JSON.parse(`"${m[2]}"`) }));
  const chars = lines.reduce((a, l) => a + l.spoken.length, 0);
  total += chars;
  const out = path.join("guiones/Ciberseguridad", ep, `voz-lineas-${lang}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(lines, null, 2) + "\n");
  console.log(`${lang}: ${lines.length} bloques · ${chars} caracteres → ${out}`);
}
console.log(`total: ${total} caracteres`);
