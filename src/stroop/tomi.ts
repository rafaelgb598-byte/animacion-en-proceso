import { blink, clamp, ease, lerp, springSeries } from "../character/anim";
import type { FacePose, Pose, Rig, Vec } from "../character/rig";
import { rigV2 } from "../character/v2/CharacterV2";
import { FACE, statePose, type ActState } from "../character/v2/acting";
import { beatPose, mixPose, snap, type Beat } from "../character/v2/motion2";
import { HEAD_SCALE } from "../character/v2/style";
import type { Box } from "../final-v2/cafe";
import { CARD } from "../components/stroop/WordCard";
import * as T from "./timeline";

/**
 * Tomi V2 en el Short Stroop: lo vive con el espectador. Mismo personaje, mismos estados de
 * actuación y misma forma de animarse (beats con anticipación + overshoot) que el episodio 1.
 */

export const TOMI = { x: 232, floor: 1580, scale: 1.15 };

const P = (s: ActState, extra: Partial<Pose> = {}) => statePose(s, TOMI.x, TOMI.floor, TOMI.scale, extra);

/** pose del fotograma 0 (y del último: loop sin costura) */
const P0: Pose = P("neutral", { headTurn: 0.55, bodyTurn: 0.85, lean: -2, shrug: 0.2 });
const READY: Pose = P("neutral", { lean: 4, headTilt: -4, face: { ...FACE.neutral, smile: 0.3 } });
const FOCUS: Pose = P("firme", { face: { ...FACE.firme, smile: 0.15 } });
const DOUBT: Pose = P("duda", { face: { ...FACE.duda } });
const OOPS: Pose = P("incredulidad", { face: { ...FACE.sorpresa, eyeScale: 1.12, mouthOpen: 0.5 } });
const STRESS: Pose = mixPose(P("duda"), P("sorpresa"), 0.4);
/** se tapa la cara con las dos manos */
const FACEPALM: Pose = {
  ...P("neutral", { face: { ...FACE.duda, lidL: 0.9, lidR: 0.9, smile: -0.4, mouthOpen: 0.15 } }),
  lean: 6,
  headTilt: 12,
  shrug: 0.5,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "open", ik: { x: -6, y: -58, space: "chin", weight: 1, bend: 1 } },
  armBack: { shoulder: 0, elbow: 10, wrist: 0, hand: "open", ik: { x: 22, y: -62, space: "chin", weight: 1, bend: -1 } },
};

const BEATS: Beat[] = [
  { at: 0, pose: P0 },
  { at: T.SETTLE_END, pose: READY, dur: 14 }, // se acomoda frente a la mesa
  { at: T.HEAD2_IN + 14, pose: FOCUS, dur: 8 }, // «ahora en serio»
  { at: T.R2_STARTS[1] + 6, pose: DOUBT, dur: 8 }, // duda
  { at: T.R2_MISTAKE + 12, pose: OOPS, dur: 6, ease: snap(0.25, 0.3) }, // se equivoca
  { at: T.R2_STARTS[5] + 4, pose: STRESS, dur: 8 },
  { at: T.R2_FACEPALM + 8, pose: FACEPALM, dur: 7, ease: snap(0.2, 0.3) }, // se tapa la cara
  { at: T.SPLIT + 16, pose: P("pensando"), dur: 12 }, // escucha la explicación
  { at: T.CLASH, pose: P("sospecha"), dur: 8 },
  { at: T.WINNER + 4, pose: P("ironico"), dur: 8 },
  { at: T.STAMP_HIT - 2, pose: P("eureka"), dur: 7, ease: snap(0.2, 0.3) },
  { at: T.END_IN + 10, pose: P("firme", { face: { ...FACE.ironico, smile: 0.6 } }), dur: 8 }, // «¿te animás otra vez?»
  { at: T.RETURN[1], pose: P0, dur: T.RETURN[1] - T.RETURN[0] },
];

/** congelado: ni respiración ni parpadeo */
const frozen = (f: number) => f >= T.FREEZE && f < T.FREEZE_END;

/** "dice el color": la boca se abre al nombrar cada tarjeta (en la ronda 2, cada vez más tarde) */
const speak = (f: number) => {
  let m = 0;
  T.R1_STARTS.forEach((s) => (m = Math.max(m, pulse01(f, s + 5, 9))));
  T.R2_STARTS.forEach((s, i) => {
    if (i === 7) return; // en la última se tapa la cara
    m = Math.max(m, pulse01(f, s + 9 + i * 2, 8) * (i === 3 ? 1.3 : 0.9));
  });
  return m;
};
const pulse01 = (f: number, at: number, dur: number) => {
  const d = f - at;
  return d < 0 || d > dur ? 0 : Math.sin(Math.PI * (d / dur));
};

/* ── mirada ── */
type Target = "cam" | "card" | "layerA" | "layerB" | "clash" | "stamp";
const GAZE: [number, Target][] = [
  [0, "cam"], [T.SETTLE_END - 10, "card"], [T.HEAD2_IN + 4, "cam"], [T.R2_START - 6, "card"], [T.LABEL_READ - 4, "layerA"],
  [T.LABEL_NAME - 4, "layerB"], [T.CLASH - 6, "clash"], [T.WINNER, "cam"], [T.STAMP_IN + 6, "stamp"], [T.END_IN, "cam"],
];
const targetPoint = (t: Target): Vec | null =>
  t === "card" || t === "clash" || t === "stamp" ? { x: CARD.cx, y: CARD.cy } : t === "layerA" ? { x: 300, y: 580 } : t === "layerB" ? { x: 690, y: 940 } : null;
const lookFor = (t: Target, head: Vec): [number, number] => {
  const p = targetPoint(t);
  if (!p) return [-0.38, 0.04];
  return [clamp((p.x - head.x) / 230, -1, 1), clamp((p.y - head.y) / 300, -1, 1)];
};
const gazeAt = (f: number, head: Vec): [number, number] => {
  let i = 0;
  while (i + 1 < GAZE.length && f >= GAZE[i + 1][0]) i++;
  const cur = lookFor(GAZE[i][1], head);
  if (i === 0) return cur;
  const prev = lookFor(GAZE[i - 1][1], head);
  const t = ease.saccade(clamp((f - GAZE[i][0]) / 3, 0, 1));
  return [lerp(prev[0], cur[0], t), lerp(prev[1], cur[1], t)];
};
const BLINKS = [40, 130, 236, 300, 400, 470, 600, 690, 780, 860, 950, 1004];

/* ── construcción ── */
const build = (f: number, hair: number, look: [number, number], lag: [number, number]): Pose => {
  const b = beatPose(f, BEATS);
  const still = frozen(f) ? 0 : 1;
  const breath = Math.sin((f / 46) * Math.PI * 2);
  const talk = speak(f);
  const face: FacePose = { ...b.face, lookX: look[0], lookY: look[1], mouthOpen: Math.max(b.face.mouthOpen, 0.42 * talk) };
  // asentimiento al nombrar cada tarjeta de la ronda 1
  const nod = T.R1_STARTS.reduce((a, s) => a + 4 * pulse01(f, s + 5, 10), 0);
  // en el loop, la respiración y el balanceo valen 0 en el primer y el último fotograma
  const loopW = clamp(Math.min(f, T.LAST - f) / 12, 0, 1);
  return {
    ...b,
    lean: b.lean + 0.6 * Math.sin(f * 0.05) * still * loopW,
    squash: b.squash * (1 + 0.007 * breath * still * loopW),
    shrug: b.shrug + 0.04 * (breath + 1) * still * loopW,
    headTurn: b.headTurn + 0.12 * lag[0],
    headTilt: b.headTilt + 6 * lag[1] + nod + 0.8 * Math.sin(f * 0.07 + 1) * still * loopW,
    face,
    blink: frozen(f) ? 1 : blink(f, BLINKS),
    hairLag: hair,
  };
};

export type TomiFrame = { pose: Pose; rig: Rig; head: Vec };
let cache: TomiFrame[] | null = null;
export const getTomi = (): TomiFrame[] => {
  if (cache) return cache;
  const N = T.DURATION;
  const src = (f: number) => (frozen(f) ? T.FREEZE : f);
  const S = TOMI.scale;
  const head0 = Array.from({ length: N }, (_, f) => {
    const p = build(src(f), 0, [0, 0], [0, 0]);
    const r = rigV2(p);
    return { x: p.x + r.headCenter.x * S, y: p.y + r.headCenter.y * S };
  });
  const gaze = head0.map((h, f) => gazeAt(src(f), h));
  // la mirada del último fotograma es la del primero (loop)
  gaze[N - 1] = gaze[0];
  const lagX = springSeries(gaze.map((g) => g[0]), 0.16, 0.7);
  const lagY = springSeries(gaze.map((g) => g[1]), 0.16, 0.7);
  lagX[N - 1] = lagX[0];
  lagY[N - 1] = lagY[0];
  const p2 = Array.from({ length: N }, (_, f) => build(src(f), 0, gaze[f], [lagX[f], lagY[f]]));
  const ang = p2.map((p) => rigV2(p).headAngle);
  const sp = springSeries(ang, 0.14, 0.72);
  cache = p2.map((_, f) => {
    const g = src(f);
    const hair = f === N - 1 || f === 0 ? 0 : clamp(2.4 * (sp[g] - ang[g]), -28, 28);
    const pose = build(g, hair, gaze[f], [lagX[f], lagY[f]]);
    const rig = rigV2(pose);
    return { pose, rig, head: { x: pose.x + rig.headCenter.x * S, y: pose.y + rig.headCenter.y * S } };
  });
  return cache;
};

/** zonas protegidas de Tomi (cara siempre; manos si gesticulan a la altura del pecho o más arriba) */
export const tomiBoxes = (f: number, cam: (v: Vec) => Vec): Box[] => {
  const { pose, rig, head } = getTomi()[Math.min(T.LAST, Math.max(0, f))];
  const S = TOMI.scale;
  const L = (v: Vec): Vec => ({ x: pose.x + v.x * S, y: pose.y + v.y * S });
  const r = 92 * HEAD_SCALE * S;
  const bx = (a: Vec, b: Vec, kind: Box["kind"], name: string): Box => {
    const p = cam(a);
    const q = cam(b);
    return { x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y), x1: Math.max(p.x, q.x), y1: Math.max(p.y, q.y), kind, name };
  };
  const out: Box[] = [bx({ x: head.x - r * 1.05, y: head.y - r * 1.12 }, { x: head.x + r * 1.05, y: head.y + r * 1.15 }, "hard", "cara")];
  const chestY = (L(rig.neck).y + L(rig.legF.hip).y) / 2;
  for (const [name, a] of [["mano", rig.front], ["mano2", rig.back]] as const) {
    const w = L(a.wr);
    const p = L(a.palm);
    out.push(bx({ x: Math.min(w.x, p.x) - 24 * S, y: Math.min(w.y, p.y) - 24 * S }, { x: Math.max(w.x, p.x) + 24 * S, y: Math.max(w.y, p.y) + 30 * S }, w.y < chestY ? "hard" : "soft", name));
  }
  const neck = L(rig.neck);
  out.push(bx({ x: neck.x - 64 * S, y: neck.y }, { x: neck.x + 64 * S, y: 1450 }, "soft", "cuerpo"));
  return out;
};

