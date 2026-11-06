import { clamp, ease, smooth } from "../character/anim";
import { rigV2 } from "../character/v2/CharacterV2";
import { HEAD_SCALE } from "../character/v2/style";
import { presenter } from "../short-final/BoardScene";
import { CUE, SCENE } from "../short-final/timing";
import { cafeBoxes, type Box } from "./cafe";

/**
 * Montaje del Short V2 (idéntico al Short final): café → pizarrón → café con deslizamientos
 * verticales de 12 fotogramas. Acá vive también el mapa de zonas protegidas de cada fotograma
 * (cafetería, pizarrón y títulos), que usan los subtítulos y el QA.
 */

export const T = 12;
const slide = (f: number, at: number) => ease.inOut(clamp((f - (at - T / 2)) / T, 0, 1));

export const montage = (f: number) => {
  const toBoard = slide(f, SCENE.boardIn);
  const toCafe = slide(f, SCENE.boardOut);
  const firstHalf = f < SCENE.boardOut - T;
  return {
    showCafe: f < SCENE.boardIn + T / 2 || f >= SCENE.boardOut - T / 2,
    showBoard: f >= SCENE.boardIn - T / 2 && f < SCENE.boardOut + T / 2,
    cafeY: firstHalf ? -toBoard * 1920 : (1 - toCafe) * 1920,
    boardY: firstHalf ? (1 - toBoard) * 1920 : -toCafe * 1920,
    /** fotograma de la cafetería que se ve (queda quieta durante el pizarrón) */
    cafeF: firstHalf ? Math.min(f, SCENE.boardIn + T) : Math.max(f, SCENE.boardOut - T),
  };
};

/* ------------------------------ títulos ------------------------------ */

export const TITLE_OUT = 52;
export const LOOP_TITLE_IN = 1342;
/** caja del título del gancho / loop (lo sigue mientras entra o sale) */
export const titleBox = (f: number): Box | null => {
  let leave = 0;
  if (f < 300) leave = ease.in(clamp((f - TITLE_OUT) / 8, 0, 1));
  else if (f >= LOOP_TITLE_IN - 2) leave = 1 - smooth((f - LOOP_TITLE_IN) / 8);
  else return null;
  if (leave > 0.6) return null;
  const sc = 1 - 0.25 * leave;
  const cy = 294 - leave * 160;
  return { x0: 540 - 490 * sc, y0: cy - 98 * sc, x1: 540 + 490 * sc, y1: cy + 70 * sc, kind: "hard", name: "título" };
};

/* ------------------------------ pizarrón ------------------------------ */

const B = (at: number) => at - SCENE.boardIn;
const rv = (b: number, at: number, dur: number) => smooth((b - B(at)) / dur);
const rect = (x0: number, y0: number, x1: number, y1: number, name: string, dy: number, kind: Box["kind"] = "hard"): Box => ({ x0, y0: y0 + dy, x1, y1: y1 + dy, kind, name });

/** cajas del pizarrón (coordenadas de pantalla de BoardScene) */
export const boardBoxes = (f: number, dy = 0): Box[] => {
  const b = f - SCENE.boardIn;
  const out: Box[] = [];
  const study = 1 - smooth((b - (B(CUE.cafes) - 18)) / 14);
  if (rv(b, CUE.efecto - 6, 26) > 0.02) out.push(rect(240, 178, 880, 312, "título pizarrón", dy));
  if (study > 0.1) {
    if (rv(b, CUE.anio, 10) > 0.02) out.push(rect(560, 318, 840, 452, "1982", dy));
    if (rv(b, CUE.huber, 12) > 0.02) out.push(rect(395, 478, 1015, 652, "cita", dy));
    if (rv(b, CUE.sumar, 10) > 0.02) out.push(rect(385, 660, 965, 915, "opciones", dy));
    if (rv(b, CUE.menos, 10) > 0.02) out.push(rect(790, 915, 970, 1000, "menos atractiva", dy));
  }
  if (rv(b, CUE.cafes - 8, 10) > 0.02) out.push(rect(420, 350, 910, 445, "…y también", dy));
  if (rv(b, CUE.entradas - 4, 12) > 0.02) out.push(rect(410, 470, 1000, 765, "cine", dy));
  if (rv(b, CUE.suscripciones - 4, 12) > 0.02) out.push(rect(410, 750, 1000, 1015, "suscripciones", dy));
  // Tomi presentador (V2)
  const p = presenter(Math.max(0, b));
  const r = rigV2(p);
  const hx = p.x + r.headCenter.x * p.scale;
  const hy = p.y + r.headCenter.y * p.scale;
  const hr = 92 * HEAD_SCALE * p.scale;
  out.push(rect(hx - hr * 1.05, hy - hr * 1.12, hx + hr * 1.05, hy + hr * 1.15, "cara", dy));
  const chestY = p.y + ((r.neck.y + r.legF.hip.y) / 2) * p.scale;
  for (const [name, w] of [["mano", r.back.wr], ["mano2", r.front.wr]] as const) {
    const hand = { x: p.x + w.x * p.scale, y: p.y + w.y * p.scale };
    out.push(rect(hand.x - 50, hand.y - 50, hand.x + 50, hand.y + 60, name, dy, hand.y < chestY ? "hard" : "soft"));
  }
  out.push(rect(hx - 100, hy + hr, hx + 100, 1760, "cuerpo", dy, "soft"));
  return out;
};

/** todas las zonas protegidas visibles en el fotograma f */
export const frameBoxes = (f: number): Box[] => {
  const m = montage(f);
  const out: Box[] = [];
  if (m.showCafe) out.push(...cafeBoxes(m.cafeF, m.cafeY));
  if (m.showBoard) out.push(...boardBoxes(f, m.boardY));
  const t = titleBox(f);
  if (t) out.push(t);
  return out.filter((b) => b.y1 > 0 && b.y0 < 1920);
};
