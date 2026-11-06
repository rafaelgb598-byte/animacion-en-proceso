// V3 · Planos. Cada cambio de plano está motivado por la narración y revela algo nuevo.
// world: cámara sobre el cuarto/pradera (encuadre centrado en cx,cy con zoom).
// macro: escena dedicada al celular (cenital «top», perfil «side», restos «fragment»).
import { CAM_EASE, lerp } from "./lib/anim";
import { LAYOUT } from "./theme";

export type Framing = { cx: number; cy: number; zoom: number; rotX: number; rotY: number };
type Key = Framing & { f: number; cut?: boolean; note: string };

const F = {
  phoneTable: { cx: 560, cy: 985, zoom: 1.9, rotX: 8, rotY: 0 },
  medium: { cx: 540, cy: 1020, zoom: 1.0, rotX: 6, rotY: 0 },
  wide: { cx: 540, cy: 960, zoom: 0.9, rotX: 4, rotY: -4 },
  lamp: { cx: 360, cy: 790, zoom: 1.55, rotX: 5, rotY: -2 },
  window: { cx: 275, cy: 610, zoom: 1.6, rotX: 4, rotY: 3 },
  collapse: { cx: 520, cy: 900, zoom: 0.84, rotX: 4, rotY: -6 },
  debris: { cx: 565, cy: 1185, zoom: 1.55, rotX: 9, rotY: 0 },
  meadow: { cx: 540, cy: 980, zoom: 0.92, rotX: 3, rotY: 0 },
  phone200: { cx: 640, cy: 1215, zoom: 1.6, rotX: 12, rotY: 0 },
  meadow1000: { cx: 540, cy: 1000, zoom: 0.95, rotX: 3, rotY: 0 },
  mound: { cx: 550, cy: 1090, zoom: 1.3, rotX: 6, rotY: 0 },
} as const;

/** Claves de cámara del mundo. `cut: true` = corte seco en ese frame (sin interpolar desde la anterior). */
export const WORLD_KEYS: readonly Key[] = [
  { f: 0, ...F.phoneTable, note: "oculto bajo el macro" },
  { f: 74, ...F.phoneTable, note: "empieza la tirada atrás" },
  { f: 104, ...F.medium, note: "plano medio: dónde está" },
  { f: 140, ...F.medium, note: "corte de luz" },
  { f: 176, ...F.phoneTable, note: "empuje a la pantalla que se apaga" },
  { f: 240, ...F.wide, cut: true, note: "salto → plano general del cuarto" },
  { f: 300, ...F.wide, note: "año 1: polvo" },
  { f: 340, ...F.lamp, note: "la tela se mancha" },
  { f: 364, ...F.window, cut: true, note: "año 10: la ventana" },
  { f: 420, ...F.window, note: "(macro lateral encima)" },
  { f: 482, ...F.collapse, cut: true, note: "derrumbe 30→50" },
  { f: 556, ...F.debris, cut: true, note: "el celular sobre los restos" },
  { f: 662, ...F.meadow, cut: true, note: "siglos: pradera" },
  { f: 700, ...F.meadow, note: "grúa abajo" },
  { f: 740, ...F.phone200, note: "celular semienterrado" },
  { f: 836, ...F.meadow1000, cut: true, note: "mil años" },
  { f: 872, ...F.mound, note: "empuje al montículo" },
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

/** Proyección aproximada mundo → pantalla (sin perspectiva), para ubicar indicaciones. */
export const worldToScreen = (p: { x: number; y: number }, frame: number) => {
  const c = worldFraming(frame);
  return { x: LAYOUT.screenAnchor.x + (p.x - c.cx) * c.zoom, y: LAYOUT.screenAnchor.y + (p.y - c.cy) * c.zoom };
};

export type MacroView = "top" | "side" | "fragment";
export type MacroShot = { from: number; to: number; view: MacroView; fadeIn: number; fadeOut: number; scaleFrom: number; scaleTo: number; note: string };

/** Planos macro (encima del mundo). */
export const MACRO_SHOTS: readonly MacroShot[] = [
  { from: 0, to: 98, view: "top", fadeIn: 0, fadeOut: 22, scaleFrom: 1, scaleTo: 0.62, note: "gancho: el perro; tirada atrás 74–98" },
  { from: 168, to: 240, view: "top", fadeIn: 12, fadeOut: 0, scaleFrom: 0.8, scaleTo: 1.04, note: "pantalla que se apaga + rayos X" },
  { from: 420, to: 482, view: "side", fadeIn: 0, fadeOut: 0, scaleFrom: 1, scaleTo: 1.05, note: "batería hinchada" },
  { from: 872, to: 1085, view: "fragment", fadeIn: 0, fadeOut: 0, scaleFrom: 1, scaleTo: 1.08, note: "restos + match cut" },
  { from: 1060, to: 1350, view: "top", fadeIn: 25, fadeOut: 0, scaleFrom: 1.08, scaleTo: 1, note: "la foto; se pierde; vuelve" },
];

/** Shots macro activos en el frame, con opacidad y escala. */
export const macroAt = (frame: number) =>
  MACRO_SHOTS.filter((s) => frame >= s.from && frame < s.to).map((s) => {
    const fi = s.fadeIn ? lerp(frame, [s.from, s.from + s.fadeIn], [0, 1]) : 1;
    const fo = s.fadeOut ? lerp(frame, [s.to - s.fadeOut, s.to], [1, 0]) : 1;
    // la escala se mueve durante los fundidos (dolly) y queda casi quieta el resto
    const scale =
      s.view === "top" && s.from === 0
        ? lerp(frame, [s.to - s.fadeOut - 2, s.to], [s.scaleFrom, s.scaleTo], CAM_EASE)
        : lerp(frame, [s.from, s.to], [s.scaleFrom, s.scaleTo], CAM_EASE);
    return { shot: s, opacity: Math.min(fi, fo), scale };
  });

/** ¿El mundo está totalmente tapado? (para no renderizarlo). */
export const worldHidden = (frame: number) => macroAt(frame).some((m) => m.opacity >= 0.999);
