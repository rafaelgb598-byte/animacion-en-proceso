import { Easing } from "remotion";
import {
  blink,
  clamp,
  ease,
  noise,
  offsetTrack,
  pathTrack,
  smooth,
  springSeries,
  track,
  wobble,
  type EaseFn,
  type Key,
  type PathKey,
  type PoseKey,
} from "../../../../canal/personaje/anim";
import { withWalkV2 } from "../../../../canal/personaje/motion";
import { arm, FACES, FACES_V2, leg, standing } from "../../../../canal/personaje/presets";
import { computeRig, localToScene, STRIDE, type FacePose, type HandShape, type Pose, type Rig, type Vec } from "../../../../canal/personaje/rig";
import { COUNTER_TOP, FLOOR } from "../../../../canal/escenarios/cafeteria/CafeV2";

/**
 * Línea de tiempo de la V2 (300 fotogramas).
 * Se calcula UNA vez por pestaña de render y se guarda en caché:
 *   pasada 1 → poses base y esqueleto
 *   simulaciones → pelo, arrastre de muñecas, vaso en la mano, cartel, cámara
 *   pasada 2 → poses finales con el movimiento secundario
 */

export const N = 300;
export const S = 1.5;
const X0 = -160;
export const XSTOP = 830;
const XSTEP = 915;
export const GRAB = 264;

export const CUP_H = { L: 185, M: 155, S: 120 };
export const GRIP_L = CUP_H.L * 0.45;

/* ---------------------------- objetos ---------------------------- */

export const cupL = (f: number) => track(f, [[0, 1130], [122, 1130], [134, 1100, ease.out]]);
export const cupS = (f: number) => track(f, [[0, 1400], [122, 1400], [134, 1430, ease.out]]);
export const cupMx = (f: number) => 1270 + track(f, [[GRAB, 0], [GRAB + 14, 34, ease.out]]);
export const cupMdrop = (f: number) => track(f, [[124, -950], [132, 0, ease.in]]);
export const cupMsy = (f: number) =>
  track(f, [[131, 1], [133, 0.68, ease.out], [137, 1.15], [142, 0.95], [147, 1]]);
export const gripL = (f: number): Vec => ({ x: cupL(f), y: COUNTER_TOP - GRIP_L });
const M_POINT = { x: 1270, y: 1150 };

/* ---------------------------- tiempos ---------------------------- */

const decel = Easing.bezier(0.4, 0.58, 0.55, 1);

const rootX = (f: number) =>
  track(f, [[0, X0], [34, 486, ease.linear], [60, XSTOP, decel], [252, XSTOP], [262, XSTEP, ease.inOut]]);

const lean = (f: number) =>
  track(f, [
    [0, 0], [34, 0], [52, 2], [60, 8, ease.out], [68, -3], [76, 1], [84, 0], [92, -2.5], [130, -3],
    [134, -4.5], [138, -6], [148, -2], [156, 7, ease.out], [170, 5], [186, 7], [224, 7], [228, 5],
    [231, 8], [235, -7, ease.out], [244, -1], [250, -3], [261, 9], [266, 8], [278, -2], [300, -2],
  ]);
const squash = (f: number) =>
  track(f, [
    [0, 1], [58, 1], [61, 0.95], [68, 1.01], [74, 1], [133, 1], [135, 0.96], [140, 1], [150, 0.97],
    [156, 1.03], [162, 1], [229, 1], [231, 0.9], [235, 1.1, ease.out], [241, 0.98], [246, 1], [262, 1],
    [264, 0.97], [269, 1],
  ]);
const hop = (f: number) => track(f, [[0, 0], [231, 0], [235, 18, ease.out], [240, 0, ease.in]]);
const crouch = (f: number) => track(f, [[0, 0], [57, 0], [61, 0.5], [68, 0], [229, 0], [231, 1], [234, 0, ease.out]]);
const shrug = (f: number) =>
  track(f, [
    [0, 0], [86, 0], [98, 0.25], [132, 0.25], [134, 0.6, ease.out], [140, 0.1], [150, 0], [284, 0],
    [292, 1, ease.out], [298, 0.65], [300, 0.7],
  ]);
const bodyTurn = (f: number) => track(f, [[0, 1], [270, 1], [286, 0.3]]);
const headTurn = (f: number) =>
  track(f, [
    [0, 1], [96, 1], [106, 0.4], [134, 0.4], [137, 0.3], [146, 1.06, ease.out], [152, 1], [230, 1],
    [235, 0.55, ease.out], [246, 0.85], [256, 1], [272, 1], [286, 0.05],
  ]);
const headTilt = (f: number) =>
  track(f, [
    [0, -2], [24, -2], [28, 5], [32, 0], [36, -1], [38, -4], [43, 8, ease.out], [50, 6], [62, 7], [70, 5],
    [76, 3], [80, 5], [88, 3], [104, -9], [120, -11], [134, -6], [137, -14], [146, 9, ease.out], [154, 5],
    [186, 8], [224, 8], [228, 6], [231, 12], [235, -13, ease.out], [244, -3], [248, 6], [252, -2],
    [258, 8], [268, 4], [284, -3], [292, -8], [300, -7],
  ]);

/* ----------------------------- mirada ----------------------------- */

const LOOK: Record<string, [number, number]> = {
  fwd: [0.85, 0.1],
  glance: [0.8, 0.5],
  L: [0.6, 0.7],
  M: [1, 0.38],
  S: [1, 0.3],
  think: [-0.5, -0.75],
  think2: [-0.15, -0.85],
  inward: [0.25, 0.15],
  cam: [-0.25, 0],
  held: [0.35, 0.5],
  camFront: [-0.05, 0],
};
const GAZE: [number, string][] = [
  [0, "fwd"], [24, "glance"], [32, "fwd"], [40, "L"], [64, "L"], [74, "S"], [84, "L"], [94, "L"],
  [100, "think"], [112, "think2"], [124, "think2"], [134, "M"], [186, "M"], [196, "L"], [205, "M"],
  [212, "L"], [217, "M"], [221, "L"], [224, "inward"], [230, "cam"], [246, "cam"], [250, "L"],
  [262, "L"], [266, "held"], [278, "held"], [281, "M"], [286, "M"], [289, "camFront"],
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

/* ---------------------------- expresión ---------------------------- */

const FACE_KEYS: PoseKey<FacePose>[] = [
  [0, FACES_V2.stroll], [24, FACES_V2.stroll], [28, FACES_V2.notice], [33, FACES_V2.stroll],
  [40, FACES_V2.notice, ease.out], [52, FACES_V2.notice], [64, FACES.curious], [80, FACES_V2.weigh],
  [98, FACES_V2.hmm], [130, FACES_V2.hmm], [134, FACES_V2.startle, ease.out], [140, FACES_V2.startle],
  [150, FACES_V2.aha, ease.out], [166, FACES.interested], [180, FACES.interested], [190, FACES_V2.compare],
  [222, FACES_V2.compare], [226, FACES_V2.realize], [230, FACES.anticipation], [234, FACES.surprise, ease.out],
  [240, FACES.surprise], [248, FACES_V2.delighted], [254, FACES.determined], [264, FACES.determined],
  [272, FACES_V2.satisfied], [280, FACES_V2.satisfied], [284, FACES_V2.suspicious], [290, FACES.ironic],
  [300, FACES.ironic],
];
/** las cejas anticipan, la boca llega después, el rubor tarda más */
const FACE_GROUPS: { keys: (keyof FacePose)[]; offset: number }[] = [
  { keys: ["browLiftL", "browLiftR", "browAngleL", "browAngleR"], offset: 2 },
  { keys: ["smile", "mouthOpen", "mouthWidth", "mouthSkew"], offset: -2 },
  { keys: ["blush"], offset: -5 },
];
const BLINKS = [18, 58, 96, 112, 138, 146, 199, 249, 272, 287];

/* ------------------------------ manos ------------------------------ */

const shapeAt = (f: number, list: [number, HandShape][]): HandShape => {
  let s = list[0][1];
  for (const [fr, sh] of list) if (f >= fr) s = sh;
  return s;
};
const FRONT_HAND: [number, HandShape][] = [
  [0, "relaxed"], [94, "chin"], [139, "relaxed"], [145, "fist"], [152, "point"], [180, "relaxed"],
  [232, "open"], [246, "relaxed"], [254, "reach"], [GRAB, "hold"],
];
const BACK_HAND: [number, HandShape][] = [
  [0, "relaxed"], [90, "fist"], [142, "open"], [160, "relaxed"], [232, "open"], [246, "relaxed"], [286, "open"],
];

const frontTarget = (f: number) => {
  if (f < 146) {
    const tap = -5 * Math.exp(-(((f - 107) / 2.2) ** 2)) - 5 * Math.exp(-(((f - 116) / 2.2) ** 2));
    return { space: "chin" as const, x: -2, y: 17 + tap };
  }
  if (f < 250) {
    const jab = wobble(f, 162, -12, 0.75, 5) + wobble(f, 171, -8, 0.75, 5);
    return { space: "scene" as const, x: M_POINT.x, y: 950 + jab };
  }
  const g = gripL(f);
  const keys: PathKey[] = [
    [250, { x: g.x - 70, y: g.y - 40 }],
    [262, { x: g.x - 18, y: g.y + 2 }, ease.out, -18],
    [GRAB, { x: g.x - 18, y: g.y + 2 }],
    [277, (fr) => ({ x: rootX(fr) + 58, y: 1232 }), ease.inOut, -34],
    [288, (fr) => ({ x: rootX(fr) + 62, y: 1214 }), ease.out],
    [300, (fr) => ({ x: rootX(fr) + 60, y: 1218 })],
  ];
  const p = pathTrack(f, keys);
  return { space: "scene" as const, x: p.x, y: p.y };
};

/* -------------------------- pose por fotograma ------------------------- */

type Extra = { hairLag: number; dragF: number; dragB: number };

const buildPose = (f: number, phase: number, amp: number, ww: number, extra: Extra): Pose => {
  const base = standing(rootX(f), FLOOR, S);
  const c = crouch(f);
  const still = 1 - ww;
  // "moving hold": respiración y balanceo muy leves cuando está quieto
  const breath = Math.sin((f / 48) * Math.PI * 2);
  const sway = noise(f, 2) * still;

  const face: FacePose = offsetTrack(f, FACE_KEYS, FACE_GROUPS);
  const chew = f > 100 && f < 130 ? 0.16 * Math.sin(f * 0.38) * smooth((f - 100) / 6) * (1 - smooth((f - 124) / 6)) : 0;
  face.mouthSkew += chew;
  face.lookX = track(f, LX);
  face.lookY = track(f, LY);
  // la pupila se dilata cuando "hace clic"
  face.pupil *= 1 + 0.12 * smooth((f - 222) / 4) * (1 - smooth((f - 230) / 2));

  // la cabeza acompaña a los ojos con retraso
  const gxLate = track(f - 4, LX);
  const gyLate = track(f - 4, LY);

  let p: Pose = {
    ...base,
    lean: lean(f) + sway * 0.7,
    squash: squash(f) * (1 + 0.007 * breath * still),
    hop: hop(f),
    bodyTurn: bodyTurn(f),
    headTurn: headTurn(f) + 0.05 * gxLate,
    headTilt: headTilt(f) + 3.5 * gyLate + noise(f, 7) * 1.2 * still,
    shrug: shrug(f) + 0.06 * (breath + 1) * 0.5 * still,
    face,
    blink: blink(f, BLINKS),
    hairLag: extra.hairLag,
    legFront: leg({
      hip: track(f, [[0, -3], [80, -3], [92, -6], [246, -6], [252, -3], [255, -8], [259, 30], [264, 20], [273, 20], [282, -5]]) + 8 * c,
      knee: track(f, [[0, 4], [80, 4], [92, 12], [246, 12], [252, 4], [257, 50], [261, 20], [264, 6], [273, 6], [277, 28], [282, 4]]) + 20 * c,
      foot: track(f, [[0, 0], [255, 0], [259, -14], [264, 0]]),
    }),
    legBack: leg({
      hip: track(f, [[0, 4], [80, 4], [92, 6], [252, 6], [258, -6], [264, -16], [272, -12], [278, -12], [287, 6]]) + 8 * c,
      knee: track(f, [[0, 4], [256, 4], [262, 14], [268, 8], [278, 8], [282, 26], [287, 6]]) + 20 * c,
      foot: track(f, [[0, 0], [258, 0], [262, 14], [270, 6], [280, 6], [287, 0]]),
    }),
    armFront: arm({
      shoulder: track(f, [
        [0, 4], [139, 4], [143, 16], [149, 26], [178, 10], [186, 6], [229, 6], [231, 0], [235, 64, ease.overshoot],
        [242, 54], [250, 8],
      ]),
      elbow: track(f, [
        [0, 14], [139, 14], [143, 96], [149, 120], [178, 30], [186, 16], [229, 16], [231, 28], [235, 92, ease.overshoot],
        [242, 82], [250, 18],
      ]),
      wrist: 0,
      wristDrag: extra.dragF,
      hand: shapeAt(f, FRONT_HAND),
      ik: {
        ...frontTarget(f),
        bend: 1,
        weight: track(f, [
          [0, 0], [88, 0], [101, 1], [138, 1], [146, 0], [149, 0], [156, 1, ease.out], [176, 1], [186, 0],
          [250, 0], [262, 1, ease.out],
        ]),
      },
      aim: { ...M_POINT, weight: track(f, [[0, 0], [150, 0], [155, 1], [178, 1], [184, 0]]) },
    }),
    armBack: arm({
      shoulder: track(f, [
        [0, -2], [140, -2], [150, -22, ease.out], [176, -14], [188, -2], [229, -2], [231, -8], [235, 54, ease.overshoot],
        [242, 46], [250, -2], [284, -2], [292, 30, ease.out], [300, 28],
      ]),
      elbow: track(f, [
        [0, 14], [140, 14], [150, 36, ease.out], [176, 28], [188, 14], [229, 14], [231, 20], [235, 86, ease.overshoot],
        [242, 78], [250, 16], [284, 16], [292, 122, ease.out], [300, 116],
      ]),
      wrist: f >= 286 ? -12 : 0,
      wristDrag: extra.dragB,
      hand: shapeAt(f, BACK_HAND),
      ik: { x: 56, y: -44, space: "hip", bend: -1, weight: track(f, [[0, 0], [86, 0], [99, 1], [138, 1], [148, 0]]) },
    }),
  };
  p = withWalkV2(p, phase, amp, ww);
  return p;
};

/* ------------------------------ cámara ------------------------------ */

export type Cam = { x: number; y: number; zoom: number };

/* ------------------------------ caché ------------------------------ */

export type Timeline = {
  poses: Pose[];
  rigs: Rig[];
  head: Vec[]; // cabeza en escena (suavizada)
  eyes: Vec[];
  palm: Vec[];
  heldTilt: number[];
  mTagRot: number[];
  camFollowX: number[];
};

let cache: Timeline | null = null;

export const getTimeline = (): Timeline => {
  if (cache) return cache;

  // fase de caminata integrada a partir de la velocidad (los pies no patinan)
  const phase: number[] = [];
  const amp: number[] = [];
  const ww: number[] = [];
  let ph = 0.62;
  for (let f = 0; f < N; f++) {
    const v = f < 70 ? Math.max(0, rootX(f) - rootX(f - 1)) : 0;
    const a = clamp(v / 19, 0, 1);
    ph += v / S / (STRIDE * Math.max(a, 0.3));
    phase.push(ph);
    amp.push(a);
    ww.push(f < 70 ? smooth(a / 0.35) : 0);
  }
  const zero: Extra = { hairLag: 0, dragF: 0, dragB: 0 };

  // pasada 1
  const p1: Pose[] = [];
  const r1: Rig[] = [];
  for (let f = 0; f < N; f++) {
    const p = buildPose(f, phase[f], amp[f], ww[f], zero);
    p1.push(p);
    r1.push(computeRig(p));
  }

  // simulaciones de movimiento secundario
  const headAng = r1.map((r) => r.headAngle);
  const ground = r1.map((r) => r.ground);
  const sHead = springSeries(headAng, 0.16, 0.7);
  const sGround = springSeries(ground, 0.2, 0.68);
  const hair = headAng.map((a, f) => 2.2 * (sHead[f] - a) - 1.6 * (sGround[f] - ground[f]) - 9 * ww[f]);

  const gateF = (f: number) => (f >= 92 && f < 140) || (f >= 150 && f < 184) || f >= 250 ? 0.2 : 1;
  const gateB = (f: number) => (f >= 90 && f < 142 ? 0.2 : 1);
  const hF = r1.map((r) => r.front.handAng);
  const hB = r1.map((r) => r.back.handAng);
  const sF = springSeries(hF, 0.22, 0.62);
  const sB = springSeries(hB, 0.22, 0.62);
  const dragF = hF.map((a, f) => clamp((sF[f] - a) * 0.75, -24, 24) * gateF(f));
  const dragB = hB.map((a, f) => clamp((sB[f] - a) * 0.75, -24, 24) * gateB(f));

  // pasada 2
  const poses: Pose[] = [];
  const rigs: Rig[] = [];
  for (let f = 0; f < N; f++) {
    const p = buildPose(f, phase[f], amp[f], ww[f], { hairLag: hair[f], dragF: dragF[f], dragB: dragB[f] });
    poses.push(p);
    rigs.push(computeRig(p));
  }

  const rawHead = rigs.map((r, f) => localToScene(poses[f], r.headCenter));
  const sx = springSeries(rawHead.map((h) => h.x), 0.22, 0.62);
  const sy = springSeries(rawHead.map((h) => h.y), 0.22, 0.62);
  const head = rawHead.map((_, f) => ({ x: sx[f], y: sy[f] }));
  const eyes = head.map((h, f) => ({ x: h.x + poses[f].headTurn * 22 * S, y: h.y - 2 * S }));
  const palm = rigs.map((r, f) => localToScene(poses[f], r.front.palm));
  const pxs = palm.map((p) => p.x);
  const spx = springSeries(pxs, 0.2, 0.65);
  const pys = palm.map((p) => p.y);
  const spy = springSeries(pys, 0.2, 0.65);
  const heldTilt = pxs.map((x, f) => clamp((spx[f] - x) * 0.22 - (spy[f] - pys[f]) * 0.05, -14, 14));

  // cartel del señuelo: al soltarse un hilo, cae y oscila como un péndulo
  const tagTarget = Array.from({ length: N }, (_, f) => (f < GRAB + 6 ? 0 : 74));
  const mTagRot = springSeries(tagTarget, 0.07, 0.86).map((r, f) => r + wobble(f, 136, -14, 0.6, 5));

  const camFollowX = springSeries(
    Array.from({ length: N }, (_, f) => rootX(f) + 170),
    0.06,
    0.84,
  );

  cache = { poses, rigs, head, eyes, palm, heldTilt, mTagRot, camFollowX };
  return cache;
};

export type { EaseFn };
