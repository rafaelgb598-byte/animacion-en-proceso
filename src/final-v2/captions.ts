import { WORDS, type Word } from "../short-final/words";
import type { Box } from "./cafe";

/**
 * Subtítulos del Short V2: viven en un CARRIL FIJO abajo (justo encima de la UI de Shorts).
 *
 * - Zona segura: nada por debajo de y = 1536 ni a la derecha de x = 900.
 * - Los planos se encuadran para dejar el carril libre; el subtítulo se queda ahí.
 * - Si algo protegido (cara, manos levantadas, vasos, precios, textos) invade el carril, primero
 *   se recuesta a la izquierda en el mismo renglón y, si no alcanza, sube lo mínimo necesario.
 *   Moverse cuesta mucho más que antes y cuesta más cuanto más lejos va: nunca "salta" arriba.
 * - Último recurso: si en un fotograma no hay lugar libre, el subtítulo se oculta un instante
 *   (fundido de 2 fotogramas) en vez de tapar algo.
 */

export const FPS = 30;
export const SAFE = { left: 60, right: 900, top: 230, bottom: 1536 };
/** renglones por BORDE INFERIOR: el subtítulo apoya siempre sobre la misma línea y crece hacia arriba */
export const BASES = [1530, 1440, 1350, 1260, 1170, 1080, 990, 900, 810, 720, 630, 540, 450];
export type Slot = { x: "c" | "l"; base: number; row: number };
const SLOTS: Slot[] = [...BASES.map((base, row) => ({ x: "c" as const, base, row })), ...BASES.map((base, row) => ({ x: "l" as const, base, row }))];
/** centro vertical de una página apoyada en `base` */
export const centerY = (p: { h: number }, base: number) => base - p.h / 2;
const PAD = 22;
const CHAR_W = 0.7;

const ROW_COST = 25000; // por renglón que se aleja del carril (pesa más que pasar sobre zonas blandas)
const LEFT_COST = 1500; // recostarse a la izquierda en el mismo renglón
const SWITCH_COST = 60000;
const SWITCH_PER_ROW = 20000;
/** ocultar 1 fotograma (último recurso ante un cruce breve; más barato que un salto grande) */
const HIDE_COST = 90000;

export type Page = { words: Word[]; start: number; end: number; lines: Word[][]; size: number; w: number; h: number; safe: typeof SAFE };

const buildPages = (words: Word[], safe: typeof SAFE = SAFE, oneLineMax = 14): Page[] => {
  const maxW = safe.right - safe.left - 40;
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
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
    const end = next ? Math.min(next[0].s, ws[ws.length - 1].e + 0.6) : ws[ws.length - 1].e + 0.8;
    const text = ws.map((w) => w.t).join(" ");
    let lines: Word[][] = [ws];
    if (text.length > oneLineMax && ws.length > 1) {
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
    const size = Math.min(70, maxW / (longest * CHAR_W));
    const w = longest * size * CHAR_W + PAD * 2;
    const h = lines.length * size * 1.22 + PAD * 1.4;
    return { words: ws, start: ws[0].s - 0.08, end, lines, size, w, h, safe };
  });
};

export const slotX = (p: Page, x: Slot["x"]) => (x === "c" ? (p.safe.left + p.safe.right) / 2 : p.safe.left + 6 + p.w / 2);
export const captionRect = (p: Page, y: number, x: Slot["x"]) => {
  const cx = slotX(p, x);
  return { x0: cx - p.w / 2, x1: cx + p.w / 2, y0: y - p.h / 2, y1: y + p.h / 2 };
};
const overlap = (a: { x0: number; y0: number; x1: number; y1: number }, b: Box) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

export type Placed = Page & { f0: number; f1: number; slots: Slot[]; hidden: boolean[]; switches: number[] };

/** Opciones de carril (por defecto, las del Short aprobado). */
/** oneLineMax: hasta cuántos caracteres una página va en un solo renglón (por defecto 14) */
export type CaptionOpts = { safe?: typeof SAFE; bases?: number[]; oneLineMax?: number };
const cache = new Map<unknown, { words: Word[]; key: string; placed: Placed[] }>();

/** ubica todas las páginas (una vez); `boxesAt(f)` = zonas protegidas del fotograma f */
export const getCaptions = (frames: number, boxesAt: (f: number) => Box[], words: Word[] = WORDS, opts: CaptionOpts = {}): Placed[] => {
  const key = JSON.stringify(opts);
  const hit = cache.get(boxesAt);
  if (hit && hit.words === words && hit.key === key) return hit.placed;
  const safe = opts.safe ?? SAFE;
  const slotsAll: Slot[] = opts.bases
    ? [...opts.bases.map((base, row) => ({ x: "c" as const, base, row })), ...opts.bases.map((base, row) => ({ x: "l" as const, base, row }))]
    : SLOTS;
  const pages = buildPages(words, safe, opts.oneLineMax);
  let prev = 0;
  const placed = pages.map((p) => {
    const f0 = Math.max(0, Math.floor(p.start * FPS));
    const f1 = Math.min(frames, Math.ceil(p.end * FPS));
    const n = Math.max(1, f1 - f0);
    const valid = slotsAll.map((sl) => {
      const r = captionRect(p, centerY(p, sl.base), sl.x);
      return r.y0 >= safe.top && r.y1 <= safe.bottom;
    });
    const hardAt: number[][] = [];
    const cost = Array.from({ length: n }, (_, i) => {
      const boxes = boxesAt(f0 + i);
      const hard: number[] = [];
      const c = slotsAll.map((sl, si) => {
        if (!valid[si]) {
          hard.push(Infinity);
          return Infinity;
        }
        const r = captionRect(p, centerY(p, sl.base), sl.x);
        let h = 0;
        let s = 0;
        for (const b of boxes) {
          const a = overlap(r, b);
          if (b.kind === "hard") h += a;
          else s += a;
        }
        hard.push(h);
        return (h > 0 ? 1e8 : 0) + h * 1000 + s * 0.5 + sl.row * ROW_COST + (sl.x === "l" ? LEFT_COST : 0);
      });
      hardAt.push(hard);
      return c;
    });
    const K = slotsAll.length + 1; // último estado = oculto
    const HID = K - 1;
    const dil = cost.map((_, i) => [
      ...slotsAll.map((__, k) => Math.max(...[-1, 0, 1].map((d) => cost[Math.min(n - 1, Math.max(0, i + d))][k]))),
      HIDE_COST,
    ]);
    const rowOf = (k: number) => (k === HID ? -1 : slotsAll[k].row);
    const sw = (j: number, k: number) =>
      j === k ? 0 : j === HID || k === HID ? 0 : SWITCH_COST + Math.abs(rowOf(j) - rowOf(k)) * SWITCH_PER_ROW;
    const acc: number[][] = [];
    const from: number[][] = [];
    for (let i = 0; i < n; i++) {
      acc.push(new Array(K).fill(Infinity));
      from.push(new Array(K).fill(0));
      for (let k = 0; k < K; k++) {
        if (i === 0) {
          acc[0][k] = dil[0][k] + (k === prev || k === HID ? 0 : Math.abs(rowOf(k) - rowOf(prev)) * SWITCH_PER_ROW);
          continue;
        }
        for (let j = 0; j < K; j++) {
          const v = acc[i - 1][j] + sw(j, k) + dil[i][k];
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
    // los fotogramas ocultos conservan el lugar visible más cercano (para retomar sin moverse)
    const vis = path.map((k2) => (k2 === HID ? -1 : k2));
    for (let i = 0; i < n; i++) if (vis[i] < 0) vis[i] = i > 0 && vis[i - 1] >= 0 ? vis[i - 1] : -1;
    for (let i = n - 1; i >= 0; i--) if (vis[i] < 0) vis[i] = i < n - 1 && vis[i + 1] >= 0 ? vis[i + 1] : 0;
    prev = vis[n - 1];
    return {
      ...p,
      f0,
      f1,
      slots: vis.map((si) => slotsAll[si]),
      hidden: path.map((k2, i) => k2 === HID || hardAt[i][k2] > 0),
      switches: vis.flatMap((si, i) => (i > 0 && si !== vis[i - 1] ? [f0 + i] : [])),
    };
  });
  cache.set(boxesAt, { words, key, placed });
  return placed;
};

export const pageAt = (caps: Placed[], f: number) => caps.find((p) => f >= p.f0 && f < p.f1) ?? null;
const at = (p: Placed, f: number) => Math.min(p.slots.length - 1, Math.max(0, f - p.f0));
export const slotAt = (p: Placed, f: number) => p.slots[at(p, f)];
/** opacidad por ocultamiento de último recurso (fundido de 2 fotogramas) */
export const hideFade = (p: Placed, f: number) => {
  let m = 1;
  for (let d = -2; d <= 2; d++) {
    const i = f - p.f0 + d;
    if (i >= 0 && i < p.hidden.length && p.hidden[i]) m = Math.min(m, Math.abs(d) / 3);
  }
  return m;
};

/** QA fotograma a fotograma */
export const captionReport = (frames: number, boxesAt: (f: number) => Box[], words: Word[] = WORDS, opts: CaptionOpts = {}) => {
  const caps = getCaptions(frames, boxesAt, words, opts);
  const rows: { f: number; has: boolean; hard: string[]; soft: string[]; lane: boolean; hidden: boolean; y: number }[] = [];
  for (let f = 0; f < frames; f++) {
    const p = pageAt(caps, f);
    if (!p) {
      rows.push({ f, has: false, hard: [], soft: [], lane: false, hidden: false, y: 0 });
      continue;
    }
    const sl = slotAt(p, f);
    const hidden = hideFade(p, f) < 1;
    const r = captionRect(p, centerY(p, sl.base), sl.x);
    const boxes = boxesAt(f);
    rows.push({
      f,
      has: true,
      hidden,
      hard: hidden ? [] : boxes.filter((b) => b.kind === "hard" && overlap(r, b) > 0).map((b) => b.name),
      soft: boxes.filter((b) => b.kind === "soft" && overlap(r, b) > 0).map((b) => b.name),
      lane: sl.row === 0,
      y: sl.base,
    });
  }
  const jumps = caps.flatMap((p) => p.switches.map((sw) => ({ f: sw, dy: Math.abs(slotAt(p, sw).base - slotAt(p, sw - 1).base) })));
  // saltos entre páginas consecutivas también cuentan si cambian de renglón
  for (let i = 1; i < caps.length; i++) {
    const a = caps[i - 1];
    const b = caps[i];
    const dy = Math.abs(slotAt(b, b.f0).base - slotAt(a, a.f1 - 1).base);
    if (dy > 0) jumps.push({ f: b.f0, dy });
  }
  return { rows, caps, jumps };
};
