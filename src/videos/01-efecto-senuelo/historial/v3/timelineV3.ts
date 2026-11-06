import { Easing } from "remotion";
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
} from "../../../../canal/personaje/anim";
import { arm, FACES, FACES_V2, leg, standing } from "../../../../canal/personaje/presets";
import {
  computeRig,
  DIM,
  localToScene,
  rotP,
  type FacePose,
  type HandShape,
  type Pose,
  type Rig,
  type Vec,
} from "../../../../canal/personaje/rig";
import { COUNTER_TOP, FLOOR } from "../../../../canal/escenarios/cafeteria/CafeV2";

/**
 * Línea de tiempo V3.
 * Novedades respecto de la V2:
 *  - Pies plantados con IK: un planificador de pasos fija cada pie en el piso mientras soporta peso
 *    (rueda talón → planta → punta) y la cadera sube y baja según el alcance real de las piernas.
 *  - Balanceo de brazos derivado de la posición de los pies, con retraso (follow-through).
 *  - Agarre con anclaje compartido: el vaso es la referencia; la muñeca (IK) y la mano se ubican
 *    en el sistema de coordenadas del vaso, así nunca se desalinean.
 *  - Expresiones filtradas con un resorte: no hay saltos de un fotograma a otro.
 */

export const N = 300;
export const S = 1.5;
const X0 = -160;
export const XSTOP = 830;
const XSTEP = 915;
export const GRAB = 264;

export const CUP_H = { L: 185, M: 155, S: 120 };

/* ---------------------------- geometría del vaso grande ---------------------------- */

const L_BODY = CUP_H.L * 0.86;
const L_BOT = CUP_H.L * 0.26;
const L_TOP = CUP_H.L * 0.36;
/** altura del agarre (desde la base) y semiancho del vaso a esa altura */
export const GRIP_Y = -0.45 * L_BODY;
export const GRIP_HALF = L_BOT + (L_TOP - L_BOT) * 0.45;
/** muñeca en coordenadas del vaso: a la izquierda del borde, a la altura del agarre */
export const WRIST_IN_CUP: Vec = { x: -GRIP_HALF - 25, y: GRIP_Y + 3 };

/* ---------------------------- objetos ---------------------------- */

export const cupL = (f: number) => track(f, [[0, 1130], [122, 1130], [134, 1100, ease.out]]);
export const cupS = (f: number) => track(f, [[0, 1400], [122, 1400], [134, 1430, ease.out]]);
export const cupMx = (f: number) => 1270 + track(f, [[GRAB + 2, 0], [GRAB + 16, 34, ease.out]]);
export const cupMdrop = (f: number) => track(f, [[124, -950], [132, 0, ease.in]]);
export const cupMsy = (f: number) =>
  track(f, [[131, 1], [133, 0.72, ease.out], [137, 1.12], [142, 0.96], [147, 1]]);
const M_POINT = { x: 1270, y: 1150 };

/* ------------------------------ tiempos ------------------------------ */

const decel = Easing.bezier(0.4, 0.58, 0.55, 1);
export const rootX = (f: number) =>
  track(f, [[0, X0], [34, 486, ease.linear], [60, XSTOP, decel], [252, XSTOP], [262, XSTEP, ease.inOut]]);

const lean = (f: number) =>
  track(f, [
    [0, 0], [34, 0], [52, 1.5], [60, 6, ease.out], [68, -2.5], [76, 0.8], [84, 0], [92, -2.5], [130, -3],
    [134, -4.5], [138, -5.5], [148, -2], [156, 6, ease.out], [170, 4.5], [188, 6], [226, 6], [230, 5],
    [233, 7], [237, -6, ease.out], [246, -1], [250, -3.5], [258, 6], [264, 9], [268, 7], [280, -1.5], [300, -2],
  ]);
const squash = (f: number) =>
  track(f, [
    [0, 1], [58, 1], [61, 0.965], [68, 1.01], [74, 1], [133, 1], [135, 0.97], [140, 1], [150, 0.975],
    [156, 1.025], [162, 1], [231, 1], [233, 0.93], [237, 1.07, ease.out], [243, 0.985], [248, 1],
    [262, 1], [264, 0.975], [269, 1],
  ]);
const hop = (f: number) => track(f, [[0, 0], [233, 0], [237, 14, ease.out], [242, 0, ease.in]]);
/** agacharse (en unidades locales de cadera) */
const crouch = (f: number) =>
  track(f, [[0, 0], [57, 0], [61, 10], [68, 0], [231, 0], [233.5, 20], [236, 0, ease.out], [258, 0], [264, 8], [272, 2], [300, 2]]);
const shrug = (f: number) =>
  track(f, [
    [0, 0], [86, 0], [98, 0.22], [132, 0.22], [134, 0.5, ease.out], [142, 0.08], [150, 0], [286, 0],
    [293, 0.9, ease.out], [299, 0.6], [300, 0.6],
  ]);
const bodyTurn = (f: number) => track(f, [[0, 1], [272, 1], [288, 0.3]]);
const headTurn = (f: number) =>
  track(f, [
    [0, 1], [96, 1], [107, 0.42], [134, 0.42], [137, 0.32], [146, 1.04, ease.out], [152, 1], [232, 1],
    [237, 0.75, ease.out], [248, 0.92], [256, 1], [274, 1], [289, 0.05],
  ]);
const headTilt = (f: number) =>
  track(f, [
    [0, -2], [22, -2], [27, 4], [32, 0], [36, -1], [38, -3.5], [44, 7, ease.out], [50, 5.5], [62, 6.5], [70, 5],
    [76, 3], [80, 5], [88, 3], [104, -8.5], [120, -10.5], [134, -6], [137, -12], [146, 8, ease.out], [154, 5],
    [188, 8], [226, 8], [229, 9], [233, 11], [237, -10, ease.out], [246, -3], [249, 6], [253, -1],
    [258, 8], [270, 4], [286, -3], [294, -7.5], [300, -7],
  ]);

/* ------------------------------ mirada ------------------------------ */

const LOOK: Record<string, [number, number]> = {
  fwd: [0.85, 0.1],
  glance: [0.8, 0.5],
  L: [0.6, 0.7],
  M: [1, 0.38],
  S: [1, 0.3],
  think: [-0.5, -0.75],
  think2: [-0.15, -0.85],
  tagM: [1, 0.62],
  tagL: [0.62, 0.85],
  held: [0.35, 0.5],
  camFront: [-0.05, 0],
};
const GAZE: [number, string][] = [
  [0, "fwd"], [22, "glance"], [32, "fwd"], [40, "L"], [64, "L"], [74, "S"], [84, "L"], [94, "L"],
  [100, "think"], [112, "think2"], [124, "think2"], [134, "M"], [188, "M"], [197, "L"], [205, "M"],
  [212, "tagL"], [218, "tagM"], [222, "tagL"], [226, "tagM"], [240, "tagM"], [243, "L"],
  [264, "L"], [268, "held"], [279, "held"], [282, "M"], [287, "M"], [290, "camFront"],
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

// versiones un poco más contenidas de la sorpresa y la alegría (que no parezca involuntariamente exagerado)
const SURPRISE: FacePose = { ...FACES.surprise, eyeScale: 1.2, pupil: 0.78, mouthOpen: 0.78, browLiftL: 1.05, browLiftR: 1.05 };
const DELIGHT: FacePose = { ...FACES_V2.delighted, mouthOpen: 0.42, mouthWidth: 1.18 };
const CURIOUS: FacePose = { ...FACES_V2.aha, mouthOpen: 0.25, smile: 0.35 };

const FACE_KEYS: PoseKey<FacePose>[] = [
  [0, FACES_V2.stroll], [22, FACES_V2.stroll], [27, FACES_V2.notice], [34, FACES_V2.stroll],
  [40, FACES_V2.notice], [54, FACES_V2.notice], [66, FACES.curious], [82, FACES_V2.weigh],
  [100, FACES_V2.hmm], [133, FACES_V2.hmm], [138, FACES_V2.startle, ease.out], [142, FACES_V2.startle],
  [151, CURIOUS], [168, FACES.interested], [182, FACES.interested], [194, FACES_V2.compare],
  [224, FACES_V2.compare], [230, FACES_V2.realize], [233, FACES.anticipation], [237, SURPRISE, ease.out],
  [242, SURPRISE], [250, DELIGHT], [257, FACES.determined], [264, FACES.determined],
  [273, FACES_V2.satisfied], [281, FACES_V2.satisfied], [286, FACES_V2.suspicious], [292, FACES.ironic],
  [300, FACES.ironic],
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
const BLINKS = [18, 58, 97, 113, 138, 145, 201, 252, 275, 289];

/* ------------------------------ manos ------------------------------ */

type HandState = { hand: HandShape; handNext?: HandShape; handMix?: number };
/** cambio de forma de mano con un fundido de 3 fotogramas centrado en el cambio */
const handAt = (f: number, list: [number, HandShape][], span = 3): HandState => {
  let i = 0;
  while (i + 1 < list.length && f >= list[i + 1][0] - span / 2) i++;
  const cur = list[i][1];
  const next = list[i + 1];
  if (next && f >= next[0] - span / 2) {
    return { hand: cur, handNext: next[1], handMix: smooth((f - (next[0] - span / 2)) / span) };
  }
  if (i > 0 && f < list[i][0] + span / 2) {
    return { hand: list[i - 1][1], handNext: cur, handMix: smooth((f - (list[i][0] - span / 2)) / span) };
  }
  return { hand: cur };
};
const FRONT_HAND: [number, HandShape][] = [
  [0, "relaxed"], [94, "chin"], [140, "relaxed"], [146, "fist"], [152, "point"], [181, "relaxed"],
  [234, "open"], [247, "relaxed"], [253, "reach"], [GRAB, "none"],
];
const BACK_HAND: [number, HandShape][] = [
  [0, "relaxed"], [90, "fist"], [142, "open"], [160, "relaxed"], [234, "open"], [247, "relaxed"], [288, "open"],
];

/* ---------------------------- vaso en la mano ---------------------------- */

/** trayectoria de la base del vaso grande (sistema de referencia compartido con la mano) */
const cupPathKeys: PathKey[] = [
  [GRAB, { x: 1100, y: COUNTER_TOP }],
  [GRAB + 5, { x: 1093, y: COUNTER_TOP - 16 }, ease.out], // primero se despega del mostrador
  [GRAB + 16, (fr) => ({ x: rootX(fr) + 80, y: 1288 }), ease.inOut, 18],
  [290, (fr) => ({ x: rootX(fr) + 84, y: 1278 }), ease.inOut],
  [300, (fr) => ({ x: rootX(fr) + 84, y: 1280 })],
];
const cupBase = (f: number): Vec => (f < GRAB ? { x: cupL(f), y: COUNTER_TOP } : pathTrack(f, cupPathKeys));

/* --------------------------- planificador de pasos --------------------------- */

type Foot = "F" | "B";
type Step = { foot: Foot; lift: number; land: number; from: number; to: number; height: number };
const ANKLE_Y = FLOOR - DIM.sole * S;
const HIP_OFF = { F: -10 * S, B: 14 * S }; // articulación de la cadera (de perfil)
const TOE: Vec = { x: 50, y: 24 }; // punta del zapato respecto del tobillo (local)
const HEEL: Vec = { x: -18, y: 22 };

const planSteps = (): { steps: Step[]; start: Record<Foot, number> } => {
  const speed = (t: number) => rootX(t + 0.5) - rootX(t - 0.5);
  const stride = (t: number) => lerp(95, 215, clamp(speed(t) / 19, 0, 1));
  const contacts: number[] = [0];
  for (;;) {
    const c = contacts[contacts.length - 1];
    const D = stride(c);
    let t = c + 0.25;
    while (t < 60 && rootX(t) - rootX(c) < D) t += 0.25;
    if (t >= 56) break;
    contacts.push(t);
  }
  const footOf = (k: number): Foot => (k % 2 === 0 ? "F" : "B");
  const landX = (k: number) => rootX(contacts[k]) + stride(contacts[k]) / 2 + HIP_OFF[footOf(k)];
  const start: Record<Foot, number> = {
    F: landX(0),
    B: rootX(0) - stride(0) / 2 + HIP_OFF.B,
  };
  const last: Record<Foot, number> = { ...start };
  const steps: Step[] = [];
  for (let k = 1; k < contacts.length; k++) {
    const foot = footOf(k);
    const to = landX(k);
    steps.push({ foot, lift: contacts[k - 1] + 2, land: contacts[k], from: last[foot], to, height: 30 });
    last[foot] = to;
  }
  // los dos pasos finales: frena y cierra la postura
  const stance: Record<Foot, number> = { F: XSTOP - 26, B: XSTOP + 36 };
  const lastC = contacts[contacts.length - 1];
  const nextFoot = footOf(contacts.length);
  const lastFoot = footOf(contacts.length - 1);
  const t1 = Math.max(lastC + 9, 57);
  steps.push({ foot: nextFoot, lift: lastC + 2, land: t1, from: last[nextFoot], to: stance[nextFoot], height: 22 });
  last[nextFoot] = stance[nextFoot];
  if (Math.abs(last[lastFoot] - stance[lastFoot]) > 10) {
    steps.push({ foot: lastFoot, lift: t1 + 1, land: t1 + 9, from: last[lastFoot], to: stance[lastFoot], height: 14 });
    last[lastFoot] = stance[lastFoot];
  }
  // paso hacia el vaso y reacomodo al girar hacia cámara
  steps.push({ foot: "F", lift: 252, land: 260, from: last.F, to: XSTEP + 44, height: 15 });
  steps.push({ foot: "F", lift: 275, land: 282, from: XSTEP + 44, to: XSTEP - 30, height: 9 });
  steps.push({ foot: "B", lift: 282, land: 289, from: last.B, to: XSTEP + 33, height: 9 });
  return { steps, start };
};

/** posición del tobillo y ángulo del pie: rueda sobre la punta al despegar y sobre el talón al apoyar */
const footState = (foot: Foot, f: number, plan: ReturnType<typeof planSteps>) => {
  const mine = plan.steps.filter((s) => s.foot === foot);
  const flatAt = (x: number): Vec => ({ x, y: ANKLE_Y });
  const toePivot = (x: number, ang: number): Vec => {
    // el pie gira alrededor de la punta: la punta queda fija en el piso
    const toe = { x: x + TOE.x * S, y: ANKLE_Y + TOE.y * S };
    const r = rotP({ x: TOE.x, y: TOE.y - 4 }, ang);
    return { x: toe.x - (r.x) * S, y: toe.y - (r.y + 4) * S };
  };
  const heelPivot = (x: number, ang: number): Vec => {
    const heel = { x: x + HEEL.x * S, y: ANKLE_Y + HEEL.y * S };
    const r = rotP({ x: HEEL.x, y: HEEL.y - 4 }, ang);
    return { x: heel.x - r.x * S, y: heel.y - (r.y + 4) * S };
  };
  const TOE_OFF = 24;
  const STRIKE = -12;
  let planted = plan.start[foot];
  for (const s of mine) {
    if (f < s.lift - 4) return { pos: flatAt(planted), angle: 0, swing: false };
    if (f < s.lift) {
      const a = TOE_OFF * smooth((f - (s.lift - 4)) / 4);
      return { pos: toePivot(planted, a), angle: a, swing: false };
    }
    if (f <= s.land) {
      const t = (f - s.lift) / Math.max(1, s.land - s.lift);
      const e = ease.inOut(t);
      const a0 = toePivot(s.from, TOE_OFF);
      const a1 = heelPivot(s.to, STRIKE);
      const h = s.height * S * Math.pow(Math.sin(Math.PI * t), 0.9);
      const angle = lerp(TOE_OFF, STRIKE, ease.inOut(clamp(t * 1.15, 0, 1)));
      return { pos: { x: lerp(a0.x, a1.x, e), y: lerp(a0.y, a1.y, e) - h }, angle, swing: true };
    }
    if (f < s.land + 3) {
      const a = STRIKE * (1 - smooth((f - s.land) / 3));
      return { pos: heelPivot(s.to, a), angle: a, swing: false };
    }
    planted = s.to;
  }
  return { pos: flatAt(planted), angle: 0, swing: false };
};

/* --------------------------- pose por fotograma --------------------------- */

type Extra = { hairLag: number; dragF: number; dragB: number; armSwing: number; armLag: number; face?: FacePose };

const frontTarget = (f: number, tiltAt: (f: number) => number) => {
  if (f < 146) {
    const tap = -5 * Math.exp(-(((f - 108) / 2.2) ** 2)) - 5 * Math.exp(-(((f - 117) / 2.2) ** 2));
    return { space: "chin" as const, x: -2, y: 17 + tap };
  }
  if (f < 248) {
    const jab = wobble(f, 162, -12, 0.75, 5) + wobble(f, 171, -8, 0.75, 5);
    return { space: "scene" as const, x: M_POINT.x, y: 950 + jab };
  }
  const wristOf = (fr: number) => {
    const c = cupBase(fr);
    const w = rotP(WRIST_IN_CUP, tiltAt(fr));
    return { x: c.x + w.x, y: c.y + w.y };
  };
  if (f < GRAB) {
    const g = wristOf(GRAB);
    // aproximación en arco: sube un poco (anticipación), avanza y frena antes del contacto
    const p = pathTrack(f, [
      [248, { x: g.x - 95, y: g.y + 40 }],
      [254, { x: g.x - 70, y: g.y - 46 }, ease.inOut, 10],
      [261, { x: g.x - 12, y: g.y - 8 }, ease.inOut, -14],
      [GRAB, g, ease.out],
    ]);
    return { space: "scene" as const, ...p };
  }
  return { space: "scene" as const, ...wristOf(f) };
};

const buildPose = (
  f: number,
  plan: ReturnType<typeof planSteps>,
  ww: number,
  extra: Extra,
  tiltAt: (f: number) => number,
): Pose => {
  const base = standing(rootX(f), FLOOR, S);
  const still = 1 - ww;
  const breath = Math.sin((f / 48) * Math.PI * 2);

  let face: FacePose;
  if (extra.face) {
    face = { ...extra.face };
  } else {
    face = offsetTrack(f, FACE_KEYS, FACE_GROUPS);
    // "morderse el labio" mientras duda
    face.mouthSkew += f > 100 && f < 130 ? 0.16 * Math.sin(f * 0.38) * smooth((f - 100) / 6) * (1 - smooth((f - 124) / 6)) : 0;
  }
  face.lookX = track(f, LX);
  face.lookY = track(f, LY);

  const gxLate = track(f - 4, LX);
  const gyLate = track(f - 4, LY);

  const fs = footState("F", f, plan);
  const bs = footState("B", f, plan);
  const ft = frontTarget(f, tiltAt);
  const fh = handAt(f, FRONT_HAND);
  const bh = handAt(f, BACK_HAND);

  // balanceo de brazos derivado de los pies (+ retraso para el antebrazo y la muñeca)
  const swing = extra.armSwing * ww;
  const lag = extra.armLag * ww;

  const p: Pose = {
    ...base,
    lean: lean(f) + ww * 4.5 + 0.5 * Math.sin(f * 0.045) * still,
    squash: squash(f) * (1 + 0.006 * breath * still),
    hop: hop(f),
    bodyTurn: bodyTurn(f) + 0.06 * swing,
    headTurn: headTurn(f) + 0.05 * gxLate,
    headTilt: headTilt(f) + 3.5 * gyLate + 0.8 * Math.sin(f * 0.06 + 1) * still,
    shrug: shrug(f) + 0.05 * (breath + 1) * 0.5 * still,
    face,
    blink: blink(f, BLINKS),
    hairLag: extra.hairLag,
    hipHeight: 0, // se calcula en getTimeline
    legFront: leg({ ik: fs.pos, foot: fs.angle }),
    legBack: leg({ ik: bs.pos, foot: bs.angle }),
    armFront: arm({
      shoulder:
        track(f, [
          [0, 4], [140, 4], [144, 16], [149, 26], [178, 10], [186, 6], [231, 6], [233, 0], [237, 58, ease.overshoot],
          [244, 50], [250, 8],
        ]) - 24 * swing,
      elbow:
        track(f, [
          [0, 14], [140, 14], [144, 92], [149, 118], [178, 30], [186, 16], [231, 16], [233, 26], [237, 86, ease.overshoot],
          [244, 76], [250, 18],
        ]) + 10 * Math.max(0, -swing) + 14 * (lag - swing),
      wrist: 0,
      wristDrag: extra.dragF + 10 * (lag - swing),
      ...fh,
      ik: {
        ...ft,
        bend: 1,
        weight: track(f, [
          [0, 0], [88, 0], [101, 1], [139, 1], [146, 0], [149, 0], [156, 1, ease.out], [176, 1], [186, 0],
          [248, 0], [256, 1, ease.inOut],
        ]),
      },
      aim: {
        ...(f < 220 ? M_POINT : { x: cupBase(GRAB).x, y: COUNTER_TOP + GRIP_Y }),
        weight: track(f, [[0, 0], [150, 0], [155, 1], [178, 1], [184, 0], [252, 0], [258, 1], [GRAB, 1], [GRAB + 1, 0]]),
      },
    }),
    armBack: arm({
      shoulder:
        track(f, [
          [0, -2], [140, -2], [150, -20, ease.out], [176, -13], [188, -2], [231, -2], [233, -8], [237, 50, ease.overshoot],
          [244, 42], [250, -2], [286, -2], [294, 30, ease.out], [300, 28],
        ]) + 24 * swing,
      elbow:
        track(f, [
          [0, 14], [140, 14], [150, 34, ease.out], [176, 26], [188, 14], [231, 14], [233, 20], [237, 82, ease.overshoot],
          [244, 74], [250, 16], [286, 16], [294, 120, ease.out], [300, 114],
        ]) + 10 * Math.max(0, swing) + 14 * (swing - lag),
      wrist: f >= 288 ? -12 : 0,
      wristDrag: extra.dragB + 10 * (swing - lag),
      ...bh,
      ik: { x: 56, y: -44, space: "hip", bend: -1, weight: track(f, [[0, 0], [86, 0], [99, 1], [138, 1], [148, 0]]) },
    }),
  };
  return p;
};

/* -------------------------------- caché -------------------------------- */

export type Cam = { x: number; y: number; zoom: number };

export type Timeline = {
  poses: Pose[];
  rigs: Rig[];
  head: Vec[];
  cup: Vec[]; // base del vaso grande
  cupTilt: number[];
  wristTarget: Vec[];
  mTagRot: number[];
  camFollowX: number[];
};

let cache: Timeline | null = null;

const LEG = DIM.thigh + DIM.shin;

export const getTimeline = (): Timeline => {
  if (cache) return cache;
  const plan = planSteps();

  // peso de la caminata (solo en la entrada)
  const ww = Array.from({ length: N }, (_, f) => (f < 70 ? smooth(clamp((rootX(f + 0.5) - rootX(f - 0.5)) / 19, 0, 1) / 0.35) : 0));

  // balanceo de brazos: qué pie va adelante (normalizado) + versión retrasada
  const swingRaw = Array.from({ length: N }, (_, f) => {
    const a = footState("F", f, plan).pos.x;
    const b = footState("B", f, plan).pos.x;
    return clamp((a - b + (HIP_OFF.B - HIP_OFF.F)) / 215, -1, 1);
  });
  const swingS = springSeries(swingRaw, 0.3, 0.6);
  const swingLag = springSeries(swingRaw, 0.12, 0.7);

  // inclinación del vaso en la mano (inercia), calculada sobre su trayectoria
  const cupPos = Array.from({ length: N }, (_, f) => cupBase(f));
  const sCx = springSeries(cupPos.map((c) => c.x), 0.2, 0.65);
  const sCy = springSeries(cupPos.map((c) => c.y), 0.2, 0.65);
  const cupTilt = cupPos.map((c, f) => (f < GRAB ? 0 : clamp((sCx[f] - c.x) * 0.16 - (sCy[f] - c.y) * 0.04, -7, 7)));
  const tiltAt = (fr: number) => cupTilt[clamp(Math.round(fr), 0, N - 1)];

  // altura de la cadera: la máxima que permiten ambas piernas (nunca estiradas del todo)
  const hipH = Array.from({ length: N }, (_, f) => {
    const turn = bodyTurn(f);
    const hips = { F: rootX(f) + lerp(-24, -10, turn) * S, B: rootX(f) + lerp(24, 14, turn) * S };
    const k = lerp(0.993, 0.982, ww[f]);
    let h = LEG * 0.996 + DIM.sole;
    for (const foot of ["F", "B"] as Foot[]) {
      const a = footState(foot, f, plan).pos;
      const dx = (a.x - hips[foot]) / S;
      const reach = Math.sqrt(Math.max(0, (LEG * k) ** 2 - dx * dx));
      h = Math.min(h, reach + (FLOOR - a.y) / S);
    }
    return h - crouch(f);
  });
  // suavizado que nunca supera el límite (evita que la IK estire de más)
  const hipS = hipH.map((h, f) => Math.min(h, (hipH[Math.max(0, f - 1)] + h + hipH[Math.min(N - 1, f + 1)]) / 3));

  const zero: Extra = { hairLag: 0, dragF: 0, dragB: 0, armSwing: 0, armLag: 0 };

  // pasada 1
  const p1 = Array.from({ length: N }, (_, f) => {
    const p = buildPose(f, plan, ww[f], { ...zero, armSwing: swingS[f], armLag: swingLag[f] }, tiltAt);
    p.hipHeight = hipS[f];
    return p;
  });
  const r1 = p1.map((p) => computeRig(p));

  // expresión filtrada con un resorte (sin saltos), excepto la mirada
  const faces = p1.map((p) => ({ ...p.face }));
  for (const k of SMOOTHED) {
    const brow = k.indexOf("brow") === 0;
    const s = springSeries(faces.map((fc) => fc[k]), brow ? 0.2 : 0.3, brow ? 0.62 : 0.58);
    faces.forEach((fc, i) => (fc[k] = s[i]));
  }

  // movimiento secundario
  const headAng = r1.map((r) => r.headAngle);
  const ground = r1.map((r) => r.ground);
  const sHead = springSeries(headAng, 0.16, 0.7);
  const sGround = springSeries(ground, 0.2, 0.68);
  const hair = headAng.map((a, f) => 2.2 * (sHead[f] - a) - 1.6 * (sGround[f] - ground[f]) - 8 * ww[f]);
  const gateF = (f: number) => (f >= 92 && f < 140) || (f >= 150 && f < 184) || f >= 248 ? 0.15 : 1;
  const gateB = (f: number) => (f >= 90 && f < 142 ? 0.15 : 1);
  const hF = r1.map((r) => r.front.handAng);
  const hB = r1.map((r) => r.back.handAng);
  const sF = springSeries(hF, 0.22, 0.62);
  const sB = springSeries(hB, 0.22, 0.62);
  const dragF = hF.map((a, f) => clamp((sF[f] - a) * 0.7, -22, 22) * gateF(f));
  const dragB = hB.map((a, f) => clamp((sB[f] - a) * 0.7, -22, 22) * gateB(f));

  // pasada 2
  const poses = Array.from({ length: N }, (_, f) => {
    const p = buildPose(
      f,
      plan,
      ww[f],
      { hairLag: hair[f], dragF: dragF[f], dragB: dragB[f], armSwing: swingS[f], armLag: swingLag[f], face: faces[f] },
      tiltAt,
    );
    p.hipHeight = hipS[f];
    return p;
  });
  const rigs = poses.map((p) => computeRig(p));

  const rawHead = rigs.map((r, f) => localToScene(poses[f], r.headCenter));
  const hx = springSeries(rawHead.map((h) => h.x), 0.22, 0.62);
  const hy = springSeries(rawHead.map((h) => h.y), 0.22, 0.62);
  const head = rawHead.map((_, f) => ({ x: hx[f], y: hy[f] }));

  const wristTarget = Array.from({ length: N }, (_, f) => {
    const ft = frontTarget(f, tiltAt);
    return { x: ft.x, y: ft.y };
  });

  const tagTarget = Array.from({ length: N }, (_, f) => (f < GRAB + 6 ? 0 : 74));
  const mTagRot = springSeries(tagTarget, 0.07, 0.86).map((r, f) => r + wobble(f, 136, -14, 0.6, 5));
  const camFollowX = springSeries(Array.from({ length: N }, (_, f) => rootX(f) + 170), 0.06, 0.84);

  cache = { poses, rigs, head, cup: cupPos, cupTilt, wristTarget, mTagRot, camFollowX };
  return cache;
};

/** Métricas extra para la herramienta de diagnóstico. */
export const diagnosticsExtra = (): {
  grab?: { from: number; to: number; target: (f: number) => Vec; hand: (f: number) => Vec };
  cupBottom?: { from: number; to: number; y: (f: number) => number; counter: number };
} => {
  const tl = getTimeline();
  return {
    grab: {
      from: 250,
      to: 298,
      target: (f) => tl.wristTarget[f],
      hand: (f) => localToScene(tl.poses[f], tl.rigs[f].front.wr),
    },
    cupBottom: { from: 256, to: 298, y: (f) => tl.cup[f].y, counter: COUNTER_TOP },
  };
};
