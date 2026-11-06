// Regenera public/biblioteca/catalogo.json y src/biblioteca/sonidos.ts a partir de los archivos.
// Uso: node scripts/catalogo-biblioteca.mjs   (correrlo cada vez que se agrega un sonido)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import console from "node:console";

const ROOT = "public/biblioteca";
const DESC = {
  "whoosh-suave": "barrido de aire suave (giros de cabeza, cambios de escena)",
  "whoosh-corto": "barrido corto y seco",
  swish: "roce rápido (entradas de objetos, manos)",
  whip: "látigo de cámara (whip-pan / corte rápido)",
  riser: "subida de tensión antes de una revelación",
  zip: "cierre / deslizamiento rápido",
  "vaso-apoyo": "vaso de papel apoyado en el mostrador",
  thud: "golpe sordo (caída, aterrizaje)",
  impact: "impacto cartoon",
  "low-hit": "golpe grave dramático (revelaciones)",
  "air-clack": "chasquido de aire (explosión de ideas, separación)",
  crack: "crujido seco",
  wood: "golpe de madera",
  "paper-slap": "papel que golpea la mesa",
  "tic-precio": "tic/chime corto para resaltar un precio",
  "pop-aparicion": "pop cartoon de aparición",
  tick: "tic de reloj / marcador muy corto",
  "price-pop": "pop brillante para carteles y precios",
  pluck: "pulsación tipo cuerda (conexión entre ideas)",
  shimmer: "brillo / destello ('esto es lo inteligente')",
  "click-close": "clic de cierre / agarre",
  flick: "toque leve (dar vuelta un ticket, señalar)",
  sorpresa: "reacción de sorpresa cartoon sutil",
  revelacion: "golpe grave + respiración de suspenso",
  pasos: "pasos en piso de madera",
  servilleta: "servilleta de papel que cubre algo",
  "coin-clink": "moneda que tintinea",
  "coin-spin": "moneda girando hasta frenar",
  creak: "crujido de madera / balanza",
  paper: "manipular papel",
  "sala-cafe": "ambiente de sala (room tone) para poner debajo de todo",
  "investigations-kevin-macleod": "música de intriga/curiosidad, 93 s, loop fácil",
};
const origin = (cat, ext) =>
  cat === "musica"
    ? { origen: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0 — crédito obligatorio en la descripción" }
    : ext === ".mp3"
      ? { origen: "ElevenLabs Sound Effects (cuenta del canal)", licencia: "uso según los términos de ElevenLabs del plan" }
      : { origen: "sintetizado por nuestros scripts (shorts-remotion/scripts/gen-sfx*.mjs)", licencia: "propio, libre" };

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(mp3|wav)$/i.test(e.name)) files.push(p);
  }
};
walk(ROOT);
const items = files.sort().map((p) => {
  const rel = path.relative("public", p).split(path.sep).join("/");
  const parts = rel.split("/");
  const cat = parts[1] === "sfx" ? parts[2] : parts[1];
  const ext = path.extname(p).toLowerCase();
  const id = path.basename(p, ext);
  let dur = null;
  try {
    const out = execSync(`npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 ${JSON.stringify(p)}`, { encoding: "utf8" });
    dur = Math.round(parseFloat(out.trim()) * 100) / 100;
  } catch {
    dur = null;
  }
  return { id, categoria: cat, archivo: rel, duracion_s: dur, descripcion: DESC[id] ?? "", ...origin(cat, ext) };
});
fs.writeFileSync(path.join(ROOT, "catalogo.json"), JSON.stringify(items, null, 2) + "\n");

const ts = [
  "// GENERADO por scripts/catalogo-biblioteca.mjs — no editar a mano.",
  "// Uso: <Audio src={staticFile(SONIDOS.whip)} />  ·  ver public/biblioteca/catalogo.json",
  "",
  "export const SONIDOS = {",
  ...items.filter((i) => i.categoria !== "musica").map((i) => `  /** ${i.descripcion} (${i.duracion_s ?? "?"} s) */\n  ${JSON.stringify(i.id)}: ${JSON.stringify(i.archivo)},`),
  "} as const;",
  "",
  "export const MUSICA = {",
  ...items.filter((i) => i.categoria === "musica").map((i) => `  /** ${i.descripcion} — ${i.licencia} */\n  ${JSON.stringify(i.id)}: ${JSON.stringify(i.archivo)},`),
  "} as const;",
  "",
  "export type Sonido = keyof typeof SONIDOS;",
  "",
];
fs.writeFileSync("src/biblioteca/sonidos.ts", ts.join("\n"));
console.log(`${items.length} archivos catalogados`);
