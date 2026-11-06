import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp, ease, lerp, smooth, track, wobble } from "../../character/anim";
import { Character } from "../../character/Character";
import { COLORS } from "../../character/presets";
import { localToScene } from "../../character/rig";
import { Cup, PriceTag } from "../decoy/Props";
import { BackWallV2, COUNTER_TOP, CounterV2, FLOOR, FloorV2, Foreground, GradeV2, Lamps, Outside, Sunbeams } from "../decoy-v2/CafeV2";
import {
  CUP_H,
  cupL,
  cupMdrop,
  cupMsy,
  cupMx,
  cupS,
  getTimeline,
  GRAB,
  GRIP_HALF,
  GRIP_Y,
  N,
  type Cam,
} from "./timelineV3";

/**
 * EFECTO SEÑUELO — V3 (perfeccionamiento de la V2).
 *
 * Montaje (11 planos, encuadres fijos; solo se mueve la cámara cuando la acción lo motiva):
 *  1  0–46    general: entra (la cámara acompaña la caminata)
 *  2  46–82   medio: frena y evalúa las dos opciones
 *  3  82–124  primer plano: duda, mano al mentón
 *  4  124–142 detalle: cae el señuelo
 *  5  142–156 primer plano: sobresalto y giro de cabeza
 *  6  156–188 medio: señala el vaso nuevo
 *  7  188–214 plano de dos: compara mediano y grande
 *  8  214–226 detalle de precios (coincide con su mirada)
 *  9  226–250 primer plano: se da cuenta → sorpresa → alegría (un solo plano, sin zoom)
 * 10  250–278 medio: asiente, paso, agarra y levanta el grande
 * 11  278–300 de dos a primer plano: mira de reojo al señuelo y luego a cámara
 */

export const DECOY_V3_FRAMES = N;
const W = 1080;
const H = 1920;
const LINE = "#2A2024";

type Shot = { from: number; cam: (f: number) => Cam };

/** encuadre fijo calculado a partir de la posición media de la cabeza durante el plano */
const headFrame = (from: number, to: number, zoom: number, sx: number, sy: number): ((f: number) => Cam) => {
  let memo: Cam | null = null;
  return () => {
    if (memo) return memo;
    const tl = getTimeline();
    let x = 0;
    let y = 0;
    for (let f = from; f < to; f++) {
      x += tl.head[f].x / (to - from);
      y += tl.head[f].y / (to - from);
    }
    memo = { x: x + (0.5 - sx) * (W / zoom), y: y + (0.5 - sy) * (H / zoom), zoom };
    return memo;
  };
};
const still = (c: Cam) => () => c;

const SHOTS: Shot[] = [
  { from: 0, cam: (f) => ({ x: Math.max(560, getTimeline().camFollowX[f]), y: 1090, zoom: 1 }) },
  { from: 46, cam: still({ x: 1000, y: 1190, zoom: 1.24 }) },
  { from: 82, cam: headFrame(96, 122, 2.2, 0.6, 0.36) },
  { from: 124, cam: still({ x: 1270, y: 1190, zoom: 1.95 }) },
  { from: 142, cam: headFrame(146, 156, 2.2, 0.38, 0.36) },
  { from: 156, cam: still({ x: 1050, y: 1185, zoom: 1.27 }) },
  { from: 188, cam: still({ x: 1015, y: 1150, zoom: 1.58 }) },
  { from: 214, cam: still({ x: 1240, y: 1425, zoom: 2.5 }) },
  { from: 226, cam: headFrame(228, 250, 1.95, 0.42, 0.37) },
  { from: 250, cam: still({ x: 1030, y: 1185, zoom: 1.27 }) },
  {
    from: 278,
    cam: (f) => {
      const two = { x: 1080, y: 1170, zoom: 1.48 };
      const face = headFrame(292, 300, 1.95, 0.47, 0.33)(f);
      const push = track(f, [[278, 0], [287, 0], [299, 1, ease.inOut]]);
      return { x: lerp(two.x, face.x, push), y: lerp(two.y, face.y, push), zoom: lerp(two.zoom, face.zoom, push) };
    },
  },
];

const camAt = (f: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].from) i++;
  const c = SHOTS[i].cam(f);
  // único movimiento "extra": un pequeño temblor por el impacto del vaso al caer
  return { ...c, y: c.y + wobble(f, 132, 5, 2.3, 3) / c.zoom };
};

const camTf = (c: Cam, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2},${H / 2}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

/** sombra de contacto suave, desplazada hacia la derecha (la luz entra por la ventana) */
const ContactShadow: React.FC<{ x: number; w: number; o?: number; id: string }> = ({ x, w, o = 1, id }) => (
  <ellipse cx={x + 6} cy={COUNTER_TOP + 3} rx={w} ry={8} fill="#3A1E10" opacity={0.3 * o} filter={`url(#${id})`} />
);

/* ------------------------- mano que agarra el vaso ------------------------- */
// Dibujada en las coordenadas del vaso: no puede desalinearse ni atravesarlo.

const s = { fill: COLORS.skin, stroke: COLORS.line, strokeWidth: 5, strokeLinejoin: "round" as const };

/** dorso y palma: quedan detrás del vaso, asomando por su borde izquierdo */
const GripBack: React.FC = () => (
  <g transform={`translate(${-GRIP_HALF},${GRIP_Y})`}>
    <ellipse cx={-14} cy={4} rx={21} ry={23} {...s} />
  </g>
);
/** dedos apoyados sobre la cara visible del vaso */
const GripFingers: React.FC = () => (
  <g transform={`translate(${-GRIP_HALF},${GRIP_Y})`}>
    {[
      [-17, 30],
      [-5, 33],
      [7, 30],
      [19, 24],
    ].map(([y, len], i) => (
      <rect key={i} x={-8} y={y - 6} width={len} height={12} rx={6} {...s} />
    ))}
    <path d="M -4 -20 Q -11 2 -4 24" stroke={COLORS.skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

export const DecoyV3: React.FC<{ inst?: string; frame?: number }> = ({ inst = "", frame }) => {
  const current = useCurrentFrame();
  const f = frame ?? current;
  const tl = getTimeline();
  const pose = tl.poses[f];
  const rig = tl.rigs[f];
  const cam = camAt(f);
  const dof = clamp((cam.zoom - 1.35) * 1.8, 0, 4);

  // vaso grande: un único sistema de referencia (base + inclinación) compartido con la mano
  const held = f >= GRAB;
  const cup = tl.cup[f];
  const tilt = tl.cupTilt[f];
  const lift = COUNTER_TOP - cup.y;
  const contact = held ? track(f, [[GRAB, 0.975], [GRAB + 3, 1.015], [GRAB + 6, 1]]) : track(f, [[GRAB - 2, 1], [GRAB, 0.975]]);
  const gripIn = smooth((f - (GRAB - 1)) / 2);

  // señuelo
  const mVisible = f >= 124;
  const mSy = cupMsy(f);
  const mDim = track(f, [[GRAB + 2, 0], [GRAB + 14, 1]]);
  const mScale = track(f, [[GRAB, 1], [GRAB + 14, 0.86, ease.out]]);
  const mRot = wobble(f, GRAB + 1, 5, 1.1, 5) + track(f, [[GRAB + 3, 0], [GRAB + 14, 8, ease.out]]);
  const mTagScale = track(f, [[135, 0], [143, 1, ease.overshoot]]);
  const lx = pose.face.lookX;
  const lookingTags = f >= 188 && f < 242;
  const lookM = lookingTags && lx > 0.8 ? 1 : 0;
  const lookL = lookingTags && lx <= 0.8 ? 1 : 0;
  const lChosen = smooth((f - 252) / 8);
  const sDim = track(f, [[GRAB + 2, 0], [GRAB + 16, 0.55]]);
  const shadowK = 1 - pose.hop / 80;
  const feet = [localToScene(pose, rig.legF.ankle), localToScene(pose, rig.legB.ankle)];

  const id = (n: string) => `v3${n}${inst}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2DDBA" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id={id("far")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={dof * 1.6 + 1.2} />
          </filter>
          <filter id={id("wall")} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={dof} />
          </filter>
          <filter id={id("fg")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
          <filter id={id("soft")} x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          {/* sombra proyectada del personaje sobre el frente del mostrador */}
          <filter id={id("cast")} x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 1 0" />
            <feGaussianBlur stdDeviation={9} />
          </filter>
          <clipPath id={id("counterFront")}>
            <rect x={740} y={COUNTER_TOP + 28} width={2600} height={FLOOR - COUNTER_TOP - 28} />
          </clipPath>
        </defs>

        <g transform={camTf(cam, 0.55)} filter={`url(#${id("far")})`}>
          <Outside f={f} />
        </g>
        <g transform={camTf(cam, 0.85)} filter={dof > 0.05 ? `url(#${id("wall")})` : undefined}>
          <BackWallV2 f={f} />
          {/* perspectiva aérea: el fondo se aclara apenas para separar al personaje */}
          <rect x={-800} y={-600} width={4000} height={2400} fill="#F7EBD8" opacity={0.12} />
        </g>
        <g transform={camTf(cam, 0.92)} filter={dof > 0.05 ? `url(#${id("wall")})` : undefined}>
          <Lamps f={f} />
        </g>

        <g transform={camTf(cam)}>
          <FloorV2 />
          <CounterV2 f={f} />

          <g clipPath={`url(#${id("counterFront")})`} opacity={0.2}>
            <g transform="translate(34,10)" filter={`url(#${id("cast")})`}>
              <Character pose={pose} rig={rig} uid={`tomi3s${inst}`} />
            </g>
          </g>

          {/* sombras de contacto de los vasos */}
          <ContactShadow id={id("soft")} x={cupS(f)} w={CUP_H.S * 0.3} o={1 - sDim * 0.5} />
          {mVisible ? <ContactShadow id={id("soft")} x={cupMx(f)} w={CUP_H.M * 0.3 * clamp(1 + cupMdrop(f) / 600, 0, 1)} /> : null}
          <ContactShadow id={id("soft")} x={cup.x} w={CUP_H.L * 0.3 * clamp(1 - lift / 120, 0.4, 1)} o={clamp(1 - lift / 70, 0, 1)} />

          <g transform={`translate(${cupS(f)},${COUNTER_TOP})`}>
            <Cup h={CUP_H.S} letter="S" dim={sDim} steam={f + 30} />
          </g>
          {mVisible ? (
            <g transform={`translate(${cupMx(f)},${COUNTER_TOP + cupMdrop(f)}) scale(${mScale})`}>
              <Cup h={CUP_H.M} letter="M" sy={mSy} sx={1 / Math.sqrt(mSy)} rot={mRot} dim={mDim} sleeve="#9E6E4A" steam={f >= 150 ? f + 12 : undefined} />
            </g>
          ) : null}
          {mVisible && f >= 131 && f < 138 ? (
            <g transform={`translate(1270,${COUNTER_TOP - 6})`} opacity={1 - (f - 131) / 7}>
              {[-1, 1].map((sg) => (
                <path
                  key={sg}
                  d={`M ${sg * 70} -6 L ${sg * (98 + (f - 131) * 7)} -16 M ${sg * 68} -40 L ${sg * (92 + (f - 131) * 7)} -66`}
                  stroke={LINE}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              ))}
            </g>
          ) : null}
          {!held ? (
            <g transform={`translate(${cup.x},${cup.y}) scale(${1 / Math.sqrt(contact)},${contact})`}>
              <Cup h={CUP_H.L} letter="L" steam={f} />
            </g>
          ) : null}

          {/* precios */}
          <g transform={`translate(${cupL(f)},${COUNTER_TOP + 22})`}>
            <PriceTag price="$7" highlight={Math.max(lookL, lChosen)} />
          </g>
          <g transform={`translate(${cupS(f)},${COUNTER_TOP + 22})`}>
            <PriceTag price="$3" dim={sDim} />
          </g>
          {mVisible && mTagScale > 0.01 ? (
            <g transform={`translate(${cupMx(f) - 40},${COUNTER_TOP + 22})`}>
              <g transform={`rotate(${tl.mTagRot[f]}) translate(40,0)`}>
                <PriceTag price="$6.50" scale={mTagScale} highlight={lookM} dim={mDim} />
              </g>
            </g>
          ) : null}

          <g opacity={0.75}>
            <Sunbeams f={f} />
          </g>

          {/* sombra en el piso: una por pie + una general, se achican al saltar */}
          <ellipse cx={pose.x + 10} cy={FLOOR + 8} rx={95 * shadowK} ry={18 * shadowK} fill="#2A1408" opacity={0.2 * shadowK} />
          {feet.map((a, i) => {
            const k = clamp(1 - (FLOOR - 37 - a.y) / 60, 0, 1);
            return <ellipse key={i} cx={a.x + 30} cy={FLOOR + 5} rx={46 * k} ry={8 * k} fill="#2A1408" opacity={0.28 * k} />;
          })}

          <Character pose={pose} rig={rig} uid={`tomi3${inst}`} />

          {/* vaso sostenido: dorso detrás, vaso, dedos delante (misma transformación) */}
          {held ? (
            <g transform={`translate(${cup.x},${cup.y}) rotate(${tilt})`}>
              <g opacity={gripIn}>
                <GripBack />
              </g>
              <g transform={`scale(${1 / Math.sqrt(contact)},${contact})`}>
                <Cup h={CUP_H.L} letter="L" steam={f} />
              </g>
              <g opacity={gripIn}>
                <GripFingers />
              </g>
            </g>
          ) : null}
        </g>

        <g transform={camTf(cam, 1.3)} filter={`url(#${id("fg")})`} opacity={f < 46 ? 1 : 0}>
          <Foreground />
        </g>
        <GradeV2 w={W} h={H} />
      </svg>
    </AbsoluteFill>
  );
};
