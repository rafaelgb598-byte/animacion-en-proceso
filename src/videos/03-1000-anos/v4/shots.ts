// V4 · Planos. Cada cambio de plano está motivado por la narración y revela algo nuevo.
// world: cámara sobre el cuarto/pradera (encuadre centrado en cx,cy con zoom).
// macro: escena dedicada al celular (cenital «top», restos «fragment»). La v4 no usa la vista lateral.
import { CAM_EASE, lerp } from "./lib/anim";
import { LAYOUT } from "./theme";
import { CUE, DURATION, SHOT_F as S, VOICE_CUES } from "./timeline";

export type Framing = { cx: number; cy: number; zoom: number; rotX: number; rotY: number };
type Key = Framing & { f: number; cut?: boolean; note: string };

const F = {
  phoneTable: { cx: 560, cy: 985, zoom: 1.9, rotX: 8, rotY: 0 },
  medium: { cx: 540, cy: 1020, zoom: 1.0, rotX: 6, rotY: 0 },
  wide: { cx: 540, cy: 960, zoom: 0.9, rotX: 4, rotY: -4 },
  lamp: { cx: 360, cy: 790, zoom: 1.55, rotX: 5, rotY: -2 },
  windowPhone: { cx: 420, cy: 790, zoom: 1.12, rotX: 5, rotY: 2 },
  phone10: { cx: 565, cy: 990, zoom: 2.15, rotX: 9, rotY: 0 },
  collapse: { cx: 520, cy: 900, zoom: 0.84, rotX: 4, rotY: -6 },
  debris: { cx: 565, cy: 1185, zoom: 1.55, rotX: 9, rotY: 0 },
  meadow: { cx: 540, cy: 980, zoom: 0.92, rotX: 3, rotY: 0 },
  phone200: { cx: 600, cy: 1190, zoom: 1.75, rotX: 12, rotY: 0 },
  meadow1000: { cx: 540, cy: 1000, zoom: 0.95, rotX: 3, rotY: 0 },
} as const;

/** Claves de cámara del mundo. `cut: true` = corte seco en ese frame. */
export const WORLD_KEYS: readonly Key[] = [
  { f: 0, ...F.phoneTable, note: "oculto bajo el macro" },
  { f: S.pullStart, ...F.phoneTable, note: "empieza la tirada atrás" },
  { f: S.pullEnd, ...F.medium, note: "plano medio: dónde está; se corta la luz" },
  { f: S.mediumHold, ...F.medium, note: "la batería se agota" },
  { f: S.pushPhone, ...F.phoneTable, note: "empuje a la pantalla que se apaga" },
  { f: S.wideCut, ...F.wide, cut: true, note: "salto → plano general del cuarto" },
  { f: S.wideHold, ...F.wide, note: "año 1: polvo" },
  { f: S.lamp, ...F.lamp, note: "la tela se mancha" },
  { f: S.windowCut, ...F.windowPhone, cut: true, note: "año 10: ventana y celular en el mismo plano" },
  { f: S.windowHold, ...F.windowPhone, note: "se rompe la ventana" },
  { f: S.phone10, ...F.phone10, note: "empuje al celular: el vidrio se levanta" },
  { f: S.collapseCut, ...F.collapse, cut: true, note: "derrumbe 30→50" },
  { f: S.debrisCut, ...F.debris, cut: true, note: "el celular sobre los restos" },
  { f: S.meadowCut, ...F.meadow, cut: true, note: "siglos: pradera" },
  { f: S.craneStart, ...F.meadow, note: "grúa abajo" },
  { f: S.phone200, ...F.phone200, note: "celular semienterrado" },
  { f: S.meadow1000Cut, ...F.meadow1000, cut: true, note: "mil años" },
];

export const worldFraming = (frame: number): Framing => {
  const keys = WORLD_KEYS;
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.f && frame < b.f) {
      if (b.cut) return a;
      const t = lerp(frame, [a.f, b.f], [0, 1], CAM_EASE);
      return {
        cx: a.cx + (b.cx - a.cx) * t,
        cy: a.cy + (b.cy - a.cy) * t,
        zoom: a.zoom + (b.zoom - a.zoom) * t,
        rotX: a.rotX + (b.rotX - a.rotX) * t,
        rotY: a.rotY + (b.rotY - a.rotY) * t,
      };
    }
  }
  return keys[keys.length - 1];
};

export const worldToScreen = (p: { x: number; y: number }, frame: number) => {
  const c = worldFraming(frame);
  return { x: LAYOUT.screenAnchor.x + (p.x - c.cx) * c.zoom, y: LAYOUT.screenAnchor.y + (p.y - c.cy) * c.zoom };
};

export type MacroView = "top" | "side" | "fragment";
export type MacroShot = { id: string; from: number; to: number; view: MacroView; fadeIn: number; fadeOut: number; note: string };

export const MACRO_SHOTS: readonly MacroShot[] = [
  { id: "hook", from: 0, to: S.pullEnd, view: "top", fadeIn: 0, fadeOut: S.pullEnd - S.pullStart, note: "gancho: el perro; acercamiento y tirada atrás" },
  { id: "xray", from: S.xrayFrom, to: S.wideCut, view: "top", fadeIn: S.xrayFadeIn, fadeOut: 0, note: "pantalla que se apaga + rayos X" },
  { id: "fragment", from: S.fragmentCut, to: CUE.matchEnd, view: "fragment", fadeIn: 0, fadeOut: 0, note: "restos, etiquetas, carta y transición" },
  { id: "final", from: CUE.matchStart, to: DURATION, view: "top", fadeIn: S.finalFadeIn, fadeOut: 0, note: "la foto; se pierde; vuelve (loop)" },
];

/** Escala de cada plano macro (dolly). */
const macroScale = (s: MacroShot, frame: number) => {
  if (s.id === "hook") {
    const push = lerp(frame, [...CUE.pushIn], [1, 1.04], CAM_EASE);
    return frame < S.pullStart ? push : lerp(frame, [S.pullStart, S.pullEnd], [1.04, 0.62], CAM_EASE);
  }
  if (s.id === "xray") return lerp(frame, [s.from, s.to], [0.8, 1.04], CAM_EASE);
  if (s.id === "fragment") return lerp(frame, [s.from, CUE.card], [1, 1.08], CAM_EASE);
  // final: del encuadre de la transición al del fotograma 0 (escala 1) antes del pixelado
  return lerp(frame, [s.from, VOICE_CUES.v4memory], [1.08, 1], CAM_EASE);
};

export const macroAt = (frame: number) =>
  MACRO_SHOTS.filter((s) => frame >= s.from && frame < s.to).map((s) => {
    const fi = s.fadeIn ? lerp(frame, [s.from, s.from + s.fadeIn], [0, 1]) : 1;
    const fo = s.fadeOut ? lerp(frame, [s.to - s.fadeOut, s.to], [1, 0]) : 1;
    return { shot: s, opacity: Math.min(fi, fo), scale: macroScale(s, frame) };
  });

export const worldHidden = (frame: number) => macroAt(frame).some((m) => m.opacity >= 0.999);
