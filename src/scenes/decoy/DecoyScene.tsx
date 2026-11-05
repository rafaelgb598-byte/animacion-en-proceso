import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { blink, clamp, ease, follow, lerp, poseTrack, smooth, track, wobble, type EaseFn, type Key } from "../../character/anim";
import { Character } from "../../character/Character";
import { withWalk } from "../../character/motion";
import { arm, FACES, leg, standing } from "../../character/presets";
import { computeRig, localToScene, STRIDE, type FacePose, type HandShape, type Pose, type Vec } from "../../character/rig";
import { BackWall, Counter, COUNTER_TOP, Floor, FLOOR, Grade } from "./Cafe";
import { Cup, PriceTag } from "./Props";

/**
 * PRUEBA "EFECTO SEÑUELO" — 10 s, 30 fps, 1080×1920.
 *
 * 0–2 s  entra caminando y ve dos vasos (L $7 · S $3)
 * 2–4 s  se detiene, duda, mano al mentón
 * 4–6 s  cae el señuelo (M $6.50): cejas arriba, gira la cabeza y señala
 * 6–8 s  sus ojos van y vienen entre M y L → sorpresa
 * 8–10 s da un paso, agarra el grande; el mediano queda desplazado; mirada irónica a cámara
 */

export const DECOY_FRAMES = 300;
const W = 1080;
const H = 1920;
const S = 1.5; // escala del personaje en la escena
const X0 = -140;
const XSTOP = 860;
const GRAB = 262;

/* ------------------------------------------------------------------ */
/* Objetos                                                             */
/* ------------------------------------------------------------------ */

const CUP_H = { L: 190, M: 160, S: 125 };
const GRIP_L = CUP_H.L * 0.45;

const cupL = (f: number) => track(f, [[0, 1180], [122, 1180], [134, 1150, ease.out]]);
const cupS = (f: number) => track(f, [[0, 1480], [122, 1480], [134, 1510, ease.out]]);
const cupMx = (f: number) => 1330 + track(f, [[GRAB, 0], [GRAB + 16, 34, ease.out]]);
const cupMrecede = (f: number) => track(f, [[GRAB, 1], [GRAB + 16, 0.84, ease.out]]);
const cupMdrop = (f: number) => track(f, [[124, -900], [133, 0, ease.in]]);
const cupMsy = (f: number) =>
  track(f, [[132, 1], [134, 0.7, ease.out], [138, 1.16], [143, 0.94], [148, 1]]);

/* ------------------------------------------------------------------ */
/* Personaje: canales animados                                         */
/* ------------------------------------------------------------------ */

const rootX = (f: number) =>
  track(f, [[0, X0], [42, 700, ease.linear], [58, XSTOP, ease.decel], [244, XSTOP], [257, 950, ease.inOut]]);
const walkW = (f: number) => track(f, [[0, 1], [50, 1], [64, 0]]);
const walkPhase = (f: number) => (rootX(Math.min(f, 64)) - X0) / S / STRIDE + 0.03;

const lean = (f: number) =>
  track(f, [
    [0, 0], [50, 0], [58, 6, ease.out], [68, -3], [78, 0], [86, 0], [98, -3], [138, -3],
    [146, -6], [156, 6, ease.out], [170, 3], [218, 3], [223, 6], [228, -6, ease.out], [238, 0],
    [242, 0], [247, -4], [258, 9], [264, 8], [276, 2], [284, -2], [300, -2],
  ]);
const squash = (f: number) =>
  track(f, [
    [0, 1], [58, 1], [61, 0.96], [68, 1.01], [74, 1], [146, 1], [150, 0.97], [156, 1.03], [162, 1],
    [219, 1], [223, 0.92], [227, 1.08, ease.out], [233, 0.98], [238, 1], [256, 1], [258, 0.97], [263, 1],
  ]);
const hop = (f: number) => track(f, [[0, 0], [224, 0], [228, 16, ease.out], [233, 0, ease.in]]);
const crouch = (f: number) =>
  track(f, [[0, 0], [57, 0], [60, 0.45], [66, 0], [218, 0], [223, 1], [226, 0, ease.out]]);
const bodyTurn = (f: number) => track(f, [[0, 1], [268, 1], [284, 0.35]]);
const headTurn = (f: number) =>
  track(f, [
    [0, 1], [86, 1], [98, 0.35], [139, 0.35], [142, 0.25], [150, 1.05, ease.out], [156, 1],
    [221, 1], [228, 0.55, ease.out], [240, 0.9], [266, 1], [280, 0.05],
  ]);
const headTilt = (f: number) =>
  track(f, [
    [0, -2], [44, -2], [52, 6], [62, 6], [74, 4], [86, 2], [98, -10], [118, -7], [128, -9], [134, -4],
    [142, -12], [150, 8, ease.out], [158, 4], [184, 6], [188, 7], [199, 3], [207, 7], [214, 3],
    [219, 6], [223, 10], [228, -12, ease.out], [236, -4], [246, 0], [256, 8], [268, 4], [282, -8], [300, -7],
  ]);
const shrug = (f: number) =>
  track(f, [[0, 0], [86, 0], [98, 0.3], [136, 0.3], [146, 0], [278, 0], [286, 1, ease.out], [294, 0.55], [300, 0.6]]);

/** Mirada: saltos rápidos de ojos (sacadas) entre los objetos. */
const LOOK = {
  fwd: [0.8, 0.15],
  L: [0.75, 0.55],
  M: [1, 0.35],
  S: [1, 0.25],
  think: [-0.5, -0.75],
  think2: [-0.15, -0.85],
  cam: [-0.3, 0],
  camFront: [-0.05, 0],
  cup: [0.5, 0.25],
};
type LookName = keyof typeof LOOK;
const gaze: [number, LookName][] = [
  [0, "fwd"], [44, "L"], [66, "L"], [69, "S"], [80, "S"], [83, "L"], [92, "L"], [95, "think"],
  [110, "think"], [113, "think2"], [130, "think2"], [133, "M"], [184, "M"], [194, "L"], [203, "M"],
  [210, "L"], [215, "M"], [219, "L"], [222, "cam"], [240, "cam"], [243, "L"], [262, "L"], [266, "cup"],
  [276, "cup"], [279, "camFront"],
];
const gazeTrack = (axis: 0 | 1): Key[] => {
  const keys: Key[] = [];
  gaze.forEach(([fr, name], i) => {
    const v = LOOK[name][axis];
    const prev = i > 0 ? LOOK[gaze[i - 1][1]][axis] : v;
    if (i > 0 && prev !== v) keys.push([fr, v, ease.saccade]);
    else keys.push([fr, v]);
  });
  // la sacada dura 3 fotogramas: insertamos la clave de partida
  const out: Key[] = [];
  keys.forEach((k, i) => {
    if (i > 0 && k[2] === ease.saccade) out.push([k[0] - 3, keys[i - 1][1]]);
    out.push(k);
  });
  return out;
};
const LOOK_X = gazeTrack(0);
const LOOK_Y = gazeTrack(1);

const faceKeys: [number, FacePose, EaseFn?][] = [
  [0, FACES.neutral], [40, FACES.neutral], [50, FACES.curious], [84, FACES.curious],
  [98, FACES.doubt], [130, FACES.doubt], [134, FACES.alert, ease.out], [146, FACES.alert],
  [152, FACES.oh, ease.out], [166, FACES.interested], [180, FACES.interested], [188, FACES.scrutiny],
  [218, FACES.scrutiny], [222, FACES.anticipation], [226, FACES.surprise, ease.out], [233, FACES.surprise],
  [240, FACES.joy], [250, FACES.determined], [264, FACES.determined], [271, FACES.joy], [283, FACES.ironic],
  [300, FACES.ironic],
];
const BLINKS = [24, 76, 96, 141, 188, 245, 276, 293];

const frontHand = (f: number): HandShape =>
  f < 90 ? "relaxed" : f < 146 ? "chin" : f < 153 ? "fist" : f < 186 ? "point" : f < 222 ? "relaxed" : f < GRAB ? "open" : "hold";
const backHand = (f: number): HandShape =>
  f < 90 ? "relaxed" : f < 142 ? "fist" : f < 222 ? "relaxed" : f < 242 ? "open" : f < 278 ? "relaxed" : "open";

const gripPoint = (f: number): Vec => ({ x: cupL(f), y: COUNTER_TOP - GRIP_L });

/** Objetivo de la mano delantera (IK). */
const frontTarget = (f: number) => {
  if (f < 149) {
    const env = smooth((f - 100) / 6) * (1 - smooth((f - 124) / 6));
    return {
      space: "chin" as const,
      x: 4 + Math.sin((f - 100) * 0.55) * 4 * env,
      y: 6 + Math.sin((f - 100) * 0.55 + 1.2) * 6 * env,
    };
  }
  if (f < 246) {
    const jab = wobble(f, 158, -14, 0.6, 6);
    return { space: "scene" as const, x: 1330, y: 1110 + jab };
  }
  const g = gripPoint(f);
  const grip = { x: g.x - 18, y: g.y + 4 };
  const lifted = { x: 1005, y: 1215 };
  const cheers = { x: 1015, y: 1185 };
  const t1 = track(f, [[GRAB, 0], [GRAB + 14, 1, ease.inOut]]);
  const t2 = track(f, [[280, 0], [290, 1, ease.overshoot]]);
  return {
    space: "scene" as const,
    x: lerp(lerp(grip.x, lifted.x, t1), cheers.x, t2),
    y: lerp(lerp(grip.y, lifted.y, t1), cheers.y, t2),
  };
};

const buildPose = (f: number, secondary = true): Pose => {
  const base = standing(rootX(f), FLOOR, S);
  const c = crouch(f);
  const face: FacePose = {
    ...poseTrack(f, faceKeys),
    lookX: track(f, LOOK_X),
    lookY: track(f, LOOK_Y),
  };
  const ft = frontTarget(f);
  let p: Pose = {
    ...base,
    lean: lean(f),
    squash: squash(f),
    hop: hop(f),
    bodyTurn: bodyTurn(f),
    headTurn: headTurn(f),
    headTilt: headTilt(f),
    shrug: shrug(f),
    face,
    blink: blink(f, BLINKS),
    legFront: leg({
      hip: track(f, [[0, -3], [240, -3], [246, -6], [251, 32], [256, 20]]) + 8 * c,
      knee: track(f, [[0, 4], [244, 4], [249, 50], [253, 20], [256, 6]]) + 20 * c,
      foot: track(f, [[0, 0], [248, 0], [251, -14], [256, 0]]),
    }),
    legBack: leg({
      hip: track(f, [[0, 4], [244, 4], [250, -6], [256, -16], [264, -12]]) + 8 * c,
      knee: track(f, [[0, 4], [248, 4], [254, 14], [260, 8]]) + 20 * c,
      foot: track(f, [[0, 0], [250, 0], [254, 14], [262, 6], [300, 4]]),
    }),
    armFront: arm({
      shoulder: track(f, [[0, 4], [146, 4], [150, 22], [154, 28], [184, 10], [219, 10], [223, 0], [228, 62, ease.out], [236, 55], [244, 8]]),
      elbow: track(f, [[0, 12], [146, 12], [150, 110], [154, 118], [184, 14], [219, 14], [223, 30], [228, 88, ease.out], [236, 80], [244, 20]]),
      wrist: f >= 149 && f < 190 ? -6 : 0,
      hand: frontHand(f),
      ik: {
        ...ft,
        bend: 1,
        weight: track(f, [[0, 0], [84, 0], [96, 1], [144, 1], [149, 0], [153, 0], [158, 1, ease.out], [180, 1], [188, 0], [246, 0], [258, 1]]),
      },
    }),
    armBack: arm({
      shoulder: track(f, [[0, -2], [146, -2], [154, -20], [180, -14], [190, -2], [219, -2], [223, -8], [228, 52, ease.out], [236, 46], [244, -2], [276, -2], [285, 30, ease.out]]),
      elbow: track(f, [[0, 12], [146, 12], [154, 34], [180, 28], [190, 12], [219, 12], [223, 20], [228, 84, ease.out], [236, 78], [244, 14], [276, 14], [285, 122, ease.out], [300, 116]]),
      wrist: f >= 278 ? -12 : 0,
      hand: backHand(f),
      ik: {
        x: 56,
        y: -44,
        space: "hip",
        bend: -1,
        weight: track(f, [[0, 0], [86, 0], [98, 1], [136, 1], [146, 0]]),
      },
    }),
  };
  p = withWalk(p, walkPhase(f), walkW(f));

  if (secondary) {
    // follow-through del mechón: persigue el ángulo de la cabeza y los saltos con retraso
    const headSig = (i: number) => lean(i) + headTilt(i) + 5 * walkW(i);
    const lagA = follow(f, headSig, { stiffness: 0.16, damping: 0.7 }) - headSig(f);
    const lagH = follow(f, hop, { stiffness: 0.2, damping: 0.68 }) - hop(f);
    const bounce = walkW(f) * 4 * Math.sin(4 * Math.PI * walkPhase(f) - 1);
    p.hairLag = lagA * 2.2 + lagH * 1.6 - 9 * walkW(f) + bounce;
  }
  return p;
};

/* ------------------------------------------------------------------ */
/* Cámara: planos generales y primeros planos con cortes               */
/* ------------------------------------------------------------------ */

type Cam = { x: number; y: number; zoom: number };
type Shot = { from: number; a: Cam; b: Cam; e?: EaseFn; head?: { dx: number; dy: number } };

const SHOTS: Shot[] = [
  { from: 0, a: { x: 580, y: 1060, zoom: 1 }, b: { x: 1110, y: 1110, zoom: 1.05 } },
  { from: 58, a: { x: 1140, y: 1180, zoom: 1.18 }, b: { x: 1130, y: 1170, zoom: 1.24 } },
  { from: 94, a: { x: 0, y: 0, zoom: 2.45 }, b: { x: 0, y: 0, zoom: 2.7 }, head: { dx: 10, dy: 50 } },
  { from: 124, a: { x: 1330, y: 1150, zoom: 1.62 }, b: { x: 1330, y: 1155, zoom: 1.7 } },
  { from: 148, a: { x: 1140, y: 1170, zoom: 1.18 }, b: { x: 1145, y: 1160, zoom: 1.24 } },
  { from: 182, a: { x: 1075, y: 1100, zoom: 1.5 }, b: { x: 1085, y: 1105, zoom: 1.58 } },
  { from: 222, a: { x: 0, y: 0, zoom: 2.45 }, b: { x: 0, y: 0, zoom: 2.8 }, e: ease.out, head: { dx: 0, dy: 40 } },
  { from: 242, a: { x: 1150, y: 1180, zoom: 1.2 }, b: { x: 1130, y: 1170, zoom: 1.27 } },
  { from: 274, a: { x: 0, y: 0, zoom: 1.85 }, b: { x: 0, y: 0, zoom: 2.0 }, head: { dx: 40, dy: 110 } },
];

const headScene = (f: number): Vec => {
  const p = buildPose(f, false);
  return localToScene(p, computeRig(p).headCenter);
};

const camAt = (f: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].from) i++;
  const s = SHOTS[i];
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : DECOY_FRAMES;
  const t = (s.e ?? ease.inOut)(clamp((f - s.from) / (end - s.from), 0, 1));
  const zoom = lerp(s.a.zoom, s.b.zoom, t);
  if (s.head) {
    // sigue la cabeza suavizado (promedio de varios fotogramas) para evitar temblores
    let x = 0;
    let y = 0;
    const n = 6;
    for (let k = 0; k < n; k++) {
      const h = headScene(Math.max(s.from, f - k));
      x += h.x / n;
      y += h.y / n;
    }
    return { x: x + s.head.dx, y: y + s.head.dy, zoom };
  }
  return { x: lerp(s.a.x, s.b.x, t), y: lerp(s.a.y, s.b.y, t), zoom };
};

const camTf = (c: Cam, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2},${H / 2}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

/* ------------------------------------------------------------------ */
/* Escena                                                              */
/* ------------------------------------------------------------------ */

export const DecoyScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = buildPose(f);
  const rig = computeRig(pose);
  const cam = camAt(f);

  // vaso grande: en el mostrador, imantado a la mano justo antes del contacto, luego en la mano
  const held = f >= GRAB;
  const palm = localToScene(pose, rig.front.palm);
  const onCounter = { x: cupL(f), y: COUNTER_TOP };
  const magnet = smooth((f - (GRAB - 5)) / 5);
  const lPos = {
    x: lerp(onCounter.x, palm.x, magnet),
    y: lerp(onCounter.y, palm.y + GRIP_L, magnet),
  };
  const heldTilt = wobble(f, GRAB, -9, 0.5, 8) + (pose.lean - 2) * 0.3;
  const heldSquash = 1 + wobble(f, GRAB, 0.06, 0.9, 4);

  // señuelo (M)
  const mVisible = f >= 124;
  const mSy = cupMsy(f);
  const mDim = track(f, [[GRAB + 2, 0], [GRAB + 18, 1]]);
  const mRot = track(f, [[GRAB, 0], [GRAB + 10, 9, ease.out], [GRAB + 22, 4]]) + wobble(f, GRAB + 10, 4, 0.7, 6);
  const mTagScale = track(f, [[136, 0], [144, 1, ease.overshoot]]);
  const mTagRot = track(f, [[GRAB + 4, 0], [GRAB + 13, 84, ease.in]]) - Math.abs(wobble(f, GRAB + 13, 10, 0.9, 4));
  const look = pose.face.lookX;
  const watchingM = f >= 182 && f < 222 && look > 0.88 ? 1 : 0;
  const watchingL = f >= 182 && f < 222 && look < 0.88 ? 1 : 0;
  const lChosen = smooth((f - 244) / 8);
  const sDim = track(f, [[GRAB + 2, 0], [GRAB + 18, 0.6]]);

  const shadowK = 1 - pose.hop / 90;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2DDBA" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={camTf(cam, 0.82)}>
          <BackWall />
        </g>
        <g transform={camTf(cam)}>
          <Floor />
          <Counter />

          {/* vaso chico */}
          <g transform={`translate(${cupS(f)},${COUNTER_TOP})`}>
            <Cup h={CUP_H.S} letter="S" dim={sDim} steam={f + 30} />
          </g>
          {/* señuelo: cae, rebota y luego queda desplazado */}
          {mVisible ? (
            <g transform={`translate(${cupMx(f)},${COUNTER_TOP + cupMdrop(f)}) scale(${cupMrecede(f)})`}>
              <Cup h={CUP_H.M} letter="M" sy={mSy} sx={1 / Math.sqrt(mSy)} rot={mRot} dim={mDim} sleeve="#9E6E4A" />
            </g>
          ) : null}
          {mVisible && f >= 132 && f < 138 ? (
            <g transform={`translate(1330,${COUNTER_TOP - 6})`} opacity={1 - (f - 132) / 6}>
              {[-1, 1].map((s) => (
                <path
                  key={s}
                  d={`M ${s * 80} -10 L ${s * (110 + (f - 132) * 8)} -24 M ${s * 80} -46 L ${s * (106 + (f - 132) * 8)} -80`}
                  stroke="#2A2024"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              ))}
            </g>
          ) : null}
          {/* vaso grande sobre el mostrador */}
          {!held ? (
            <g transform={`translate(${lPos.x},${lPos.y})`}>
              <Cup h={CUP_H.L} letter="L" steam={f} />
            </g>
          ) : null}

          {/* precios */}
          <g transform={`translate(${cupL(f)},${COUNTER_TOP + 22})`}>
            <PriceTag price="$7" highlight={Math.max(watchingL, lChosen)} />
          </g>
          <g transform={`translate(${cupS(f)},${COUNTER_TOP + 22})`}>
            <PriceTag price="$3" dim={sDim} />
          </g>
          {mVisible && mTagScale > 0.01 ? (
            <g transform={`translate(${cupMx(f) - 40},${COUNTER_TOP + 22})`}>
              <g transform={`rotate(${mTagRot}) translate(40,0)`}>
                <PriceTag price="$6.50" scale={mTagScale} highlight={watchingM} dim={mDim} />
              </g>
            </g>
          ) : null}

          {/* sombra de contacto */}
          <ellipse cx={pose.x + 8} cy={FLOOR + 8} rx={100 * S * 0.6 * shadowK} ry={14 * S * shadowK} fill="#2A1408" opacity={0.25 * shadowK} />

          <Character
            pose={pose}
            rig={rig}
            uid="tomi"
            frontProp={
              held ? (
                <g transform={`scale(${1 / S}) rotate(${heldTilt})`}>
                  <g transform={`translate(0,${GRIP_L}) scale(${1 / heldSquash},${heldSquash})`}>
                    <Cup h={CUP_H.L} letter="L" steam={f} />
                  </g>
                </g>
              ) : undefined
            }
          />
        </g>
        <Grade w={W} h={H} />
      </svg>
    </AbsoluteFill>
  );
};
