import { blink, clamp, ease, lerp, pathTrack, smooth, springSeries, track, type PathKey } from "../../../canal/personaje/anim";
import { footState, hipHeightFor, smoothUnder, type FootPlan } from "../../../canal/personaje/feet";
import type { HandShape, Pose, Rig, Vec } from "../../../canal/personaje/rig";
import { rigV2 } from "../../../canal/personaje/tomi-v2/CharacterV2";
import { FACE, statePose, type ActState } from "../../../canal/personaje/tomi-v2/acting";
import { beatPose, mixPose, pulse, shake, snap, type Beat } from "../../../canal/personaje/tomi-v2/motion2";
import { DIM_V2, HEAD_SCALE } from "../../../canal/personaje/tomi-v2/style";
import { COUNTER_TOP, FLOOR } from "../../../canal/escenarios/cafeteria/CafeV2";
import { handAt } from "../short-final/cafe";
import { CUE, DURATION, SCENE } from "../short-final/timing";

/**
 * SHORT V2 — actuación, cámara y objetos de la cafetería (escenas A y B).
 * Mismos tiempos de narración, efectos y montaje que el Short final; los primeros 10 s
 * son los del clip de prueba aprobado. Todo se calcula una vez por fotograma (caché).
 *
 * Reglas de encuadre (permanentes): las comparaciones van grandes y centradas en la zona
 * segura, el dibujo nunca se desenfoca y el carril de subtítulos de abajo queda libre.
 */

export const N = DURATION;
export const S = 1.5;
export const ROOT = 830;

/* ------------------------------ vasos ------------------------------ */

const CUPS_DX = 40;
export const CUP_H = { L: 185, M: 155, S: 120 };
export const M_X = 1270 + CUPS_DX;
const LX0 = 1120 + CUPS_DX;
const SX0 = 1420 + CUPS_DX;
export const cupLx = (f: number) =>
  track(f, [[0, LX0], [226, LX0], [238, LX0 - 40, snap(0.15)], [1300, LX0 - 40], [1318, LX0, ease.inOut]]);
export const cupSx = (f: number) =>
  track(f, [[0, SX0], [226, SX0], [238, SX0 + 40, snap(0.15)], [1300, SX0 + 40], [1318, SX0, ease.inOut]]);
export const mVisible = (f: number) => f >= 224 && f < 1314;
export const mDropY = (f: number) => track(f, [[224, -1000], [CUE.mediano + 2, 0, ease.in], [1296, 0], [1313, 260, ease.in]]);
export const mSquash = (f: number) =>
  track(f, [[CUE.mediano + 1, 1], [CUE.mediano + 3, 0.68, ease.out], [CUE.mediano + 7, 1.14], [CUE.mediano + 12, 0.95], [CUE.mediano + 17, 1]]);
export const mTagScale = (f: number) =>
  track(f, [[CUE.seis - 3, 0], [CUE.seis + 7, 1, snap(0, 0.01, 4, 1.6 * Math.PI)], [1294, 1], [1306, 0, ease.in]]);
export const cupHookSquash = (f: number, delay: number) => track(f - delay, [[0, 0.86], [4, 1.1, ease.out], [9, 0.97], [14, 1]]);
export const tagPulse = {
  S: (f: number) => pulse(f, CUE.tres, 0.14) * pulse(f, CUE.comparas - 4, 0.08),
  L: (f: number) => pulse(f, CUE.siete, 0.14) * pulse(f, CUE.ganga, 0.1) * pulse(f, CUE.nunca, 0.06) * pulse(f, CUE.mejor, 0.1),
  M: (f: number) => pulse(f, CUE.seis + 8, 0.08) * pulse(f, CUE.medio, 0.1),
};
export const napkinHeld = (f: number) => f >= 1248 && f < CUE.mediano2 + 1;
export const napkinDraped = (f: number) => f >= CUE.mediano2 + 1 && mVisible(f);
export const napkinT = (f: number) => smooth((f - CUE.mediano2 - 1) / 6);

/* ------------------------------ gráficos de tiza (tiempos) ------------------------------ */

export const FX = {
  hiS: (f: number) => smooth((f - CUE.tres) / 6) * (1 - smooth((f - CUE.tres - 50) / 10)),
  hiL: (f: number) => smooth((f - CUE.siete) / 6) * (1 - smooth((f - 330) / 10)) + (f >= 560 && f < 632 ? 1 : 0),
  hiM: (f: number) => smooth((f - CUE.seis) / 6) * (1 - smooth((f - 330) / 10)),
  /** "+US$0,50" entre el mediano y el grande */
  half: (f: number) => smooth((f - CUE.cincuenta + 2) / 12) * (1 - smooth((f - 448) / 6)),
  /** "nunca cambió": círculo de tiza y brillo sobre el US$7 */
  reveal: (f: number) => (f >= 500 && f < 632 ? smooth((f - CUE.nunca + 4) / 8) : 0),
  arcCaro: (f: number) => (f >= 560 && f < 632 ? smooth((f - CUE.cambio) / 14) : 0),
  arcGanga: (f: number) => (f >= 560 && f < 632 ? smooth((f - CUE.comparas + 6) / 14) : 0),
  mGlow: (f: number) => smooth((f - CUE.medio) / 8) * (1 - smooth((f - 1232) / 10)),
  lSparkle: (f: number) => smooth((f - CUE.mejor) / 6) * (1 - smooth((f - 1270) / 8)),
};

/* ------------------------------ cámara ------------------------------ */

export type Cam = { x: number; y: number; zoom: number };
export type CamF = Cam & { sx: number; sy: number };
type CamKey = { at: number; cam: Cam; dur: number; ease?: (t: number) => number; cut?: boolean };

/** centro de ENCUADRE de la cámara (aprobado): no es el centro de los textos, que es CENTRO_X = 540 (src/canal/zonaSegura.ts) */
const CAMARA_CX = 480;
const frame = (cx: number, cy: number, zoom: number): Cam => ({ x: cx + (540 - CAMARA_CX) / zoom, y: cy, zoom });
/** chico + grande con sus precios, grandes y centrados (gancho y loop) */
export const PAIR = frame(1292 + CUPS_DX, 1255, 1.65);
/** los tres vasos con sus precios, grandes y centrados */
export const TRIO = frame(M_X, 1262, 1.48);
const TWO_SHOT: Cam = { x: 1195, y: 1160, zoom: 1.15 };
/** planos de actuación: Tomi al centro, el vaso grande a la derecha del carril de subtítulos */
const THINK: Cam = { x: 845, y: 1000, zoom: 1.66 };
const DECIDE: Cam = { x: 845, y: 995, zoom: 1.64 };
/** igual que DECIDE, después de que el grande se corre: sigue fuera del carril */
const DECIDE2: Cam = { x: 804, y: 995, zoom: 1.64 };
const REACT: Cam = { x: 890, y: 960, zoom: 1.92 };
/** Tomi + el grande, con el precio por encima del carril de subtítulos */
const REACH: Cam = { x: 1000, y: 1208, zoom: 1.45 };
/** el US$7 en primer plano, centrado */
const REVEAL = frame(LX0 - 40, 1392, 3.0);
const EXPLAIN: Cam = { x: 1000, y: 1208, zoom: 1.45 };
/** Tomi camina hasta el mediano: él y los tres vasos completos */
const WALK = frame(1150, 1190, 1.32);

const CAM_KEYS: CamKey[] = [
  { at: 0, cam: { ...PAIR, zoom: 1.56 }, dur: 1 },
  { at: 10, cam: PAIR, dur: 10, ease: snap(0, 0.01, 4.5, 1.6 * Math.PI) }, // gancho: «¿Cuál comprarías?»
  { at: 34, cam: TWO_SHOT, dur: 9, ease: snap(0.08, 0.2) }, // aparece Tomi antes de «¡Rápido!»
  { at: 75, cam: THINK, dur: 6, cut: true },
  { at: CUE.tres, cam: PAIR, dur: 8, cut: true },
  { at: 158, cam: DECIDE, dur: 8, cut: true },
  { at: 230, cam: TRIO, dur: 6, cut: true }, // cae el mediano
  { at: 252, cam: REACT, dur: 6, cut: true },
  { at: CUE.seis, cam: TRIO, dur: 7, cut: true },
  { at: 300, cam: DECIDE2, dur: 6, cut: true }, // «De repente…»
  { at: 398, cam: TRIO, dur: 6, cut: true }, // «…cincuenta centavos»: +US$0,50
  { at: 454, cam: REACH, dur: 6, cut: true }, // «Pero el precio del grande…»
  { at: 504, cam: REVEAL, dur: 6, cut: true }, // «…nunca cambió»
  { at: 558, cam: { ...REVEAL, zoom: 3.12, x: REVEAL.x - 1 }, dur: 50, ease: ease.inOut },
  { at: 566, cam: TRIO, dur: 6, cut: true }, // «Cambió contra qué lo comparás»
  // (pizarrón 632–1112: la cámara del café no se usa)
  { at: 1100, cam: EXPLAIN, dur: 1 },
  { at: 1174, cam: TRIO, dur: 6, cut: true }, // «la opción del medio…»
  { at: 1234, cam: WALK, dur: 8 }, // va a tapar el mediano
  { at: 1322, cam: PAIR, dur: 9, ease: snap(0.05, 0.2) }, // loop: mismo encuadre que el gancho
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
      ? 0.05 * ease.in(u / 0.5)
      : 0.95 + 0.05 * snap(0, 0.01, 4.5, 1.6 * Math.PI)((u - 0.5) / 0.5)
    : (next.ease ?? ease.inOut)(u);
  return { x: lerp(cur.x, next.cam.x, t), y: lerp(cur.y, next.cam.y, t), zoom: lerp(cur.zoom, next.cam.zoom, t) };
};
export const camAt = (f: number): CamF => {
  const c = camBase(f);
  const pz = (at: number, a: number) => pulse(f, at, a, 10) - 1;
  const z = c.zoom * (1 + pz(CUE.rapido, 0.035) + pz(CUE.mediano + 2, 0.07) + pz(CUE.son, 0.04) + pz(CUE.nunca, 0.025));
  const sh = [shake(f, CUE.rapido, 7, 4), shake(f, CUE.mediano + 2, 16, 5), shake(f, CUE.son, 6, 4), shake(f, CUE.nunca - 2, 5, 6)];
  const drift = { x: 2.2 * Math.sin(f * 0.031), y: 1.6 * Math.sin(f * 0.023 + 1) };
  return { ...c, zoom: z, sx: sh.reduce((a, s) => a + s.x, 0) + drift.x, sy: sh.reduce((a, s) => a + s.y, 0) + drift.y };
};
/** movimiento de cámara (0..14): solo se usa como desenfoque leve del fondo */
export const camMotion = (f: number) => {
  for (const k of CAM_KEYS) if (k.cut && f >= k.at - k.dur && f <= k.at) return 14 * Math.sin(Math.PI * ((f - (k.at - k.dur)) / k.dur));
  if (f <= 0) return 0;
  const a = camBase(f - 1);
  const b = camBase(f);
  return clamp((Math.hypot((b.x - a.x) * b.zoom, (b.y - a.y) * b.zoom) + Math.abs(b.zoom - a.zoom) * 700 - 6) * 0.1, 0, 12);
};
export const toScreen = (c: CamF, v: Vec): Vec => ({ x: (v.x - c.x) * c.zoom + 540 + c.sx, y: (v.y - c.y) * c.zoom + 960 + c.sy });

/* ------------------------------ actuación ------------------------------ */

const P = (s: ActState, extra: Partial<Pose> = {}) => statePose(s, ROOT, FLOOR, S, extra);
const startle = mixPose(P("neutral"), P("sorpresa"), 0.5);
/** «¡ganga!»: señala el precio del grande con una sonrisa */
const POINT_L: Pose = {
  ...P("firme", { face: { ...FACE.eureka, smile: 0.85, mouthOpen: 0.35 } }),
  lean: 4,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "point", ik: { x: ROOT + 180, y: 1150, space: "scene", weight: 1, bend: 1 }, aim: { x: LX0 - 40, y: COUNTER_TOP + 80, weight: 1 } },
};
/** «Pero el precio del grande…»: va a agarrarlo y se congela */
const REACH_L: Pose = {
  ...P("firme", { face: { ...FACE.firme, smile: 0.35 } }),
  lean: 9,
  headTilt: 8,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "reach", ik: { x: 1050, y: 1168, space: "scene", weight: 1, bend: 1 } },
};
const PUZZLED: Pose = P("pensando", { face: { ...FACE.duda, browLiftL: 0.7, browLiftR: 0.5 } });
/** «El truco es simple:» — explica con las palmas abiertas y sonrisa irónica */
const EXPLAIN_P: Pose = P("duda", { face: { ...FACE.ironico, smile: 0.5 }, headTilt: -4, shrug: 0.35 });

const BEATS: Beat[] = [
  { at: 0, pose: P("neutral") },
  { at: CUE.rapido + 4, pose: startle, dur: 5 },
  { at: 70, pose: P("pensando"), dur: 10 },
  { at: 156, pose: P("duda"), dur: 8 },
  { at: 182, pose: P("firme"), dur: 6 },
  { at: 210, pose: P("sospecha"), dur: 8 },
  { at: CUE.mediano + 5, pose: P("sorpresa"), dur: 6, ease: snap(0.3, 0.35) },
  { at: 272, pose: P("incredulidad"), dur: 10 },
  { at: CUE.deRepente + 4, pose: P("eureka"), dur: 8 }, // «De repente…»
  { at: CUE.ganga, pose: POINT_L, dur: 8 }, // «…una ganga»
  { at: CUE.son + 3, pose: P("celebracion"), dur: 5 }, // «¡Son solo cincuenta centavos más!»
  { at: 446, pose: P("firme"), dur: 6 },
  { at: CUE.pero - 2, pose: REACH_L, dur: 8, ease: ease.out },
  { at: 574, pose: PUZZLED, dur: 10 },
  { at: 590, pose: P("sospecha"), dur: 8 },
  { at: 1100, pose: EXPLAIN_P, dur: 1 },
  { at: 1160, pose: P("ironico"), dur: 8 },
  { at: 1226, pose: P("neutral"), dur: 8 },
  { at: CUE.seguis, pose: P("duda"), dur: 8 },
];
/** se congela con la mano junto al grande durante «…nunca cambió» */
const FREEZE = { from: CUE.pero - 2, to: 562 };
const frozen = (f: number) => f >= FREEZE.from && f < FREEZE.to;

/** saltos / aterrizajes sobre la pose de estado (escena A) */
const hop = (f: number) =>
  track(f, [
    [0, 0], [CUE.rapido, 0], [CUE.rapido + 4, 11, ease.out], [CUE.rapido + 9, 0, ease.in],
    [CUE.mediano + 2, 0], [CUE.mediano + 6, 30, ease.out], [CUE.mediano + 12, 0, ease.in],
    [CUE.son, 0], [CUE.son + 5, 20, ease.out], [CUE.son + 11, 0, ease.in],
  ]);
const squashMul = (f: number) =>
  track(f, [
    [0, 0.92], [4, 1.06, ease.out], [9, 0.98], [13, 1],
    [CUE.rapido + 8, 1], [CUE.rapido + 10, 0.95], [CUE.rapido + 15, 1],
    [CUE.mediano + 11, 1], [CUE.mediano + 13, 0.92], [CUE.mediano + 18, 1.03], [CUE.mediano + 22, 1],
    [CUE.son + 10, 1], [CUE.son + 12, 0.94], [CUE.son + 17, 1],
  ]);
/** escena A: salto atrás y, durante los cortes al trío, fuera de cuadro (la comparación va limpia) */
const xOffA = (f: number) =>
  track(f, [[CUE.mediano + 2, 0], [CUE.mediano + 12, -38, ease.out], [262, -38], [263, -120], [297, -120], [298, 0], [562, 0], [563, -120]]);

/* --- escena B: caminata hasta el mediano con pies plantados --- */
/** se queda a un costado del grande (no lo tapa) y se inclina para alcanzar el mediano */
const NEAR_M = 950;
export const rootX = (f: number) =>
  f < SCENE.boardOut
    ? ROOT + xOffA(f)
    : track(f, [[0, ROOT], [1236, ROOT], [1254, NEAR_M, ease.inOut], [1300, NEAR_M], [1318, ROOT, ease.inOut]]);
const STANCE = { F: ROOT - 24, B: ROOT + 34 };
const PLAN: FootPlan = {
  start: { ...STANCE },
  steps: [
    { foot: "F", lift: 1236, land: 1245, from: STANCE.F, to: NEAR_M - 24, height: 14 },
    { foot: "B", lift: 1245, land: 1254, from: STANCE.B, to: NEAR_M + 34, height: 12 },
    { foot: "F", lift: 1300, land: 1309, from: NEAR_M - 24, to: STANCE.F, height: 12 },
    { foot: "B", lift: 1309, land: 1318, from: NEAR_M + 34, to: STANCE.B, height: 12 },
  ],
};
const BACK_HAND_B: [number, HandShape][] = [[1200, "relaxed"], [1250, "hold"], [CUE.mediano2 + 1, "open"], [1300, "relaxed"]];
const napkinArm = (f: number) => {
  const keys: PathKey[] = [
    [1244, (fr) => ({ x: rootX(fr) + 55, y: 1175 })],
    [1264, { x: M_X - 40, y: 1100 }, ease.inOut, -14],
    [1276, { x: M_X - 30, y: 1096 }],
    [CUE.mediano2 + 1, { x: M_X - 10, y: 1112 }, ease.inOut],
    [1296, (fr) => ({ x: rootX(fr) + 60, y: 1150 }), ease.inOut],
  ];
  return pathTrack(f, keys);
};
const napkinW = (f: number) => track(f, [[1236, 0], [1250, 1, ease.out], [1294, 1], [1308, 0]]);

/* ------------------------------ mirada ------------------------------ */

type Target = "L" | "S" | "M" | "Ltag" | "Stag" | "Mtag" | "think" | "up" | "cam";
const GAZE: [number, Target][] = [
  [0, "L"], [10, "S"], [22, "L"], [CUE.rapido - 2, "cam"], [64, "think"], [CUE.tres - 3, "Stag"], [CUE.siete - 4, "Ltag"],
  [166, "S"], [178, "L"], [204, "cam"], [226, "M"], [CUE.seis - 2, "Mtag"], [284, "Ltag"], [294, "Mtag"],
  [306, "up"], [340, "Ltag"], [CUE.son - 4, "cam"], [398, "M"], [420, "Ltag"], [440, "L"], [530, "think"], [560, "Stag"],
  [586, "Mtag"], [610, "cam"],
  [1100, "cam"], [1158, "M"], [1208, "L"], [1236, "M"], [1302, "M"], [1320, "L"], [1336, "S"], [1352, "L"], [1366, "S"], [1380, "L"],
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
  if (t === "up") return [0.35, -0.9];
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
const BLINKS = [30, 98, 142, 197, 233, 288, 330, 372, 430, 536, 600, 1120, 1180, 1222, 1262, 1305, 1340, 1384];

/* ------------------------------ construcción ------------------------------ */

const inB = (f: number) => f >= SCENE.boardOut - 20;

const build = (f: number, hair: number, look: [number, number], lag: [number, number], hip?: number): Pose => {
  const b = beatPose(f, BEATS);
  const still = frozen(f) ? 0 : 1;
  const breath = Math.sin((f / 46) * Math.PI * 2);
  let p: Pose = {
    ...b,
    x: rootX(f),
    hop: b.hop + (inB(f) ? 0 : hop(f)),
    squash: b.squash * squashMul(f) * (1 + 0.007 * breath * still),
    lean: b.lean + 0.6 * Math.sin(f * 0.05) * still,
    shrug: b.shrug + 0.04 * (breath + 1) * still,
    headTurn: b.headTurn + 0.12 * lag[0],
    headTilt: b.headTilt + 6 * lag[1] + 0.8 * Math.sin(f * 0.07 + 1) * still,
    face: { ...b.face, lookX: look[0], lookY: look[1] },
    blink: frozen(f) ? 1 : blink(f, [...BLINKS, CUE.mediano + 1]),
    hairLag: hair,
  };
  if (inB(f)) {
    // escena B: pies plantados (caminata sin patinar) + brazo de la servilleta
    const fs = footState(PLAN, "F", f, FLOOR, S, DIM_V2);
    const bs = footState(PLAN, "B", f, FLOOR, S, DIM_V2);
    p = { ...p, hipHeight: hip, legFront: { hip: 0, knee: 4, foot: fs.angle, ik: fs.pos }, legBack: { hip: 0, knee: 4, foot: bs.angle, ik: bs.pos } };
    const w = napkinW(f);
    if (w > 0.001) {
      const t = napkinArm(f);
      // la servilleta va con el brazo de atrás: en tres cuartos alcanza el mediano sin tapar el grande
      p.armBack = { shoulder: -4, elbow: 14, wrist: 0, ...handAt(f, BACK_HAND_B), ik: { x: t.x, y: t.y, space: "scene", weight: w, bend: -1 } };
      p.lean += 12 * w;
      p.headTilt += 5 * w;
    }
  }
  return p;
};

export type CafeFrame = { pose: Pose; rig: Rig; head: Vec };
let cache: CafeFrame[] | null = null;

export const getCafeV2 = (): CafeFrame[] => {
  if (cache) return cache;
  const hips = smoothUnder(
    Array.from({ length: N }, (_, f) => {
      const r = rootX(f);
      const ankles = { F: footState(PLAN, "F", f, FLOOR, S, DIM_V2).pos, B: footState(PLAN, "B", f, FLOOR, S, DIM_V2).pos };
      const hx = { F: r - DIM_V2.hipX * (10 / 24) * S, B: r + DIM_V2.hipX * (14 / 24) * S };
      return hipHeightFor(ankles, hx, FLOOR, S, 0.992, DIM_V2);
    }),
  );
  const src = (f: number) => (frozen(f) ? FREEZE.from : f);
  const raw = Array.from({ length: N }, (_, f) => {
    const p = build(src(f), 0, [0, 0], [0, 0], hips[src(f)]);
    const r = rigV2(p);
    return { x: p.x + r.headCenter.x * S, y: p.y + r.headCenter.y * S };
  });
  const gaze = raw.map((h, f) => gazeAt(src(f), h));
  const lagX = springSeries(gaze.map((g) => g[0]), 0.16, 0.7);
  const lagY = springSeries(gaze.map((g) => g[1]), 0.16, 0.7);
  const p2 = Array.from({ length: N }, (_, f) => build(src(f), 0, gaze[f], [lagX[f], lagY[f]], hips[src(f)]));
  const ang = p2.map((p) => rigV2(p).headAngle + p.hop * 0.25);
  const sp = springSeries(ang, 0.14, 0.72);
  cache = p2.map((_, f) => {
    const g = src(f);
    const pose = build(g, clamp(2.4 * (sp[g] - ang[g]), -28, 28), gaze[g], [lagX[g], lagY[g]], hips[g]);
    const rig = rigV2(pose);
    return { pose, rig, head: { x: pose.x + rig.headCenter.x * S, y: pose.y + rig.headCenter.y * S } };
  });
  return cache;
};

/* ------------------------------ zonas protegidas ------------------------------ */

export type Box = { x0: number; y0: number; x1: number; y1: number; kind: "hard" | "soft"; name: string };
const box = (c: CamF, a: Vec, b: Vec, kind: Box["kind"], name: string, dy = 0): Box => {
  const p = toScreen(c, a);
  const q = toScreen(c, b);
  return { x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y) + dy, x1: Math.max(p.x, q.x), y1: Math.max(p.y, q.y) + dy, kind, name };
};

/** cajas de la cafetería en pantalla; `dy` = desplazamiento vertical de la escena (transiciones) */
export const cafeBoxes = (f: number, dy = 0): Box[] => {
  const fr = clamp(f, 0, N - 1);
  const c = camAt(fr);
  const { pose, rig, head } = getCafeV2()[fr];
  const out: Box[] = [];
  const r = 92 * HEAD_SCALE * S;
  out.push(box(c, { x: head.x - r * 1.05, y: head.y - r * 1.12 }, { x: head.x + r * 1.05, y: head.y + r * 1.15 }, "hard", "cara", dy));
  out.push(box(c, { x: head.x - r * 0.6, y: head.y - r * 1.6 }, { x: head.x + r * 0.6, y: head.y - r * 1.12 }, "hard", "mechón", dy));
  const Lc = (v: Vec): Vec => ({ x: pose.x + v.x * S, y: pose.y + v.y * S });
  // todo Tomi (cara, mechón, manos y cuerpo) es duro para el subtítulo: el carril se deja libre desde el encuadre
  for (const [name, a] of [["mano", rig.front], ["mano2", rig.back]] as const) {
    const w = Lc(a.wr);
    const p = Lc(a.palm);
    const x0 = Math.min(w.x, p.x) - 24 * S;
    const x1 = Math.max(w.x, p.x) + 24 * S;
    const y0 = Math.min(w.y, p.y) - 24 * S;
    const y1 = Math.max(w.y, p.y) + 30 * S;
    out.push(box(c, { x: x0, y: y0 }, { x: x1, y: y1 }, "hard", name, dy));
  }
  const neck = Lc(rig.neck);
  out.push(box(c, { x: neck.x - 64 * S, y: neck.y }, { x: neck.x + 64 * S, y: FLOOR }, "hard", "cuerpo", dy));
  const cup = (x: number, h: number, name: string, ddy = 0) =>
    out.push(box(c, { x: x - h * 0.4 - 8, y: COUNTER_TOP - h - 40 + ddy }, { x: x + h * 0.4 + 8, y: Math.min(COUNTER_TOP, COUNTER_TOP + ddy) }, "hard", name, dy));
  const tag = (x: number, name: string) => out.push(box(c, { x: x - 92, y: COUNTER_TOP + 14 }, { x: x + 92, y: COUNTER_TOP + 150 }, "hard", name, dy));
  const lx = cupLx(fr);
  const sx = cupSx(fr);
  cup(lx, CUP_H.L, "vaso L");
  cup(sx, CUP_H.S, "vaso S");
  tag(lx, "precio L");
  tag(sx, "precio S");
  if (mVisible(fr)) {
    if (mDropY(fr) < 200) cup(M_X, CUP_H.M, "vaso M", mDropY(fr));
    if (mTagScale(fr) > 0.01) tag(M_X, "precio M");
  }
  if (FX.half(fr) > 0.15) out.push(box(c, { x: (lx + M_X) / 2 - 135, y: 955 }, { x: (lx + M_X) / 2 + 135, y: 1022 }, "hard", "+US$0,50", dy));
  if (FX.arcCaro(fr) > 0.15) out.push(box(c, { x: (lx + sx) / 2 - 75, y: 880 }, { x: (lx + sx) / 2 + 75, y: 938 }, "hard", "caro", dy));
  if (FX.arcGanga(fr) > 0.15) out.push(box(c, { x: (lx + M_X) / 2 - 100, y: 1012 }, { x: (lx + M_X) / 2 + 90, y: 1064 }, "hard", "¡ganga!", dy));
  return out;
};

