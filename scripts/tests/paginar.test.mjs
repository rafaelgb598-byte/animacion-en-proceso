// Pruebas de la paginación de subtítulos (casos reales que fallaron en 01 y 02).
// Uso: node --test scripts/tests/   (Node ≥ 23.6 ejecuta el .ts sin compilar)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { NO_CIERRA, palabraClave, paginar, textoPagina } from "../../src/canal/subtitulos/paginar.ts";
import { WORDS } from "../../src/videos/01-efecto-senuelo/short-final/words.ts";

// medidor aproximado (Montserrat 900 a 70 px ≈ 0,74 em por letra mayúscula, 18 px entre palabras)
const medir = (r) => r.reduce((a, w) => a + w.t.replace(/\|/g, "").length * 70 * 0.74, 0) + (r.length - 1) * 18 + 17;
const OPC = { fps: 30, medir, anchoMax: 720, remates: [], escalaMin: 0.8 };

const stroopWords = () => {
  const out = [];
  let off = 0;
  for (const id of ["v1", "v2", "v3", "v4", "v5"]) {
    const a = JSON.parse(fs.readFileSync(`public/videos/02-stroop/final/voz/${id}.align.json`, "utf8"));
    const al = a.alignment ?? a;
    let t = "";
    let s = 0;
    let e = 0;
    al.characters.forEach((ch, i) => {
      if (ch === " ") {
        if (t) out.push({ t, s: s + off, e: e + off });
        t = "";
        return;
      }
      if (!t) s = al.character_start_times_seconds[i];
      t += ch;
      e = al.character_end_times_seconds[i];
    });
    if (t) out.push({ t, s: s + off, e: e + off });
    off += 20;
  }
  return out;
};

const reglas = (pags) => {
  for (const p of pags) {
    const txt = textoPagina(p);
    const ult = p.palabras[p.palabras.length - 1].t;
    const terminaBien = (t) => /[.?!…]$/.test(t) || !NO_CIERRA.includes(palabraClave(t));
    assert.ok(terminaBien(ult), `la página «${txt}» termina en «${ult}»`);
    if (p.renglones.length === 2) {
      const r1 = p.renglones[0];
      assert.ok(terminaBien(r1[r1.length - 1].t), `el primer renglón de «${txt}» termina mal`);
      assert.ok(medir(p.renglones[1]) >= medir(r1) / 2, `renglones disparejos en «${txt}»`);
    }
    for (const r of p.renglones) assert.ok(medir(r) * p.escala <= 720.5, `renglón demasiado ancho: «${txt}»`);
    assert.ok(p.f1 - p.f0 >= 15, `«${txt}» dura ${p.f1 - p.f0} fotogramas`);
    if (p.palabras.length === 1) assert.match(ult, /[.?!…]$/, `huérfana: «${txt}»`);
  }
};

test("señuelo: todas las páginas cumplen las reglas", () => reglas(paginar(WORDS, OPC)));
test("stroop: todas las páginas cumplen las reglas", () => reglas(paginar(stroopWords(), OPC)));

const contiene = (pags, frase) => pags.some((p) => p.palabras.map((w) => w.t).join(" ").includes(frase));
const enLaMisma = (pags, a, b) => pags.some((p) => { const t = p.palabras.map((w) => w.t); return t.includes(a) && t.includes(b); });

test("«Ahora mirá lo que pasa…» no se corta en «LO QUE»", () => {
  const pags = paginar(WORDS, OPC);
  assert.ok(!pags.some((p) => /\bque$/i.test(p.palabras.map((w) => w.t).join(" "))));
  assert.ok(enLaMisma(pags, "lo", "pasa"), "«lo que pasa» queda junto");
});
test("«Cambió contra qué lo comparás» va entero", () => {
  const pags = paginar(WORDS, OPC);
  assert.ok(contiene(pags, "Cambió contra qué lo comparás."), pags.map(textoPagina).join(" ‖ "));
});
test("«Tu cerebro lee la palabra…» no termina en «LA»", () => {
  const pags = paginar(stroopWords(), OPC);
  assert.ok(enLaMisma(pags, "la", "palabra") || !pags.some((p) => p.palabras.at(-1).t === "la"));
  assert.ok(enLaMisma(pags, "lee", "palabra"), pags.map(textoPagina).join(" ‖ "));
});
test("«¡Son solo cincuenta centavos más!» sin «MÁS!» suelto", () => {
  const pags = paginar(WORDS, OPC);
  assert.ok(enLaMisma(pags, "centavos", "más!"), pags.map(textoPagina).join(" ‖ "));
});
test("corte manual con |", () => {
  const ws = [
    { t: "uno", s: 0, e: 0.3 },
    { t: "dos|", s: 0.35, e: 0.6 },
    { t: "tres", s: 0.65, e: 0.9 },
    { t: "cuatro.", s: 0.95, e: 1.4 },
  ];
  const pags = paginar(ws, OPC);
  assert.equal(pags[0].palabras.at(-1).t, "dos|");
});
