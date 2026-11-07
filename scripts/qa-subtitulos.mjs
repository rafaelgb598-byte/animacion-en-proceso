// QA de subtítulos que mide los PÍXELES renderizados (no reutiliza cajas ni medidas del sistema de subtítulos).
// Uso: npm run qa:subs -- <Composicion>      (EfectoSenueloTomiV2 | GiroDatoStroopV2 | EstafaCodigoES | EstafaCodigoEN)
// Salida: videosPrueba/<canal>/qa/<nn-video>/subtitulos[-<sufijo>]/{reporte.json, reporte.md, paginas.png}
// Código de salida ≠ 0 si falla cualquier prueba.
//
// Por cada página: renderiza el fotograma del medio y el de máxima escala de entrada con
//   capa "subtitulos" (PNG con alfa) → caja real de píxeles con alfa > 0;
//   capa "escena" y capa "fondo" → la diferencia es la máscara de Tomi, objetos y textos (respeta oclusiones);
//   capa "todo" (fotograma del medio) → hoja de contactos con guías.
// Las reglas de texto (cortes, huérfanas, énfasis) se verifican sobre lo que quedó DIBUJADO en el DOM.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { blit, canvas, decodePng, downscale, encodePng } from "./lib/png.mjs";

// canal (carpeta de videosPrueba), familia de la fuente y lista «solo pantalla» son opcionales: por defecto, los de GiroDato
const COMPS = {
  // cuerpo: el usuario permite el torso y las piernas de Tomi bajo el subtítulo (no la cara, las manos, objetos ni textos)
  // excepciones: choques puntuales que el usuario aprobó a mano (fotograma exacto, tope de píxeles y motivo).
  // Solo cubren ESE fotograma y hasta ESOS píxeles: si cambian o aparecen otros, el QA vuelve a fallar.
  EfectoSenueloTomiV2: {
    nn: "01-efecto-senuelo",
    props: { debug: false },
    cuerpo: true,
    excepciones: [
      { f: 259, maxPx: 60, motivo: "borde del vaso grande dentro del margen de 12 px (no toca las letras), solo en el fotograma de entrada" },
      { f: 1114, maxPx: 14000, motivo: "los vasos pasan detrás del subtítulo durante el deslizamiento pizarrón → café" },
    ],
  },
  GiroDatoStroopV2: { nn: "02-stroop", props: { showSafeZones: false, hasVoiceover: true } },
  EstafaCodigoES: { nn: "01-codigo-por-error", canal: "Ciberseguridad", sufijo: "es", familia: "Archivo", pantalla: "ciberseguridad", props: { lang: "es", showSafeZones: false } },
  EstafaCodigoEN: { nn: "01-codigo-por-error", canal: "Ciberseguridad", sufijo: "en", familia: "Archivo", pantalla: "ciberseguridad", props: { lang: "en", showSafeZones: false } },
  // canal Despiece (solo español): con voz real y borrador sin voz
  DespieceCerradura: { nn: "01-cerradura", canal: "Despiece", familia: "Space Grotesk", props: { conVoz: true, showSafeZones: false } },
  DespieceCerraduraSinVoz: { nn: "01-cerradura", canal: "Despiece", sufijo: "sin-voz", familia: "Space Grotesk", props: { conVoz: false, showSafeZones: false } },
};
const comp = process.argv[2];
if (!COMPS[comp]) {
  console.error(`Uso: npm run qa:subs -- <${Object.keys(COMPS).join(" | ")}>`);
  process.exit(2);
}
const { nn, props, canal = "GiroDato", sufijo = null, familia = null, pantalla: listaPantalla = null, cuerpo: CUERPO = false, excepciones: EXC = [] } = COMPS[comp];
const excepcionesUsadas = [];
const OUT = path.resolve(`videosPrueba/${canal}/qa/${nn}/subtitulos${sufijo ? `-${sufijo}` : ""}`);
const TMP = path.join(OUT, "frames");
fs.mkdirSync(TMP, { recursive: true });

// criterios (sección 4 del prompt maestro; zona segura = src/canal/zonaSegura.ts)
const leerZona = () => {
  const src = fs.readFileSync("src/canal/zonaSegura.ts", "utf8");
  const num = (re) => Number(src.match(re)[1]);
  return {
    centro: num(/CENTRO_X = (\d+)/),
    anchoMax: num(/ANCHO_TEXTO_MAX = (\d+)/),
    carril: num(/CARRIL = \{ bottom: (\d+)/),
    zonaBottom: num(/bottom: (\d+), left/),
    zonaRight: num(/right: (\d+) \}/),
  };
};
const Z = leerZona();
const C = { tolCentro: 4, x0: Z.centro - Z.anchoMax / 2, x1: Z.centro + Z.anchoMax / 2, tolCarril: 4, top: 1300, margen: 12, minFrames: 15, umbralMascara: 24 };
const NO_CIERRA = "el la lo los las un una unos unas al del de a en con por para sin sobre entre que y e o u ni pero más muy tan su sus mi tu se me te le les no".split(" ");
const PROHIBIDAS = JSON.parse(fs.readFileSync("src/canal/qa/prohibidas.ts", "utf8").match(/PROHIBIDAS: string\[\] = (\[[^\]]*\])/)[1]);
const FUENTE = fs.readFileSync("src/canal/subtitulos/estilo.ts", "utf8").match(/FUENTE_SUBTITULOS = FUENTES\.(\w+)/)[1];
const FAMILIA = familia ?? { interTight: "Inter Tight", montserrat: "Montserrat", segoe: "Segoe UI Black" }[FUENTE];
// lista «solo pantalla» del canal (texto visible sin los subtítulos), como palabra entera
const PANTALLA = listaPantalla ? JSON.parse(fs.readFileSync("src/canal/qa/prohibidas.ts", "utf8").match(/PROHIBIDAS_PANTALLA: Record<string, string\[\]> = (\{[\s\S]*?\n\});/)[1])[listaPantalla] ?? [] : [];
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const enPantalla = (texto) => PANTALLA.filter((pr) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapar(pr)}($|[^\\p{L}\\p{N}])`, "iu").test(texto ?? ""));

const clave = (t) => t.toLowerCase().replace(/[^a-zñáéíóúü0-9]/g, "");
const norm = (t) => clave(t).normalize("NFD").replace(/[̀-ͯ]/g, "");
const finOracion = (t) => /[.?!…]["»”)]*$/.test(t.replace(/\|/g, ""));
const cierraBien = (t) => finOracion(t) || !NO_CIERRA.includes(clave(t));

// ── render ──
console.log(`Bundle de ${comp}…`);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// puerto propio para el servidor del render (otra sesión puede estar usando el 3000)
const PUERTO = Number(process.env.QA_PUERTO ?? 3100 + Math.floor(Math.random() * 800));
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
// una composición resuelta por capa: renderStill dibuja con las props de la composición seleccionada
const CAPAS = ["todo", "subtitulos", "escena", "fondo", ...(CUERPO ? ["sinTomi", "tomiClave"] : [])];
const comps = {};
for (const capa of CAPAS) {
  comps[capa] = await selectComposition({ serveUrl, id: comp, inputProps: { ...props, capa, qaSubs: true }, puppeteerInstance: browser, port: PUERTO, chromiumOptions: { gl: "angle" } });
}
const composition = comps.todo;
let n = 0;
const render = async (frame, capa) => {
  const output = path.join(TMP, `${capa}-${String(frame).padStart(4, "0")}.png`);
  const logs = [];
  if (comps[capa].props.capa !== capa) throw new Error(`la composición no recibió capa=${capa}`);
  await renderStill({
    serveUrl,
    composition: comps[capa],
    frame,
    output,
    imageFormat: "png",
    inputProps: { ...props, capa, qaSubs: true },
    puppeteerInstance: browser,
    port: PUERTO,
    chromiumOptions: { gl: "angle" },
    onBrowserLog: (l) => {
      if (l.text.startsWith("QA_SUBS ")) logs.push(JSON.parse(l.text.slice(8)));
    },
  });
  n++;
  return { img: decodePng(fs.readFileSync(output)), log: logs[logs.length - 1] ?? null };
};

const caja = (img) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, amarillos = 0;
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      if (img.data[i + 3] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      const [r, g, b, a] = [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
      // el resto de las palabras se dibuja al 78 % (alfa ≈ 199): basta alfa > 150 para contar el amarillo
      if (a > 150 && r > 200 && g > 170 && b < 120) amarillos++;
    }
  return x0 === Infinity ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1, amarillos };
};
const difiere = (a, b, i) => Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > C.umbralMascara;
/**
 * Píxeles que el subtítulo (caja ensanchada) no puede tocar.
 * - Regla estricta: todo lo que no es escenario (escena ≠ fondo): Tomi entero, objetos y textos.
 * - Con `cuerpo` (videos donde el usuario permite el torso y las piernas de Tomi bajo el subtítulo):
 *     T = Tomi visible (escena ≠ sinTomi) · O = objetos y textos (sinTomi ≠ fondo) fuera de T · K = cara y manos (alfa de tomiClave) ∩ T
 *     prohibido = O ∪ K; el resto de T se informa como «cuerpo» (permitido).
 */
const choques = (esc, fon, b, cuerpo = null) => {
  let n = 0;
  let permitido = 0;
  const X0 = Math.max(0, b.x0 - C.margen), X1 = Math.min(esc.width, b.x1 + C.margen);
  const Y0 = Math.max(0, b.y0 - C.margen), Y1 = Math.min(esc.height, b.y1 + C.margen);
  let cx0 = Infinity, cy0 = Infinity, cx1 = -1, cy1 = -1;
  for (let y = Y0; y < Y1; y++)
    for (let x = X0; x < X1; x++) {
      const i = (y * esc.width + x) * 4;
      let malo;
      if (!cuerpo) malo = difiere(esc, fon, i);
      else {
        const T = difiere(esc, cuerpo.sinTomi, i);
        const O = !T && difiere(cuerpo.sinTomi, fon, i);
        const K = T && cuerpo.clave.data[i + 3] > 0;
        malo = O || K;
        if (T && !K) permitido++;
      }
      if (malo) {
        n++;
        cx0 = Math.min(cx0, x); cy0 = Math.min(cy0, y); cx1 = Math.max(cx1, x); cy1 = Math.max(cy1, y);
      }
    }
  return { n, permitido, donde: n ? { x0: cx0, y0: cy0, x1: cx1 + 1, y1: cy1 + 1 } : null };
};

// páginas que dibujó el sistema (volcado del DOM)
const primero = await render(0, "subtitulos");
const PAGS = primero.log.paginas;
// cada frase clave se normaliza palabra por palabra («cincuenta centavos» → «cincuenta centavos»)
const ENFASIS = primero.log.enfasis.map((e) => e.split(/\s+/).map(norm).join(" "));
const REMATES = primero.log.remates.map(norm);
console.log(`${PAGS.length} páginas`);

const pico = (() => {
  // escala de entrada 0,86 → 1 en 6 fotogramas (snap 0, 0.01, 4.5, 1.6π): fotograma de máxima escala
  let best = 0, bv = -1;
  for (let k = 0; k <= 6; k++) {
    const x = k / 6;
    const u = (x - 0.01) / 0.99;
    const v = x <= 0.01 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-4.5 * u) * Math.cos(1.6 * Math.PI * u) + Math.exp(-4.5) * Math.cos(1.6 * Math.PI) * u;
    if (v > bv) { bv = v; best = k; }
  }
  return best;
})();

const filas = [];
const hojas = [];
for (const [pi, p] of PAGS.entries()) {
  const medio = Math.floor((p.f0 + p.f1) / 2);
  const fPico = Math.min(p.f1 - 1, p.f0 + pico);
  const res = { pagina: pi + 1, texto: p.palabras.join(" "), f0: p.f0, f1: p.f1, frames: [], pruebas: {} };
  const ok = (k, v, det) => {
    const prev = res.pruebas[k];
    res.pruebas[k] = { ok: (prev ? prev.ok : true) && v, detalle: [prev?.detalle, v ? null : det].filter(Boolean).join(" · ") };
  };
  let dom = null;
  for (const fr of [...new Set([medio, fPico])]) {
    const sub = await render(fr, "subtitulos");
    const esc = await render(fr, "escena");
    const fon = await render(fr, "fondo");
    const cuerpo = CUERPO ? { sinTomi: (await render(fr, "sinTomi")).img, clave: (await render(fr, "tomiClave")).img } : null;
    if (fr === medio) dom = sub.log;
    const b = caja(sub.img);
    if (!b) {
      ok("visible", false, `f${fr}: no se dibujó`);
      continue;
    }
    const cx = (b.x0 + b.x1) / 2;
    const ch = choques(esc.img, fon.img, b, cuerpo);
    res.frames.push({ f: fr, caja: { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 }, centro: cx, choques: ch.n, cuerpoPermitido: ch.permitido, zonaChoque: ch.donde, amarillos: b.amarillos });
    ok("centrado", Math.abs(cx - Z.centro) <= C.tolCentro, `f${fr}: centro ${cx.toFixed(1)}`);
    ok("ancho", b.x0 >= C.x0 && b.x1 <= C.x1, `f${fr}: x ${b.x0}–${b.x1}`);
    ok("carril", Math.abs(b.y1 - Z.carril) <= C.tolCarril && b.y0 >= C.top, `f${fr}: y ${b.y0}–${b.y1}`);
    ok("zonaSegura", b.y1 <= Z.zonaBottom && b.x1 <= Z.zonaRight, `f${fr}: ${b.x1}, ${b.y1}`);
    const exc = EXC.find((e) => e.f === fr && ch.n > 0 && ch.n <= e.maxPx);
    if (exc) excepcionesUsadas.push({ pagina: pi + 1, f: fr, px: ch.n, motivo: exc.motivo });
    ok("choques", ch.n === 0 || Boolean(exc), `f${fr}: ${ch.n} px en [${ch.donde?.x0}–${ch.donde?.x1}, ${ch.donde?.y0}–${ch.donde?.y1}]`);
    if (fr === medio) {
      const todo = await render(fr, "todo");
      hojas.push({ img: todo.img, b, pagina: pi + 1, ch: ch.donde });
      for (const pr of PROHIBIDAS)
        if ((todo.log?.textosVisibles ?? "").toLowerCase().includes(pr.toLowerCase())) ok("prohibidas", false, `f${fr}: «${pr}» en pantalla`);
      for (const pr of enPantalla(todo.log?.textosPantalla)) ok("prohibidas", false, `f${fr}: «${pr}» en pantalla (lista del canal)`);
    }
  }
  // texto (lo dibujado)
  const ult = p.palabras[p.palabras.length - 1];
  const r1 = p.renglones.length === 2 ? p.palabras[p.renglones[0] - 1] : null;
  ok("cortes", cierraBien(ult) && (!r1 || cierraBien(r1)), `termina en «${!cierraBien(ult) ? ult : r1}»`);
  const prev = pi > 0 ? PAGS[pi - 1].palabras.at(-1) : null;
  const sola = p.palabras.length === 1;
  ok("huerfanas", !sola || ((pi === 0 || finOracion(prev)) && finOracion(ult)) || REMATES.includes(norm(ult)), `«${ult}» sola`);
  ok("duracion", p.f1 - p.f0 >= C.minFrames, `${p.f1 - p.f0} fotogramas`);
  const am = (dom?.amarillas ?? []).map(norm);
  const unidad = am.join(" ");
  ok("enfasis", am.length === 0 || ENFASIS.includes(unidad), `amarillo: «${(dom?.amarillas ?? []).join(" ")}»`);
  const conAmarillo = res.frames.some((x) => x.amarillos > 30);
  ok("enfasis", conAmarillo === am.length > 0, `píxeles amarillos ${conAmarillo ? "sí" : "no"} vs DOM ${am.length}`);
  ok("fuente", Boolean(dom?.fuenteCargada) && (dom?.familia ?? "").includes(FAMILIA), `familia ${dom?.familia}, cargada ${dom?.fuenteCargada}`);
  if (!res.pruebas.prohibidas) ok("prohibidas", true, "");
  res.dibujado = dom?.renglones ?? [];
  res.amarillo = dom?.amarillas ?? [];
  filas.push(res);
  const fallas = Object.entries(res.pruebas).filter(([, v]) => !v.ok).map(([k]) => k);
  console.log(`${String(pi + 1).padStart(2)} f${p.f0}–${p.f1} ${fallas.length ? "✖ " + fallas.join(",") : "✔"}  ${res.dibujado.join(" / ")}`);
}

// prohibidas en pantalla fuera de las páginas (un fotograma cada 30)
const pantalla = [];
for (let fr = 0; fr < composition.durationInFrames; fr += 30) {
  const t = await render(fr, "todo");
  for (const pr of PROHIBIDAS) if ((t.log?.textosVisibles ?? "").toLowerCase().includes(pr.toLowerCase())) pantalla.push(`f${fr}: «${pr}»`);
  for (const pr of enPantalla(t.log?.textosPantalla)) pantalla.push(`f${fr}: «${pr}» (lista del canal, sin subtítulos)`);
}
await browser.close({ silent: true });

// prohibidas en el repo (aviso)
const enRepo = [];
const recorrer = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (/\.(tsx?|mjs|js|json|md|txt)$/.test(e.name)) {
      fs.readFileSync(p, "utf8").split(/\r?\n/).forEach((l, i) => {
        for (const pr of PROHIBIDAS) if (new RegExp(`\\b${pr}\\b`, "i").test(l)) enRepo.push(`${p.replace(/\\/g, "/")}:${i + 1}`);
      });
    }
  }
};
recorrer("src");
recorrer("guiones");
for (const f of ["BIBLIOTECA.md", "CLAUDE.md"])
  fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l, i) => {
    for (const pr of PROHIBIDAS) if (new RegExp(`\\b${pr}\\b`, "i").test(l)) enRepo.push(`${f}:${i + 1}`);
  });
const repo = [...new Set(enRepo)].filter((x) => !x.startsWith("src/canal/qa/prohibidas.ts"));

// ── hoja de contactos con guías ──
const ESC = 4, COLS = 6;
const tw = 1080 / ESC, th = 1920 / ESC;
const hoja = canvas(COLS * tw, Math.ceil(hojas.length / COLS) * th, [20, 20, 20]);
const linea = (img, x0, y0, x1, y1, rgb, grosor = 3) => {
  for (let y = Math.max(0, y0); y < Math.min(img.height, y1 + grosor); y++)
    for (let x = Math.max(0, x0); x < Math.min(img.width, x1 + grosor); x++) {
      const i = (y * img.width + x) * 4;
      img.data[i] = rgb[0]; img.data[i + 1] = rgb[1]; img.data[i + 2] = rgb[2];
    }
};
for (const [k, h] of hojas.entries()) {
  const im = { width: h.img.width, height: h.img.height, data: new Uint8Array(h.img.data) };
  for (let y = 0; y < 1920; y += 24) linea(im, Z.centro - 1, y, Z.centro - 1, y + 12, [0, 224, 255]);
  linea(im, 0, C.top, 1080, C.top, [0, 224, 255]);
  linea(im, 0, Z.carril, 1080, Z.carril, [0, 255, 156]);
  linea(im, 0, Z.zonaBottom, 1080, Z.zonaBottom, [255, 0, 64]);
  linea(im, Z.zonaRight, 0, Z.zonaRight, 1920, [255, 0, 64]);
  linea(im, C.x0, 1290, C.x0, 1510, [0, 224, 255]);
  linea(im, C.x1, 1290, C.x1, 1510, [0, 224, 255]);
  if (h.ch) {
    linea(im, h.ch.x0, h.ch.y0, h.ch.x1, h.ch.y0, [255, 45, 85], 5);
    linea(im, h.ch.x0, h.ch.y1, h.ch.x1, h.ch.y1, [255, 45, 85], 5);
    linea(im, h.ch.x0, h.ch.y0, h.ch.x0, h.ch.y1, [255, 45, 85], 5);
    linea(im, h.ch.x1, h.ch.y0, h.ch.x1, h.ch.y1, [255, 45, 85], 5);
  }
  blit(hoja, downscale(im, ESC), (k % COLS) * tw, Math.floor(k / COLS) * th);
}
fs.writeFileSync(path.join(OUT, "paginas.png"), encodePng(hoja));

// ── reporte ──
const PRUEBAS = ["centrado", "ancho", "carril", "zonaSegura", "choques", "cortes", "huerfanas", "duracion", "enfasis", "fuente", "prohibidas"];
const resumen = Object.fromEntries(PRUEBAS.map((k) => [k, filas.filter((f) => f.pruebas[k]?.ok).length]));
const fallas = filas.flatMap((f) => Object.entries(f.pruebas).filter(([, v]) => !v.ok).map(([k, v]) => ({ pagina: f.pagina, prueba: k, detalle: v.detalle, texto: f.texto })));
const total = fallas.length + pantalla.length;
fs.writeFileSync(
  path.join(OUT, "reporte.json"),
  JSON.stringify({ composicion: comp, excepcionesAprobadas: excepcionesUsadas, fecha: new Date().toISOString(), fuente: FAMILIA, criterios: { ...C, ...Z }, paginas: filas.length, resumen, fallas, prohibidasEnPantalla: pantalla, prohibidasEnRepo: repo, detalle: filas }, null, 1),
);
const md = [
  `# QA de subtítulos · ${comp}`,
  "",
  `${filas.length} páginas · fuente esperada **${FAMILIA}** · ${n} fotogramas renderizados · **${total} fallas**`,
  ...(CUERPO ? ["", "Regla de choques de este video: se permite el **torso y las piernas de Tomi** bajo el subtítulo (decisión del usuario); su cara, sus manos que gesticulan, los objetos y los textos no."] : []),
  ...(excepcionesUsadas.length ? ["", "**Excepciones aprobadas por el usuario** (no cuentan como falla):", ...excepcionesUsadas.map((e) => `- página ${e.pagina}, f${e.f}: ${e.px} px — ${e.motivo}`)] : []),
  "",
  "| Prueba | Páginas que pasan |",
  "|---|---|",
  ...PRUEBAS.map((k) => `| ${k} | ${resumen[k]} / ${filas.length} |`),
  "",
  "## Páginas",
  "",
  "| # | Fotogramas | Texto dibujado | Amarillo | Caja (medio) | Resultado |",
  "|---|---|---|---|---|---|",
  ...filas.map((f) => {
    const b = f.frames[0]?.caja;
    const mal = Object.entries(f.pruebas).filter(([, v]) => !v.ok);
    return `| ${f.pagina} | ${f.f0}–${f.f1} | ${f.dibujado.join(" / ")} | ${f.amarillo.join(" ") || "—"} | ${b ? `${b.x0}–${b.x1} × ${b.y0}–${b.y1}` : "—"} | ${mal.length ? "✖ " + mal.map(([k, v]) => `${k}: ${v.detalle}`).join("; ") : "✔"} |`;
  }),
  "",
  `## Palabras prohibidas`,
  "",
  `- En pantalla: ${pantalla.length ? pantalla.join(", ") : "ninguna"}`,
  `- En el repo (aviso): ${repo.length ? repo.join(", ") : "ninguna"}`,
  "",
].join("\n");
fs.writeFileSync(path.join(OUT, "reporte.md"), md);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${total} fallas · ${path.relative(process.cwd(), OUT)}/reporte.md`);
if (repo.length) console.log(`Aviso, prohibidas en el repo: ${repo.join(", ")}`);
process.exit(total ? 1 : 0);
