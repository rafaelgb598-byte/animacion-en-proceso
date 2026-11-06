import { WORDS, type Word } from "../../short-final/words";
import { protectedBoxes, type Box } from "./timeline";

/**
 * Subtítulos con zona segura y reposicionamiento automático.
 *
 * Zona segura de Shorts (1080×1920): nada por debajo de y = 1536 (20 % inferior: título,
 * canal, descripción) ni a la derecha de x = 900 (columna de botones). Arriba se evita la
 * franja de la barra de búsqueda (y < 230).
 *
 * Para cada página de subtítulo se prueban posiciones de abajo hacia arriba y se elige
 * la primera que no toca ninguna caja "hard" (cara, manos levantadas, vasos, precios, título)
 * durante TODA la página; entre las válidas se prefiere la que menos tapa cajas "soft".
 * Si hay conflicto se mueve el subtítulo, nunca el elemento.
 */

export const FPS = 30;
export const SAFE = { left: 60, right: 900, top: 230, bottom: 1536 };
const ROWS = [1452, 1362, 1272, 1182, 1092, 1002, 912, 822, 732, 642, 552, 462, 372];
/** posiciones candidatas: centrado (preferido) o recostado a la izquierda (deja libre la columna derecha) */
export type Slot = { x: "c" | "l"; y: number };
export const SLOTS: Slot[] = [...ROWS.map((y) => ({ x: "c" as const, y })), ...ROWS.map((y) => ({ x: "l" as const, y }))];
const CENTER_X = (SAFE.left + SAFE.right) / 2;
const MAX_W = SAFE.right - SAFE.left - 40;
const PAD = 22;

/** ancho aproximado de Segoe UI Black en mayúsculas (conservador) */
const CHAR_W = 0.7;

export type Page = { words: Word[]; start: number; end: number; lines: Word[][]; size: number; w: number; h: number };

const buildPages = (until: number): Page[] => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of WORDS) {
    if (w.s > until) break;
    cur.push(w);
    const chars = cur.map((x) => x.t).join(" ").length;
    if (/[.?!]$|…$/.test(w.t) || (/[,:]$/.test(w.t) && chars > 14) || cur.length >= 4 || chars > 20) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  return pages.map((ws, i) => {
    const next = pages[i + 1];
    const end = next ? Math.min(next[0].s, ws[ws.length - 1].e + 0.6) : ws[ws.length - 1].e + 0.5;
    const text = ws.map((w) => w.t).join(" ");
    let lines: Word[][] = [ws];
    if (text.length > 14 && ws.length > 1) {
      let best = -1;
      let bestDiff = Infinity;
      for (let k = 1; k < ws.length; k++) {
        const la = ws.slice(0, k).map((w) => w.t).join(" ");
        const lb = ws.slice(k).map((w) => w.t).join(" ");
        if (la.length <= 3 || lb.length <= 3) continue;
        const d = Math.abs(la.length - lb.length);
        if (d < bestDiff) {
          bestDiff = d;
          best = k;
        }
      }
      if (best > 0) lines = [ws.slice(0, best), ws.slice(best)];
    }
    const longest = Math.max(...lines.map((l) => l.map((w) => w.t).join(" ").length));
    const size = Math.min(70, MAX_W / (longest * CHAR_W));
    const w = longest * size * CHAR_W + PAD * 2;
    const h = lines.length * size * 1.22 + PAD * 1.4;
    return { words: ws, start: ws[0].s - 0.08, end, lines, size, w, h };
  });
};

const overlap = (a: { x0: number; y0: number; x1: number; y1: number }, b: Box) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

export const slotX = (p: Page, x: Slot["x"]) => (x === "c" ? CENTER_X : SAFE.left + 6 + p.w / 2);
export const captionRect = (p: Page, cy: number, x: Slot["x"] = "c") => {
  const cx = slotX(p, x);
  return { x0: cx - p.w / 2, x1: cx + p.w / 2, y0: cy - p.h / 2, y1: cy + p.h / 2 };
};

export type Placed = Page & { cy: number; f0: number; f1: number; ys: number[]; xs: Slot["x"][]; switches: number[] };

/** y del centro del subtítulo en el fotograma f (anima los cambios de lugar) */
const idx = (p: Placed, f: number) => Math.min(p.ys.length - 1, Math.max(0, f - p.f0));
export const captionY = (p: Placed, f: number) => p.ys[idx(p, f)];
export const captionX = (p: Placed, f: number) => p.xs[idx(p, f)];

/**
 * Ubicación por fotograma con Viterbi: dentro de una página el subtítulo puede cambiar de
 * lugar (cuando la cámara se mueve o entra un objeto), pero cambiar cuesta, así que solo se
 * mueve si hace falta, con margen de ±1 fotograma respecto de cualquier choque.
 */
const SWITCH_COST = 60000;
let placed: Placed[] | null = null;
export const getCaptions = (untilSec: number, frames: number): Placed[] => {
  if (placed) return placed;
  const pages = buildPages(untilSec);
  let prevEnd = 0;
  placed = pages.map((p) => {
    const f0 = Math.max(0, Math.floor(p.start * FPS));
    const f1 = Math.min(frames, Math.ceil(p.end * FPS));
    const n = f1 - f0;
    const valid = SLOTS.map((sl) => {
      const r = captionRect(p, sl.y, sl.x);
      return r.y0 >= SAFE.top && r.y1 <= SAFE.bottom;
    });
    const cost = Array.from({ length: n }, (_, i) => {
      const boxes = protectedBoxes(f0 + i);
      return SLOTS.map((sl, si) => {
        if (!valid[si]) return Infinity;
        const r = captionRect(p, sl.y, sl.x);
        let hard = 0;
        let soft = 0;
        for (const bx of boxes) {
          const ar = overlap(r, bx);
          if (bx.kind === "hard") hard += ar;
          else soft += ar;
        }
        // cualquier choque duro es prohibitivo (aunque sea un roce)
        return (hard > 0 ? 1e8 : 0) + hard * 1000 + soft * 0.5 + ROWS.indexOf(sl.y) * 60 + (sl.x === "l" ? 900 : 0);
      });
    });
    // margen temporal: una posición solo vale si también está libre en los fotogramas vecinos
    const dil = cost.map((_, i) => SLOTS.map((__, k) => Math.max(...[-1, 0, 1].map((d) => cost[Math.min(n - 1, Math.max(0, i + d))][k]))));
    // Viterbi
    const K = SLOTS.length;
    const acc: number[][] = [];
    const from: number[][] = [];
    for (let i = 0; i < n; i++) {
      acc.push(new Array(K).fill(Infinity));
      from.push(new Array(K).fill(0));
      for (let k = 0; k < K; k++) {
        if (i === 0) {
          acc[0][k] = dil[0][k] + (k === prevEnd ? 0 : 200);
          continue;
        }
        for (let j = 0; j < K; j++) {
          const v = acc[i - 1][j] + (j === k ? 0 : SWITCH_COST) + dil[i][k];
          if (v < acc[i][k]) {
            acc[i][k] = v;
            from[i][k] = j;
          }
        }
      }
    }
    const path = new Array<number>(n);
    let k = acc[n - 1].indexOf(Math.min(...acc[n - 1]));
    for (let i = n - 1; i >= 0; i--) {
      path[i] = k;
      k = from[i][k];
    }
    prevEnd = path[n - 1];
    // el cambio de lugar es un salto con pop (nunca se desliza por encima de otro elemento)
    const switches = path.flatMap((k2, i) => (i > 0 && k2 !== path[i - 1] ? [f0 + i] : []));
    const ys = path.map((si) => SLOTS[si].y);
    return { ...p, cy: ys[0], f0, f1, ys, xs: path.map((si) => SLOTS[si].x), switches };
  });
  return placed;
};

/** verificación fotograma a fotograma: choques del subtítulo con cajas protegidas */
export const collisionReport = (untilSec: number, frames: number) => {
  const caps = getCaptions(untilSec, frames);
  const rows: { f: number; hard: string[]; soft: string[]; outside: boolean }[] = [];
  for (let f = 0; f < frames; f++) {
    const c = caps.find((p) => f >= p.f0 && f < p.f1);
    if (!c) {
      rows.push({ f, hard: [], soft: [], outside: false });
      continue;
    }
    const r = captionRect(c, captionY(c, f), captionX(c, f));
    const boxes = protectedBoxes(f);
    rows.push({
      f,
      hard: boxes.filter((b) => b.kind === "hard" && overlap(r, b) > 0).map((b) => b.name),
      soft: boxes.filter((b) => b.kind === "soft" && overlap(r, b) > 0).map((b) => b.name),
      outside: r.x0 < SAFE.left || r.x1 > SAFE.right || r.y0 < SAFE.top || r.y1 > SAFE.bottom,
    });
  }
  return rows;
};
