import { clamp, lerp, smooth, type EaseFn } from "../anim";
import { computeRig, type ArmPose, type FacePose, type HandShape, type Pose, type Vec } from "../rig";
import { DIM_V2 } from "./style";

/**
 * Timing V2: anticipación + overshoot + asentamiento, y mezcla de poses completas
 * (incluidos brazos con IK en espacios distintos) para pasar de un estado de actuación a otro.
 */

/**
 * Curva "snap": retrocede `antic` (fracción del recorrido) durante el primer `ta` del tramo,
 * sale disparada, pasa de largo y se asienta con un pequeño rebote amortiguado.
 */
export const snap =
  (antic = 0.12, ta = 0.22, k = 5, w = 1.7 * Math.PI): EaseFn =>
  (t) => {
    const x = clamp(t, 0, 1);
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (x < ta) return -antic * Math.sin((Math.PI / 2) * (x / ta)) ** 2;
    const u = (x - ta) / (1 - ta);
    const r = (1 + antic) * Math.exp(-k) * Math.cos(w);
    return 1 - (1 + antic) * Math.exp(-k * u) * Math.cos(w * u) + r * u;
  };

/** pop de aparición: 0 → 1 con overshoot elástico corto (escalas, carteles) */
export const pop = (t: number) => {
  const x = clamp(t, 0, 1);
  if (x >= 1) return 1;
  return 1 - Math.exp(-6 * x) * Math.cos(2.2 * Math.PI * x) * (1 - x * 0.2);
};

/** temblor de cámara determinista que decae */
export const shake = (f: number, at: number, amp: number, decay = 5): Vec => {
  const d = f - at;
  if (d < 0 || d > decay * 6) return { x: 0, y: 0 };
  const e = amp * Math.exp(-d / decay);
  return { x: e * Math.sin(d * 2.9 + 1.3), y: e * Math.cos(d * 3.7) };
};

/** pulso de escala breve (énfasis en objetos) */
export const pulse = (f: number, at: number, amp = 0.12, dur = 12) => {
  const d = f - at;
  if (d < 0 || d > dur) return 1;
  const t = d / dur;
  return 1 + amp * Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t) * 1.4;
};

/* ------------------------------ mezcla de poses ------------------------------ */

const R2D = 180 / Math.PI;
const angDiff = (a: number, b: number) => {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};
/** ángulos absolutos (convención del rig) de brazo, antebrazo y mano tal como quedaron resueltos */
const armAngles = (r: ReturnType<typeof computeRig>, which: "front" | "back") => {
  const a = which === "front" ? r.front : r.back;
  return {
    tu: Math.atan2(a.el.x - a.sh.x, a.el.y - a.sh.y) * R2D,
    te: Math.atan2(a.wr.x - a.el.x, a.wr.y - a.el.y) * R2D,
    hand: a.handAng,
  };
};

const FACE_KEYS: (keyof FacePose)[] = [
  "lookX", "lookY", "eyeScale", "pupil", "lidL", "lidR", "lidAngle", "lowerLid", "browLiftL", "browLiftR",
  "browAngleL", "browAngleR", "smile", "mouthOpen", "mouthWidth", "mouthSkew", "blush",
];
export const mixFace = (a: FacePose, b: FacePose, t: number): FacePose => {
  const o = { ...a };
  for (const k of FACE_KEYS) o[k] = lerp(a[k], b[k], t);
  o.lidL = clamp(o.lidL, 0, 1);
  o.lidR = clamp(o.lidR, 0, 1);
  o.lowerLid = clamp(o.lowerLid, 0, 1);
  o.mouthOpen = clamp(o.mouthOpen, 0, 1.2);
  return o;
};

const handBlend = (a: HandShape, b: HandShape, t: number) => {
  if (a === b) return { hand: a };
  const m = smooth((t - 0.25) / 0.5);
  return m <= 0 ? { hand: a } : m >= 1 ? { hand: b } : { hand: a, handNext: b, handMix: m };
};

/**
 * Transición de brazo en espacio de ángulos (FK): interpola hombro, codo y mano por el camino
 * más corto. Evita que el codo "salte" cuando los dos estados usan IK con flexión distinta.
 * En los extremos (t ≤ 0 o t = 1) se devuelve el brazo original con su IK (contacto exacto).
 */
const mixArm = (pa: Pose, pb: Pose, which: "front" | "back", t: number, lean: number): ArmPose => {
  const a = which === "front" ? pa.armFront : pa.armBack;
  const b = which === "front" ? pb.armFront : pb.armBack;
  if (t <= 0) return a;
  if (t === 1) return b;
  const A = armAngles(computeRig(pa, DIM_V2), which);
  const B = armAngles(computeRig(pb, DIM_V2), which);
  const tu = A.tu + angDiff(A.tu, B.tu) * t;
  const te = A.te + angDiff(A.te, B.te) * t;
  const hand = A.hand + angDiff(A.hand, B.hand) * t;
  return {
    shoulder: tu + lean,
    elbow: te - tu,
    wrist: hand - te,
    ...handBlend(a.hand, b.hand, clamp(t, 0, 1)),
  };
};

/** mezcla completa de dos poses; `t` puede salir de 0..1 (anticipación / overshoot) */
export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const L = (k: "lean" | "headTilt" | "headTurn" | "bodyTurn" | "shrug" | "squash" | "hop") => lerp(a[k], b[k], t);
  const leg = (x: Pose["legFront"], y: Pose["legFront"]) => ({ hip: lerp(x.hip, y.hip, t), knee: lerp(x.knee, y.knee, t), foot: lerp(x.foot, y.foot, t) });
  return {
    ...b,
    lean: L("lean"),
    headTilt: L("headTilt"),
    headTurn: L("headTurn"),
    bodyTurn: clamp(L("bodyTurn"), 0, 1),
    shrug: L("shrug"),
    squash: L("squash"),
    hop: Math.max(0, L("hop")),
    armFront: mixArm(a, b, "front", t, L("lean")),
    armBack: mixArm(a, b, "back", t, L("lean")),
    legFront: leg(a.legFront, b.legFront),
    legBack: leg(a.legBack, b.legBack),
    face: mixFace(a.face, b.face, t),
  };
};

/** Línea de tiempo de estados: cada beat llega a su pose en `at`, empezando `dur` fotogramas antes. */
export type Beat = { at: number; pose: Pose; dur?: number; ease?: EaseFn };
export const beatPose = (f: number, beats: Beat[]): Pose => {
  let i = 0;
  while (i + 1 < beats.length && f >= beats[i + 1].at) i++;
  const cur = beats[i];
  const next = beats[i + 1];
  if (!next) return cur.pose;
  const dur = next.dur ?? 8;
  const start = next.at - dur;
  if (f < start) return cur.pose;
  const t = (next.ease ?? snap())((f - start) / dur);
  return mixPose(cur.pose, next.pose, t);
};
