import { blink, clamp, ease, lerp, springSeries } from "../../../canal/personaje/anim";
import type { FacePose, Pose, Rig, Vec } from "../../../canal/personaje/rig";
import { rigV2 } from "../../../canal/personaje/tomi-v2/CharacterV2";
import { FACE, statePose, type ActState } from "../../../canal/personaje/tomi-v2/acting";
import { beatPose, mixPose, snap, type Beat } from "../../../canal/personaje/tomi-v2/motion2";
import { HEAD_SCALE } from "../../../canal/personaje/tomi-v2/style";
import type { Box } from "../../01-efecto-senuelo/final/cafe";
import { lipSeries } from "../../../canal/personaje/tomi-v2/lipsync";
import * as T from "./timeline";
import { ALIGN, blockWords, type VoiceId } from "./voice";

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
/** apertura: señala la tarjeta de ejemplo mientras explica la regla */
const SHOW_EX: Pose = {
  ...P("ironico", { face: { ...FACE.ironico, smile: 0.55, browLiftR: 0.8 }, headTilt: -2 }),
  lean: 3,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "point", ik: { x: 470, y: 960, space: "scene", weight: 1, bend: 1 }, aim: { x: 510, y: 715, weight: 1 } },
};
/** «No leas la palabra»: índice arriba, advierte a cámara */
const WARN: Pose = P("eureka", { face: { ...FACE.firme, smile: 0.35, browLiftL: 0.5, browLiftR: 0.6 } });
/** cuenta regresiva: se prepara (puños, se inclina hacia la tarjeta) */
const READY: Pose = P("firme", { face: { ...FACE.firme, smile: 0.45 } });
/** presenta la explicación: palma abierta hacia el diagrama, la otra mano en la cintura (boca libre) */
const PRESENT: Pose = {
  ...P("ironico", { face: { ...FACE.neutral, smile: 0.35, browLiftL: 0.25, browLiftR: 0.35 }, headTilt: -3 }),
  lean: 2,
  armFront: { shoulder: 0, elbow: 10, wrist: 0, hand: "open", ik: { x: 118, y: -175, space: "hip", weight: 1, bend: 1 }, aim: { x: 900, y: 300, weight: 0.8 } },
};
/** «nombrar un color cuesta más»: mano que pesa, gesto de esfuerzo */
const EFFORT: Pose = {
  ...P("duda", { face: { ...FACE.duda, smile: -0.1 } }),
  armBack: { shoulder: 0, elbow: 10, wrist: 0, hand: "fist", ik: { x: 52, y: -44, space: "hip", weight: 1, bend: -1 } },
};

const BEATS: Beat[] = [
  { at: 0, pose: P0 },
  { at: 22, pose: SHOW_EX, dur: 12 }, // «Decí en voz alta el color» (señala el ejemplo)
  { at: T.EX_HINT + 2, pose: WARN, dur: 8, ease: snap(0.15, 0.3) }, // «No leas la palabra»
  { at: T.COUNT[0] + 6, pose: READY, dur: 10 }, // 3 · 2 · 1
  { at: T.L_START[1] + 12, pose: CONFIDENT, dur: 12 }, // confianza: lo dice sin esfuerzo
  { at: T.CLOSE1[0] + 6, pose: EASY, dur: 8, ease: snap(0.2, 0.3) }, // «Fácil.»
  { at: T.VOICE_AT.v2 + 28, pose: SERIOUS, dur: 10 }, // «Ahora en serio.»
  { at: T.L_START[2] + 10, pose: FOCUS, dur: 12 }, // concentración
  { at: T.STARTS[1][2] + 10, pose: UNSURE, dur: 11 }, // empieza a dudar
  { at: T.MISTAKE + 10, pose: OOPS, dur: 6, ease: snap(0.25, 0.3) }, // se equivoca
  { at: T.STARTS[2][4] + 4, pose: STRESS, dur: 10 }, // confusión
  { at: T.FACEPALM + 8, pose: FACEPALM, dur: 7, ease: snap(0.2, 0.3) }, // se tapa la cara
  { at: T.CLOSE2[0] + 4, pose: SHOCK, dur: 6, ease: snap(0.3, 0.35) }, // sorpresa (primer plano)
  { at: T.SPLIT + 16, pose: PRESENT, dur: 14 }, // presenta la explicación
  { at: T.NAME + 2, pose: EFFORT, dur: 12 },
  { at: T.CLASH - 2, pose: P("sorpresa", { face: { ...FACE.sorpresa, mouthOpen: 0.3, eyeScale: 1.1 } }), dur: 6, ease: snap(0.2, 0.3) }, // ¡chocan!
  { at: T.WINNER + 4, pose: P("eureka"), dur: 7, ease: snap(0.2, 0.3) }, // comprensión
  { at: T.STAMP_HIT - 2, pose: P("celebracion", { hop: 6 }), dur: 7, ease: snap(0.2, 0.3) },
  { at: T.END_HEAD + 10, pose: P("ironico", { face: { ...FACE.ironico, smile: 0.7, browLiftR: 0.9 } }), dur: 12 }, // «¿te animás otra vez?» (desafiante)
  { at: T.RETURN[1], pose: P0, dur: T.RETURN[1] - T.RETURN[0] },
];

const frozen = (f: number) => f >= T.FREEZE && f < T.CLOSE2[0];
const pulse01 = (f: number, at: number, dur: number) => {
  const d = f - at;
  return d < 0 || d > dur ? 0 : Math.sin(Math.PI * (d / dur));
};
/** sincronía de labios con los cinco bloques de voz */
const VOICES = Object.keys(T.VOICE_AT) as VoiceId[];
const LIP = lipSeries(VOICES.map((id) => ({ align: ALIGN[id], at: T.VOICE_AT[id] })), T.DURATION);
/** palabras con acento (cejas arriba y asentimiento) */
const EMPH = ["facil", "serio", "casi", "automatico", "nombrar", "cuesta", "chocan", "primero", "stroop", "animas", "rapido", "voz", "palabra"];
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ]/g, "");
const WORD_STARTS = VOICES.flatMap((id) => blockWords(id).map((w) => ({ f: T.VOICE_AT[id] + w.s * 30, len: norm(w.t).length, emph: EMPH.includes(norm(w.t)) })));
const accents = (f: number) => {
  let nod = 0;
  let brow = 0;
  for (const w of WORD_STARTS) {
    if (w.len >= 4) nod += 1.6 * pulse01(f, w.f - 1, 8);
    if (w.emph) {
      brow = Math.max(brow, pulse01(f, w.f - 3, 16));
      nod += 2.2 * pulse01(f, w.f - 1, 10);
    }
  }
  return { nod, brow };
};
/** "dice el color": en el nivel 1 enseguida, después cada vez más tarde (solo si no habla el narrador) */
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
  [0, "cam"], [16, "card"], [T.EX_HINT, "cam"], [T.COUNT[0], "card"], [T.L_START[1] - 6, "card"], [T.CLOSE1[0] + 2, "cam"], [T.L_START[2] - 6, "card"],
  [T.MISTAKE + 12, "cam"], [T.MISTAKE + 18, "card"], [T.STARTS[2][4] + 10, "cam"], [T.STARTS[2][4] + 15, "card"], [T.CLOSE2[0], "cam"],
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
const BLINKS = [16, 70, T.CLOSE1[0] + 3, 150, T.CLOSE1[1] + 2, 230, 262, T.MISTAKE + 14, T.MISTAKE + 20, T.SPLIT + 3, 560, 640, 720, 790, 880, 935, 975];

const build = (f: number, hair: number, look: [number, number], lag: [number, number]): Pose => {
  const b = beatPose(f, BEATS);
  const still = frozen(f) ? 0 : 1;
  const breath = Math.sin((f / 46) * Math.PI * 2);
  const tk = frozen(f) ? 0 : LIP.talking[f] ?? 0;
  const cardTalk = speak(f) * (1 - tk);
  const lipOpen = (LIP.open[f] ?? 0) * 0.78;
  const ac = accents(f);
  const face: FacePose = {
    ...b.face,
    lookX: look[0],
    lookY: look[1],
    mouthOpen: Math.max(b.face.mouthOpen * (1 - 0.7 * tk), lipOpen * tk, 0.4 * cardTalk),
    mouthWidth: b.face.mouthWidth * (1 + ((LIP.width[f] ?? 1) - 1) * tk),
    browLiftL: b.face.browLiftL + 0.35 * ac.brow * tk,
    browLiftR: b.face.browLiftR + 0.35 * ac.brow * tk,
  };
  const nod = T.STARTS[0].reduce((a, s) => a + 4 * pulse01(f, s + 4, 10), 0) * (1 - tk) + ac.nod * tk;
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
  for (const [name, a] of [["mano", rig.front], ["mano2", rig.back]] as const) {
    const w = L(a.wr);
    const p = L(a.palm);
    out.push(bx({ x: Math.min(w.x, p.x) - 24 * S, y: Math.min(w.y, p.y) - 24 * S }, { x: Math.max(w.x, p.x) + 24 * S, y: Math.max(w.y, p.y) + 30 * S }, "hard", name));
  }
  const neck = L(rig.neck);
  out.push(bx({ x: neck.x - 64 * S, y: neck.y }, { x: neck.x + 64 * S, y: 1450 }, "hard", "cuerpo"));
  return out;
};
