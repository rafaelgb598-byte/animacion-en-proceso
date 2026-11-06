import {
  blink,
  clamp,
  ease,
  lerp,
  offsetTrack,
  pathTrack,
  smooth,
  springSeries,
  track,
  wobble,
  type Key,
  type PathKey,
  type PoseKey,
} from "../character/anim";
import { footState, hipHeightFor, smoothUnder, type FootPlan } from "../character/feet";
import { arm, FACES, FACES_V2, leg, standing } from "../character/presets";
import { computeRig, type FacePose, type HandShape, type Pose, type Rig, type Vec } from "../character/rig";
import { COUNTER_TOP, FLOOR } from "../scenes/decoy-v2/CafeV2";
import { CUE, DURATION } from "./timing";

/**
 * Actuación de Tomi en la cafetería (escenas A y B) + estado de los vasos.
 * Se calcula una vez (caché) en dos pasadas, como la V3: poses → movimiento secundario.
 */

export const S = 1.5;
const N = DURATION;

/* ------------------------------ vasos ------------------------------ */

export const CUP_H = { L: 185, M: 155, S: 120 };
export const cupLx = (f: number) => track(f, [[0, 1120], [226, 1120], [238, 1080, ease.out], [1300, 1080], [1318, 1120, ease.inOut]]);
export const cupSx = (f: number) => track(f, [[0, 1420], [226, 1420], [238, 1460, ease.out], [1300, 1460], [1318, 1420, ease.inOut]]);
export const M_X = 1270;
export const mVisible = (f: number) => f >= 226 && f < 1314;
export const mDropY = (f: number) =>
  track(f, [[226, -900], [CUE.mediano + 2, 0, ease.in], [1296, 0], [1313, 260, ease.in]]);
export const mSquash = (f: number) =>
  track(f, [[CUE.mediano + 1, 1], [CUE.mediano + 3, 0.72, ease.out], [CUE.mediano + 7, 1.12], [CUE.mediano + 12, 0.96], [CUE.mediano + 17, 1]]);
export const mTagScale = (f: number) => track(f, [[CUE.seis - 2, 0], [CUE.seis + 6, 1, ease.overshoot], [1294, 1], [1306, 0, ease.in]]);
/** servilleta: en la mano (0..1) y apoyada sobre el mediano */
export const napkinHeld = (f: number) => f >= 1248 && f < CUE.mediano2 + 1;
export const napkinDraped = (f: number) => f >= CUE.mediano2 + 1;

/* ------------------------------ tiempos ------------------------------ */

const ROOT = 830;
const NEAR_M = 1000;
export const rootX = (f: number) =>
  track(f, [[0, ROOT], [1236, ROOT], [1254, NEAR_M, ease.inOut], [1300, NEAR_M], [1318, ROOT, ease.inOut]]);

const STANCE = { F: ROOT - 26, B: ROOT + 36 };
const PLAN: FootPlan = {
  start: { ...STANCE },
  steps: [
    { foot: "F", lift: 1236, land: 1245, from: STANCE.F, to: NEAR_M - 26, height: 14 },
    { foot: "B", lift: 1245, land: 1254, from: STANCE.B, to: NEAR_M + 36, height: 12 },
    { foot: "F", lift: 1300, land: 1309, from: NEAR_M - 26, to: STANCE.F, height: 12 },
    { foot: "B", lift: 1309, land: 1318, from: NEAR_M + 36, to: STANCE.B, height: 12 },
  ],
};

const FREEZE = { from: CUE.pero - 4, to: 500 };
const frozen = (f: number) => f >= FREEZE.from && f < FREEZE.to;

const lean = (f: number) =>
  track(f, [
    [0, -1], [150, -2], [170, -3], [236, -3], [241, -5.5], [252, -1], [298, -3], [312, 4, ease.out], [330, 2],
    [348, 2], [358, 6, ease.out], [372, 5], [CUE.son - 2, 3], [CUE.son + 3, -3, ease.out], [404, 1], [446, 1],
    [452, -3], [FREEZE.from, 9, ease.out], [FREEZE.to, 9], [530, 0], [632, 0], [1112, 0], [1160, 2], [1236, 1],
    [1254, 5], [1276, 7], [1290, 7], [1302, 3], [1318, 0], [1340, -1], [N, -1],
  ]);
const squash = (f: number) =>
  track(f, [[0, 1], [CUE.son - 2, 1], [CUE.son, 0.965], [CUE.son + 4, 1.035, ease.out], [CUE.son + 10, 1], [241, 1]]);
const bodyTurn = (f: number) =>
  track(f, [[0, 1], [1112, 1], [1132, 0.55], [1228, 0.55], [1248, 0.95], [1300, 0.95], [1330, 1]]);
const headTurn = (f: number) =>
  track(f, [
    [0, 1], [150, 1], [172, 0.6], [236, 0.6], [298, 0.5], [304, 0.38], [312, 1.05, ease.out], [318, 1], [1112, 1],
    [1132, 0.42], [1228, 0.42], [1248, 1], [1330, 1],
  ]);
const headTilt = (f: number) =>
  track(f, [
    [0, 3], [14, 5], [26, 3], [38, 6], [58, 4], [86, 6], [140, 4], [150, 2], [176, -9], [205, -3], [CUE.agrego, -10],
    [240, -6], [296, -4], [304, -10], [312, 8, ease.out], [322, 5], [330, 6], [338, 4], [348, 5], [366, 6],
    [CUE.son - 2, 4], [CUE.son + 3, -8, ease.out], [404, -2], [446, 3], [FREEZE.from, 8], [FREEZE.to, 8], [530, 3],
    [632, 3], [1112, 2], [1165, -3], [1215, 4], [1236, 6], [1276, 10], [1300, 6], [1330, 4], [1350, 5], [N, 3],
  ]);
const shrug = (f: number) => track(f, [[0, 0.08], [160, 0.08], [176, 0.24], [232, 0.24], [244, 0.08], [N, 0.08]]);

/* ------------------------------ mirada ------------------------------ */

const LOOK: Record<string, [number, number]> = {
  L: [0.6, 0.7],
  S: [1, 0.3],
  M: [1, 0.38],
  think: [-0.5, -0.75],
  up: [0.35, -0.9],
  cam: [-0.3, 0.05],
};
const GAZE: [number, string][] = [
  [0, "L"], [14, "S"], [26, "L"], [CUE.rapido, "S"], [58, "L"], [CUE.tres - 6, "S"], [CUE.siete - 8, "L"], [176, "think"],
  [205, "L"], [CUE.agrego, "up"], [244, "M"], [312, "M"], [322, "L"], [330, "M"], [338, "S"], [346, "M"], [CUE.ganga - 6, "L"],
  [530, "L"], [1112, "cam"], [1158, "M"], [1208, "L"], [1236, "M"], [1302, "M"], [1320, "L"], [1336, "S"], [1352, "L"],
  [1366, "S"], [1380, "L"],
];
const gazeKeys = (axis: 0 | 1): Key[] => {
  const out: Key[] = [];
  GAZE.forEach(([fr, name], i) => {
    const v = LOOK[name][axis];
    if (i > 0) {
      const prev = LOOK[GAZE[i - 1][1]][axis];
      if (prev !== v) {
        out.push([fr - 3, prev]);
        out.push([fr, v, ease.saccade]);
        return;
      }
    }
    out.push([fr, v]);
  });
  return out;
};
const LX = gazeKeys(0);
const LY = gazeKeys(1);

/* ------------------------------ expresión ------------------------------ */

const SURPRISE_LITE: FacePose = { ...FACES.surprise, eyeScale: 1.14, pupil: 0.82, mouthOpen: 0.55, browLiftL: 0.95, browLiftR: 0.95 };
const KNOWING: FacePose = { ...FACES.ironic, lidL: 0.3, lidR: 0.26, browLiftR: 0.55, smile: 0.5 };
const PUZZLED: FacePose = { ...FACES_V2.realize, mouthOpen: 0.08, smile: -0.05, browAngleL: 6, browAngleR: 4 };

const FACE_KEYS: PoseKey<FacePose>[] = [
  [0, FACES_V2.weigh], [150, FACES_V2.weigh], [176, FACES_V2.hmm], [240, FACES_V2.hmm], [246, FACES_V2.startle, ease.out],
  [256, FACES_V2.startle], [298, FACES_V2.notice], [312, FACES_V2.aha, ease.out], [340, FACES.interested],
  [CUE.son - 2, FACES.interested], [CUE.son + 4, SURPRISE_LITE, ease.out], [414, FACES_V2.delighted], [446, FACES.determined],
  [FREEZE.from, FACES.determined], [FREEZE.to, FACES.determined], [530, PUZZLED], [632, FACES_V2.weigh],
  [1112, KNOWING], [1228, KNOWING], [1244, FACES.determined], [1294, FACES.determined], [1320, FACES_V2.weigh], [N, FACES_V2.weigh],
];
const FACE_GROUPS: { keys: (keyof FacePose)[]; offset: number }[] = [
  { keys: ["browLiftL", "browLiftR", "browAngleL", "browAngleR"], offset: 2 },
  { keys: ["smile", "mouthOpen", "mouthWidth", "mouthSkew"], offset: -2 },
  { keys: ["blush"], offset: -5 },
];
const SMOOTHED: (keyof FacePose)[] = [
  "browLiftL", "browLiftR", "browAngleL", "browAngleR", "lidL", "lidR", "lidAngle", "lowerLid",
  "smile", "mouthOpen", "mouthWidth", "mouthSkew", "blush", "eyeScale", "pupil",
];
const BLINKS = [44, 120, 176, 214, 250, 305, 360, 446, 534, 610, 1118, 1180, 1240, 1302, 1340, 1384];

/* ------------------------------ manos ------------------------------ */

type HandState = { hand: HandShape; handNext?: HandShape; handMix?: number };
export const handAt = (f: number, list: [number, HandShape][], span = 3): HandState => {
  let i = 0;
  while (i + 1 < list.length && f >= list[i + 1][0] - span / 2) i++;
  const cur = list[i][1];
  const next = list[i + 1];
  if (next && f >= next[0] - span / 2) return { hand: cur, handNext: next[1], handMix: smooth((f - (next[0] - span / 2)) / span) };
  if (i > 0 && f < list[i][0] + span / 2) return { hand: list[i - 1][1], handNext: cur, handMix: smooth((f - (list[i][0] - span / 2)) / span) };
  return { hand: cur };
};
const FRONT_HAND: [number, HandShape][] = [
  [0, "relaxed"], [162, "chin"], [240, "relaxed"], [352, "fist"], [357, "point"], [432, "relaxed"], [452, "reach"],
  [532, "relaxed"], [1150, "open"], [1226, "relaxed"], [1250, "hold"], [CUE.mediano2 + 1, "open"], [1300, "relaxed"],
];
const BACK_HAND: [number, HandShape][] = [[0, "relaxed"], [1148, "open"], [1226, "relaxed"]];

const CUP_CENTER = (x: number, h: number): Vec => ({ x, y: COUNTER_TOP - h * 0.5 });

const frontTarget = (f: number) => {
  if (f < 244) {
    const tap = -5 * Math.exp(-(((f - 196) / 2.2) ** 2)) - 5 * Math.exp(-(((f - 205) / 2.2) ** 2));
    return { space: "chin" as const, x: -2, y: 17 + tap };
  }
  const keys: PathKey[] = [
    [340, { x: 1000, y: 1110 }],
    [358, { x: M_X, y: 975 }, ease.out, 18],
    [376, { x: M_X, y: 975 }],
    [386, { x: 1160, y: 960 }, ease.inOut, 10],
    [432, { x: 1160, y: 960 }],
    [446, { x: 905, y: 1150 }, ease.inOut],
    [FREEZE.from, { x: 1012, y: 1168 }, ease.out, -8],
    [FREEZE.to, { x: 1012, y: 1168 }],
    [1148, { x: 980, y: 1130 }],
    [1166, { x: 1030, y: 1095 }, ease.out, 10],
    [1196, { x: 1020, y: 1100 }],
    [1214, { x: 990, y: 1070 }, ease.out, 8],
    [1244, (fr) => ({ x: rootX(fr) + 55, y: 1175 })],
    [1264, { x: 1188, y: 1118 }, ease.inOut, -14],
    [1276, { x: 1196, y: 1112 }],
    [CUE.mediano2 + 1, { x: 1210, y: 1124 }, ease.inOut],
    [1296, (fr) => ({ x: rootX(fr) + 60, y: 1150 }), ease.inOut],
  ];
  const p = pathTrack(f, keys);
  return { space: "scene" as const, x: p.x, y: p.y };
};
const frontAim = (f: number): Vec => (f < 380 ? CUP_CENTER(M_X, CUP_H.M) : f < 1190 && f > 1100 ? CUP_CENTER(M_X, CUP_H.M) : CUP_CENTER(1080, CUP_H.L));

/* ------------------------------ pose ------------------------------ */

type Extra = { hairLag: number; dragF: number; dragB: number; face?: FacePose; hipHeight: number };

const buildPose = (f: number, extra: Extra): Pose => {
  const base = standing(rootX(f), FLOOR, S);
  const hold = frozen(f);
  const still = hold ? 0 : 1;
  const breath = Math.sin((f / 50) * Math.PI * 2);

  let face: FacePose;
  if (extra.face) face = { ...extra.face };
  else face = offsetTrack(f, FACE_KEYS, FACE_GROUPS);
  face.lookX = track(f, LX);
  face.lookY = track(f, LY);
  const gx = track(f - 4, LX);
  const gy = track(f - 4, LY);
  const fs = footState(PLAN, "F", f, FLOOR, S);
  const bs = footState(PLAN, "B", f, FLOOR, S);

  return {
    ...base,
    hipHeight: extra.hipHeight,
    lean: lean(f) + 0.5 * Math.sin(f * 0.045) * still,
    squash: squash(f) * (1 + 0.006 * breath * still),
    hop: 0,
    bodyTurn: bodyTurn(f),
    headTurn: headTurn(f) + 0.05 * gx,
    headTilt: headTilt(f) + 3.5 * gy + 0.7 * Math.sin(f * 0.06 + 1) * still,
    shrug: shrug(f) + 0.05 * (breath + 1) * 0.5 * still,
    face,
    blink: hold ? 1 : blink(f, BLINKS),
    hairLag: extra.hairLag,
    legFront: leg({ ik: fs.pos, foot: fs.angle }),
    legBack: leg({ ik: bs.pos, foot: bs.angle }),
    armFront: arm({
      shoulder: 4,
      elbow: 14,
      wristDrag: extra.dragF,
      ...handAt(f, FRONT_HAND),
      ik: {
        ...frontTarget(f),
        bend: 1,
        weight: track(f, [
          [0, 0], [156, 0], [172, 1], [236, 1], [246, 0], [342, 0], [356, 1, ease.out], [430, 1], [440, 0.6],
          [446, 0.85], [FREEZE.from, 1], [FREEZE.to, 1], [536, 0], [1146, 0], [1160, 1], [1226, 1], [1236, 0.6],
          [1250, 1], [1294, 1], [1308, 0],
        ]),
      },
      aim: {
        ...frontAim(f),
        weight: track(f, [[0, 0], [350, 0], [357, 1], [428, 1], [436, 0], [454, 0], [FREEZE.from, 0.8], [FREEZE.to, 0.8], [528, 0], [1150, 0], [1162, 0.7], [1224, 0.7], [1230, 0]]),
      },
    }),
    armBack: arm({
      shoulder: track(f, [[0, -2], [1148, -2], [1162, -18, ease.out], [1222, -14], [1236, -2]]),
      elbow: track(f, [[0, 14], [1148, 14], [1162, 42, ease.out], [1222, 36], [1236, 14]]),
      wristDrag: extra.dragB,
      ...handAt(f, BACK_HAND),
    }),
  };
};

/* ------------------------------ caché ------------------------------ */

export type CafeTimeline = { poses: Pose[]; rigs: Rig[]; head: Vec[] };
let cache: CafeTimeline | null = null;

export const getCafe = (): CafeTimeline => {
  if (cache) return cache;
  const hip = smoothUnder(
    Array.from({ length: N }, (_, f) => {
      const t = bodyTurn(f);
      const r = rootX(f);
      const ankles = { F: footState(PLAN, "F", f, FLOOR, S).pos, B: footState(PLAN, "B", f, FLOOR, S).pos };
      const hips = { F: r + lerp(-24, -10, t) * S, B: r + lerp(24, 14, t) * S };
      return hipHeightFor(ankles, hips, FLOOR, S, 0.992);
    }),
  );
  const zero = (f: number): Extra => ({ hairLag: 0, dragF: 0, dragB: 0, hipHeight: hip[f] });
  const p1 = Array.from({ length: N }, (_, f) => buildPose(f, zero(f)));
  const r1 = p1.map((p) => computeRig(p));

  const faces = p1.map((p) => ({ ...p.face }));
  for (const k of SMOOTHED) {
    const brow = k.indexOf("brow") === 0;
    const s = springSeries(faces.map((fc) => fc[k]), brow ? 0.2 : 0.3, brow ? 0.62 : 0.58);
    faces.forEach((fc, i) => (fc[k] = s[i]));
  }
  const headAng = r1.map((r) => r.headAngle);
  const sHead = springSeries(headAng, 0.16, 0.7);
  const hair = headAng.map((a, f) => 2.2 * (sHead[f] - a));
  const gate = (f: number) => (f >= 160 && f < 244) || (f >= 350 && f < 540) || (f >= 1248 && f < 1300) ? 0.15 : 1;
  const hF = r1.map((r) => r.front.handAng);
  const hB = r1.map((r) => r.back.handAng);
  const sF = springSeries(hF, 0.22, 0.62);
  const sB = springSeries(hB, 0.22, 0.62);
  const poses = Array.from({ length: N }, (_, f) =>
    buildPose(f, {
      hipHeight: hip[f],
      hairLag: frozen(f) ? hair[FREEZE.from] : hair[f],
      dragF: clamp((sF[f] - hF[f]) * 0.7, -22, 22) * gate(f),
      dragB: clamp((sB[f] - hB[f]) * 0.7, -22, 22),
      face: faces[f],
    }),
  );
  const rigs = poses.map((p) => computeRig(p));
  const head = rigs.map((r, f) => {
    const p = poses[f];
    return { x: p.x + r.headCenter.x * S, y: p.y + r.headCenter.y * S };
  });
  cache = { poses, rigs, head };
  return cache;
};

/** utilidades para las escenas */
export const cupCenter = CUP_CENTER;
export { wobble };
