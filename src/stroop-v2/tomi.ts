import { blink, clamp, ease, lerp, springSeries } from "../character/anim";
import type { FacePose, Pose, Rig, Vec } from "../character/rig";
import { rigV2 } from "../character/v2/CharacterV2";
import { FACE, statePose, type ActState } from "../character/v2/acting";
import { beatPose, mixPose, snap, type Beat } from "../character/v2/motion2";
import { HEAD_SCALE } from "../character/v2/style";
import type { Box } from "../final-v2/cafe";
import * as T from "./timeline";

/**
 * Tomi V2 en GiroDato · Stroop V2. Mismo personaje y mismo sistema de actuación que el resto del
 * canal; ~26 % más grande que en la V1 y con una progresión emocional clara:
 * confianza → concentración → confusión → sorpresa → comprensión.
 */

export const TOMI = { x: 215, floor: 1765, scale: 1.55 };
/** dónde mira: la tarjeta / el diagrama (coordenadas de la escena) */
export const LOOK_CARD: Vec = { x: 510, y: 690 };

const P = (s: ActState, extra: Partial<Pose> = {}) => statePose(s, TOMI.x, TOMI.floor, TOMI.scale, extra);

/** fotograma 0 (y último): desafiante, ceja arriba, media sonrisa */
const P0: Pose = P("ironico", { headTilt: -4, face: { ...FACE.ironico, smile: 0.5 } });
const CONFIDENT: Pose = P("ironico", { face: { ...FACE.ironico, smile: 0.65, lidL: 0.3, lidR: 0.25 } });
const EASY: Pose = P("duda", { face: { ...FACE.ironico, smile: 0.7, mouthOpen: 0.2 }, shrug: 0.6 }); // «Fácil.»
const SERIOUS: Pose = P("firme", { face: { ...FACE.firme, smile: 0.2 } }); // «Ahora en serio.»
const FOCUS: Pose = P("pensando", { face: { ...FACE.firme, smile: 0, lidL: 0.32, lidR: 0.32 } });
const UNSURE: Pose = P("duda", { face: { ...FACE.duda } });
const OOPS: Pose = P("incredulidad", { face: { ...FACE.sorpresa, eyeScale: 1.12, mouthOpen: 0.5 } });
const STRESS: Pose = mixPose(P("duda"), P("sorpresa"), 0.45);
const FACEPALM: Pose = {
  ...P("neutral", { face: { ...FACE.duda, lidL: 0.9, lidR: 0.9, smile: -0.4, mouthOpen: 0.15 } }),
  lean: 6,
  headTilt: 12,
  shrug: 0.5,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "open", ik: { x: -6, y: -58, space: "chin", weight: 1, bend: 1 } },
  armBack: { shoulder: 0, elbow: 10, wrist: 0, hand: "open", ik: { x: 22, y: -62, space: "chin", weight: 1, bend: -1 } },
};
const SHOCK: Pose = P("sorpresa", { hop: 0 });

const BEATS: Beat[] = [
  { at: 0, pose: P0 },
  { at: T.L_START[1] + 10, pose: CONFIDENT, dur: 8 }, // confianza: lo dice sin esfuerzo
  { at: T.CLOSE1[0] + 6, pose: EASY, dur: 8, ease: snap(0.2, 0.3) }, // «Fácil.»
  { at: T.VOICE_AT.v2 + 26, pose: SERIOUS, dur: 7 }, // «Ahora en serio.»
  { at: T.L_START[2] + 8, pose: FOCUS, dur: 10 }, // concentración
  { at: T.STARTS[1][2] + 8, pose: UNSURE, dur: 8 }, // empieza a dudar
  { at: T.MISTAKE + 10, pose: OOPS, dur: 6, ease: snap(0.25, 0.3) }, // se equivoca
  { at: T.STARTS[2][4] + 2, pose: STRESS, dur: 8 }, // confusión
  { at: T.FACEPALM + 8, pose: FACEPALM, dur: 7, ease: snap(0.2, 0.3) }, // se tapa la cara
  { at: T.CLOSE2[0] + 4, pose: SHOCK, dur: 6, ease: snap(0.3, 0.35) }, // sorpresa (primer plano)
  { at: T.SPLIT + 14, pose: P("pensando"), dur: 12 }, // escucha la explicación
  { at: T.NAME, pose: P("sospecha"), dur: 8 },
  { at: T.WINNER + 4, pose: P("eureka"), dur: 7, ease: snap(0.2, 0.3) }, // comprensión
  { at: T.STAMP_HIT - 2, pose: P("celebracion", { hop: 6 }), dur: 7, ease: snap(0.2, 0.3) },
  { at: T.END_HEAD + 8, pose: P("ironico", { face: { ...FACE.ironico, smile: 0.7, browLiftR: 0.9 } }), dur: 8 }, // «¿te animás otra vez?» (desafiante)
  { at: T.RETURN[1], pose: P0, dur: T.RETURN[1] - T.RETURN[0] },
];

const frozen = (f: number) => f >= T.FREEZE && f < T.CLOSE2[0];
const pulse01 = (f: number, at: number, dur: number) => {
  const d = f - at;
  return d < 0 || d > dur ? 0 : Math.sin(Math.PI * (d / dur));
};
/** "dice el color": en el nivel 1 enseguida, después cada vez más tarde */
const speak = (f: number) => {
  let m = 0;
  T.STARTS[0].forEach((s) => (m = Math.max(m, pulse01(f, s + 4, 8))));
  T.STARTS[1].forEach((s, i) => (m = Math.max(m, pulse01(f, s + 12 + i * 3, 9) * 0.9)));
  T.STARTS[2].forEach((s, i) => {
    if (i === 5) return;
    m = Math.max(m, pulse01(f, s + 10 + i * 2, 8) * (i === 2 ? 1.3 : 0.85));
  });
  return m;
};

type Target = "cam" | "card" | "tokA" | "tokB" | "gate" | "stamp";
const GAZE: [number, Target][] = [
  [0, "cam"], [T.L_START[1] - 6, "card"], [T.CLOSE1[0] + 2, "cam"], [T.L_START[2] - 6, "card"], [T.CLOSE2[0], "cam"],
  [T.SPLIT + 6, "card"], [T.AUTO - 4, "tokA"], [T.NAME - 4, "tokB"], [T.CLASH - 6, "gate"], [T.WINNER + 10, "cam"],
  [T.HEAD_EFFECT - 4, "stamp"], [T.END_HEAD, "cam"],
];
const targetPoint = (t: Target): Vec | null =>
  t === "card" || t === "stamp" ? LOOK_CARD : t === "tokA" ? { x: 600, y: 545 } : t === "tokB" ? { x: 560, y: 800 } : t === "gate" ? { x: 820, y: 680 } : null;
const lookFor = (t: Target, head: Vec): [number, number] => {
  const p = targetPoint(t);
  if (!p) return [-0.38, 0.04];
  return [clamp((p.x - head.x) / 260, -1, 1), clamp((p.y - head.y) / 320, -1, 1)];
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
const BLINKS = [16, 70, 150, 200, 262, 330, 470, 560, 640, 720, 790, 880, 920];

const build = (f: number, hair: number, look: [number, number], lag: [number, number]): Pose => {
  const b = beatPose(f, BEATS);
  const still = frozen(f) ? 0 : 1;
  const breath = Math.sin((f / 46) * Math.PI * 2);
  const talk = speak(f);
  const face: FacePose = { ...b.face, lookX: look[0], lookY: look[1], mouthOpen: Math.max(b.face.mouthOpen, 0.4 * talk) };
  const nod = T.STARTS[0].reduce((a, s) => a + 4 * pulse01(f, s + 4, 10), 0);
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
export const getTomiV2 = (): TomiFrame[] => {
  if (cache) return cache;
  const N = T.DURATION;
  const S = TOMI.scale;
  const src = (f: number) => (frozen(f) ? T.FREEZE : f);
  const head0 = Array.from({ length: N }, (_, f) => {
    const p = build(src(f), 0, [0, 0], [0, 0]);
    const r = rigV2(p);
    return { x: p.x + r.headCenter.x * S, y: p.y + r.headCenter.y * S };
  });
  const gaze = head0.map((h, f) => gazeAt(src(f), h));
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

/** zonas protegidas de Tomi en pantalla */
export const tomiBoxes = (f: number, cam: (v: Vec) => Vec): Box[] => {
  const { pose, rig, head } = getTomiV2()[Math.min(T.LAST, Math.max(0, f))];
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
