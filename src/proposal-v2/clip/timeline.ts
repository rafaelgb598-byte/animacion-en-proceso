import { blink, clamp, ease, lerp, springSeries, track } from "../../character/anim";
import type { Pose, Rig, Vec } from "../../character/rig";
import { rigV2 } from "../../character/v2/CharacterV2";
import { statePose } from "../../character/v2/acting";
import { beatPose, mixPose, pulse, shake, snap, type Beat } from "../../character/v2/motion2";
import { HEAD_SCALE } from "../../character/v2/style";
import { COUNTER_TOP, FLOOR } from "../../scenes/decoy-v2/CafeV2";
import { CUE } from "../../short-final/timing";

/**
 * Clip de prueba V2 (10 s): el gancho del Short re-animado con Tomi V2.
 * Misma narración, mismos efectos y misma escenografía; cambian actuación, timing,
 * cámara y subtítulos. Todo se calcula una vez (caché) y por fotograma.
 */

export const CLIP_FRAMES = 300;
export const S = 1.5;
export const ROOT = 830;

/* ------------------------------ vasos ------------------------------ */

export const CUP_H = { L: 185, M: 155, S: 120 };
/** los vasos se corren 40 px respecto del Short para que Tomi no asome en los planos de comparación */
const CUPS_DX = 40;
export const M_X = 1270 + CUPS_DX;
export const cupLx = (f: number) => track(f, [[0, 1120 + CUPS_DX], [226, 1120 + CUPS_DX], [238, 1080 + CUPS_DX, snap(0.15)]]);
export const cupSx = (f: number) => track(f, [[0, 1420 + CUPS_DX], [226, 1420 + CUPS_DX], [238, 1460 + CUPS_DX, snap(0.15)]]);
export const mVisible = (f: number) => f >= 224;
export const mDropY = (f: number) => track(f, [[224, -1000], [CUE.mediano + 2, 0, ease.in]]);
export const mSquash = (f: number) =>
  track(f, [[CUE.mediano + 1, 1], [CUE.mediano + 3, 0.68, ease.out], [CUE.mediano + 7, 1.14], [CUE.mediano + 12, 0.95], [CUE.mediano + 17, 1]]);
export const mTagScale = (f: number) => track(f, [[CUE.seis - 3, 0], [CUE.seis + 7, 1, snap(0, 0.01, 4, 1.6 * Math.PI)]]);
/** rebote de aparición de los vasos en el gancho (escala vertical) */
export const cupHookSquash = (f: number, delay: number) =>
  track(f - delay, [[0, 0.86], [4, 1.1, ease.out], [9, 0.97], [14, 1]]);
export const tagPulse = { S: (f: number) => pulse(f, CUE.tres, 0.14), L: (f: number) => pulse(f, CUE.siete, 0.14), M: (f: number) => pulse(f, CUE.seis + 8, 0.08) };

/* ------------------------------ cámara ------------------------------ */

export type Cam = { x: number; y: number; zoom: number };
/** cut: whip-cut (la cámara apenas arranca, salta a mitad del tramo con desenfoque y se asienta) */
type CamKey = { at: number; cam: Cam; dur: number; ease?: (t: number) => number; cut?: boolean };
/**
 * Encuadres que ponen la opción a comparar grande y centrada en la zona segura (centro x ≈ 480,
 * lejos de la columna de botones). PAIR: chico + grande con sus precios. TRIO: los tres vasos.
 */
const SAFE_CX = 480;
const frame = (cx: number, cy: number, zoom: number): Cam => ({ x: cx + (540 - SAFE_CX) / zoom, y: cy, zoom });
const PAIR = frame(1292 + CUPS_DX, 1255, 1.65);
const TRIO = frame(M_X, 1262, 1.48);
const TWO_SHOT: Cam = { x: 1195, y: 1160, zoom: 1.15 }; // Tomi + los dos precios completos
const CAM_KEYS: CamKey[] = [
  { at: 0, cam: { ...PAIR, zoom: 1.56 }, dur: 1 },
  { at: 10, cam: PAIR, dur: 10, ease: snap(0, 0.01, 4.5, 1.6 * Math.PI) }, // gancho: «¿Cuál comprarías?» + precios
  { at: 34, cam: TWO_SHOT, dur: 9, ease: snap(0.08, 0.2) }, // se abre y aparece Tomi justo antes de «¡Rápido!»
  { at: 75, cam: { x: 960, y: 1000, zoom: 1.66 }, dur: 8 }, // se acerca: pensando (aire arriba para el subtítulo)
  { at: CUE.tres, cam: PAIR, dur: 8, cut: true }, // corte a los precios
  { at: 158, cam: { x: 950, y: 995, zoom: 1.64 }, dur: 8, cut: true }, // vuelve a Tomi: decide
  { at: 230, cam: TRIO, dur: 8 }, // cae el mediano: los tres vasos grandes y centrados
  { at: 252, cam: { x: 890, y: 960, zoom: 1.92 }, dur: 6, cut: true }, // reacción de Tomi
  { at: CUE.seis, cam: TRIO, dur: 7, cut: true }, // vuelve al trío: precio nuevo
  { at: 300, cam: { ...TRIO, zoom: 1.5, x: TRIO.x - 0.5 }, dur: 34, ease: ease.inOut },
];
const camBase = (f: number): Cam => {
  let i = 0;
  while (i + 1 < CAM_KEYS.length && f >= CAM_KEYS[i + 1].at) i++;
  const cur = CAM_KEYS[i].cam;
  const next = CAM_KEYS[i + 1];
  if (!next || f < next.at - next.dur) return cur;
  const u = (f - (next.at - next.dur)) / next.dur;
  const t = next.cut
    ? u < 0.5
      ? 0.14 * ease.in(u / 0.5)
      : 0.86 + 0.14 * snap(0, 0.01, 4.5, 1.6 * Math.PI)((u - 0.5) / 0.5)
    : (next.ease ?? ease.inOut)(u);
  return { x: lerp(cur.x, next.cam.x, t), y: lerp(cur.y, next.cam.y, t), zoom: lerp(cur.zoom, next.cam.zoom, t) };
};
/** cámara final: base + pulsos de zoom + temblor en impactos + deriva de cámara en mano */
export const camAt = (f: number): Cam & { sx: number; sy: number } => {
  const c = camBase(f);
  const z = c.zoom * (1 + (pulse(f, CUE.rapido, 0.035, 10) - 1) + (pulse(f, CUE.mediano + 2, 0.07, 12) - 1));
  const s1 = shake(f, CUE.rapido, 7, 4);
  const s2 = shake(f, CUE.mediano + 2, 16, 5);
  const drift = { x: 2.2 * Math.sin(f * 0.031), y: 1.6 * Math.sin(f * 0.023 + 1) };
  return { ...c, zoom: z, sx: s1.x + s2.x + drift.x, sy: s1.y + s2.y + drift.y };
};
/** intensidad de movimiento de cámara (0..14); se usa como desenfoque LEVE solo del fondo */
export const camBlur = (f: number) => {
  if (f <= 0) return 0;
  for (const k of CAM_KEYS)
    if (k.cut && f >= k.at - k.dur && f <= k.at) return 14 * Math.sin(Math.PI * ((f - (k.at - k.dur)) / k.dur));
  const a = camBase(f - 1);
  const b = camBase(f);
  const v = Math.hypot((b.x - a.x) * b.zoom, (b.y - a.y) * b.zoom) + Math.abs(b.zoom - a.zoom) * 700;
  return clamp((v - 6) * 0.1, 0, 12);
};
export const toScreen = (c: Cam & { sx: number; sy: number }, v: Vec): Vec => ({
  x: (v.x - c.x) * c.zoom + 540 + c.sx,
  y: (v.y - c.y) * c.zoom + 960 + c.sy,
});

/* ------------------------------ actuación ------------------------------ */

const P = (s: Parameters<typeof statePose>[0]) => statePose(s, ROOT, FLOOR, S);
const startle = mixPose(P("neutral"), P("sorpresa"), 0.5);

const BEATS: Beat[] = [
  { at: 0, pose: P("neutral") },
  { at: CUE.rapido + 4, pose: startle, dur: 5 }, // "¡Rápido!": respingo
  { at: 70, pose: P("pensando"), dur: 10 }, // mano al mentón
  { at: 156, pose: P("duda"), dur: 8 }, // ¿chico o grande?
  { at: 182, pose: P("firme"), dur: 6 }, // "el grande"
  { at: 210, pose: P("sospecha"), dur: 8 }, // "ahora mirá lo que pasa…"
  { at: CUE.mediano + 5, pose: P("sorpresa"), dur: 6, ease: snap(0.3, 0.35) }, // ¡pum!
  { at: 272, pose: P("incredulidad"), dur: 10 }, // "¿seis con cincuenta?"
];

/** saltos, aterrizajes y desplazamientos sobre la pose de estado */
const hop = (f: number) =>
  track(f, [[0, 0], [CUE.rapido, 0], [CUE.rapido + 4, 11, ease.out], [CUE.rapido + 9, 0, ease.in], [CUE.mediano + 2, 0], [CUE.mediano + 6, 30, ease.out], [CUE.mediano + 12, 0, ease.in]]);
const squashMul = (f: number) =>
  track(f, [
    [0, 0.92], [4, 1.06, ease.out], [9, 0.98], [13, 1],
    [CUE.rapido + 8, 1], [CUE.rapido + 10, 0.95], [CUE.rapido + 15, 1],
    [CUE.mediano + 11, 1], [CUE.mediano + 13, 0.92], [CUE.mediano + 18, 1.03], [CUE.mediano + 22, 1],
  ]);
/** después del salto; durante el corte al trío Tomi queda fuera de cuadro (la comparación va limpia) */
const xOff = (f: number) => track(f, [[CUE.mediano + 2, 0], [CUE.mediano + 12, -38, ease.out], [262, -38], [263, -120]]);

/* ------------------------------ mirada ------------------------------ */

type Target = "L" | "S" | "M" | "Ltag" | "Stag" | "Mtag" | "think" | "cam";
const GAZE: [number, Target][] = [
  [0, "L"], [10, "S"], [22, "L"], [CUE.rapido - 2, "cam"], [64, "think"], [CUE.tres - 3, "Stag"], [CUE.siete - 4, "Ltag"],
  [166, "S"], [178, "L"], [204, "cam"], [226, "M"], [CUE.seis - 2, "Mtag"], [284, "Ltag"], [294, "Mtag"],
];
const targetPoint = (t: Target, f: number): Vec | null => {
  switch (t) {
    case "L": return { x: cupLx(f), y: COUNTER_TOP - CUP_H.L * 0.5 };
    case "S": return { x: cupSx(f), y: COUNTER_TOP - CUP_H.S * 0.5 };
    case "M": return { x: M_X, y: COUNTER_TOP - CUP_H.M * 0.5 + mDropY(f) };
    case "Ltag": return { x: cupLx(f), y: COUNTER_TOP + 80 };
    case "Stag": return { x: cupSx(f), y: COUNTER_TOP + 80 };
    case "Mtag": return { x: M_X, y: COUNTER_TOP + 80 };
    default: return null;
  }
};
const lookFor = (t: Target, f: number, head: Vec): [number, number] => {
  if (t === "think") return [-0.45, -0.85];
  if (t === "cam") return [-0.38, 0.04];
  const p = targetPoint(t, f)!;
  return [clamp((p.x - head.x) / 230, -1, 1), clamp((p.y - head.y) / 300, -1, 1)];
};
const gazeAt = (f: number, head: Vec): [number, number] => {
  let i = 0;
  while (i + 1 < GAZE.length && f >= GAZE[i + 1][0]) i++;
  const cur = lookFor(GAZE[i][1], f, head);
  if (i === 0) return cur;
  const prev = lookFor(GAZE[i - 1][1], f, head);
  const t = ease.saccade(clamp((f - GAZE[i][0]) / 3, 0, 1));
  return [lerp(prev[0], cur[0], t), lerp(prev[1], cur[1], t)];
};

const BLINKS = [30, 98, 142, 197, 233, 288];

/* ------------------------------ caché ------------------------------ */

export type ClipFrame = { pose: Pose; rig: Rig; head: Vec };
let cache: ClipFrame[] | null = null;

const build = (f: number, hair: number, headGaze: [number, number], lag: [number, number]): Pose => {
  const b = beatPose(f, BEATS);
  const breath = Math.sin((f / 46) * Math.PI * 2);
  return {
    ...b,
    x: ROOT + xOff(f),
    hop: b.hop + hop(f),
    squash: b.squash * squashMul(f) * (1 + 0.007 * breath),
    lean: b.lean + 0.6 * Math.sin(f * 0.05),
    shrug: b.shrug + 0.04 * (breath + 1),
    // la cabeza sigue a los ojos con retraso (los ojos llegan primero)
    headTurn: b.headTurn + 0.12 * lag[0],
    headTilt: b.headTilt + 6 * lag[1] + 0.8 * Math.sin(f * 0.07 + 1),
    face: { ...b.face, lookX: headGaze[0], lookY: headGaze[1] },
    blink: blink(f, [...BLINKS, CUE.mediano + 1]),
    hairLag: hair,
  };
};

export const getClip = (): ClipFrame[] => {
  if (cache) return cache;
  const N = CLIP_FRAMES;
  // pasada 1: pose sin mirada para ubicar la cabeza
  const raw = Array.from({ length: N }, (_, f) => {
    const p = build(f, 0, [0, 0], [0, 0]);
    const r = rigV2(p);
    return { x: p.x + r.headCenter.x * S, y: p.y + r.headCenter.y * S };
  });
  const gaze = raw.map((h, f) => gazeAt(f, h));
  const lagX = springSeries(gaze.map((g) => g[0]), 0.16, 0.7);
  const lagY = springSeries(gaze.map((g) => g[1]), 0.16, 0.7);
  // pasada 2: movimiento secundario del mechón (resorte sobre el ángulo de la cabeza)
  const p2 = Array.from({ length: N }, (_, f) => build(f, 0, gaze[f], [lagX[f], lagY[f]]));
  const ang = p2.map((p) => rigV2(p).headAngle + p.hop * 0.25);
  const sp = springSeries(ang, 0.14, 0.72);
  cache = p2.map((_, f) => {
    const pose = build(f, clamp(2.4 * (sp[f] - ang[f]), -28, 28), gaze[f], [lagX[f], lagY[f]]);
    const rig = rigV2(pose);
    return { pose, rig, head: { x: pose.x + rig.headCenter.x * S, y: pose.y + rig.headCenter.y * S } };
  });
  return cache;
};

/* ------------------------------ zonas protegidas (subtítulos) ------------------------------ */

export type Box = { x0: number; y0: number; x1: number; y1: number; kind: "hard" | "soft"; name: string };
const box = (c: ReturnType<typeof camAt>, a: Vec, b: Vec, kind: Box["kind"], name: string): Box => {
  const p = toScreen(c, a);
  const q = toScreen(c, b);
  return { x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y), x1: Math.max(p.x, q.x), y1: Math.max(p.y, q.y), kind, name };
};
export const TITLE_OUT = 52;
/** caja del título: lo sigue mientras sale (sube, se achica y se desvanece) */
export const titleBox = (f: number): Box | null => {
  const leave = ease.in(clamp((f - TITLE_OUT) / 8, 0, 1));
  if (leave > 0.6) return null;
  const sc = 1 - 0.25 * leave;
  const cy = 294 - leave * 160;
  return { x0: 540 - 490 * sc, y0: cy - 98 * sc, x1: 540 + 490 * sc, y1: cy + 70 * sc, kind: "hard", name: "título" };
};

/** cajas en pantalla que el subtítulo nunca debe tapar (hard) o conviene evitar (soft) */
export const protectedBoxes = (f: number): Box[] => {
  const c = camAt(f);
  const { pose, rig, head } = getClip()[f];
  const out: Box[] = [];
  const r = 92 * HEAD_SCALE * S;
  out.push(box(c, { x: head.x - r * 1.05, y: head.y - r * 1.12 }, { x: head.x + r * 1.05, y: head.y + r * 1.05 }, "hard", "cara"));
  out.push(box(c, { x: head.x - r * 0.6, y: head.y - r * 1.6 }, { x: head.x + r * 0.6, y: head.y - r * 1.12 }, "soft", "mechón"));
  const L = (v: Vec): Vec => ({ x: pose.x + v.x * S, y: pose.y + v.y * S });
  const hipY = L(rig.legF.hip).y;
  for (const [name, w] of [["mano", rig.front.wr], ["mano2", rig.back.wr]] as const) {
    const p = L(w);
    out.push(box(c, { x: p.x - 34 * S, y: p.y - 34 * S }, { x: p.x + 34 * S, y: p.y + 40 * S }, p.y < hipY ? "hard" : "soft", name));
  }
  const neck = L(rig.neck);
  out.push(box(c, { x: neck.x - 64 * S, y: neck.y }, { x: neck.x + 64 * S, y: FLOOR }, "soft", "cuerpo"));
  const cup = (x: number, h: number, name: string, dy = 0) => {
    out.push(box(c, { x: x - h * 0.4 - 8, y: COUNTER_TOP - h - 40 + dy }, { x: x + h * 0.4 + 8, y: COUNTER_TOP + dy }, "hard", name));
  };
  cup(cupLx(f), CUP_H.L, "vaso L");
  cup(cupSx(f), CUP_H.S, "vaso S");
  out.push(box(c, { x: cupLx(f) - 92, y: COUNTER_TOP + 14 }, { x: cupLx(f) + 92, y: COUNTER_TOP + 150 }, "hard", "precio L"));
  out.push(box(c, { x: cupSx(f) - 92, y: COUNTER_TOP + 14 }, { x: cupSx(f) + 92, y: COUNTER_TOP + 150 }, "hard", "precio S"));
  if (mVisible(f)) {
    cup(M_X, CUP_H.M, "vaso M", mDropY(f));
    if (mTagScale(f) > 0.01) out.push(box(c, { x: M_X - 92, y: COUNTER_TOP + 14 }, { x: M_X + 92, y: COUNTER_TOP + 150 }, "hard", "precio M"));
  }
  const tb = titleBox(f);
  if (tb) out.push(tb);
  return out;
};

