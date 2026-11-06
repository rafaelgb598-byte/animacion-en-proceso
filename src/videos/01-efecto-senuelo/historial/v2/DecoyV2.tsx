import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp, ease, lerp, noise, smooth, track, wobble, type EaseFn } from "../../../../canal/personaje/anim";
import { Character } from "../../../../canal/personaje/tomi-v1/Character";
import { Cup, PriceTag } from "../../../../canal/escenarios/cafeteria/Props";
import { BackWallV2, COUNTER_TOP, CounterV2, FLOOR, FloorV2, Foreground, GradeV2, Lamps, Outside, Sunbeams } from "../../../../canal/escenarios/cafeteria/CafeV2";
import {
  CUP_H,
  cupL,
  cupMdrop,
  cupMsy,
  cupMx,
  cupS,
  getTimeline,
  GRAB,
  GRIP_L,
  N,
  S,
  type Cam,
} from "./timeline";

/**
 * EFECTO SEÑUELO — V2 (misma prueba de 10 s, mejor actuación y montaje).
 *
 * Montaje (13 planos):
 *  1  0–44   general con seguimiento: entra, mira de reojo
 *  2  44–80  medio (corte en la doble toma): frena y evalúa
 *  3  80–124 primer plano: duda, mano al mentón, golpecitos
 *  4  124–142 inserto: cae el señuelo (temblor leve por el impacto)
 *  5  142–154 primer plano: sobresalto y giro de cabeza
 *  6  154–186 medio (corte en la acción de señalar)
 *  7  186–204 plano de dos: compara, los ojos van y vienen
 *  8  204–212 primerísimo plano de los ojos
 *  9  212–220 inserto: paneo de $7 a $6.50
 * 10  220–228 primerísimo plano de los ojos: "clic"
 * 11  228–246 primer plano: la sorpresa (empuje de cámara)
 * 12  246–276 medio: asiente, da un paso, agarra el grande; el mediano queda desplazado
 * 13  276–300 de dos a primer plano: mira de reojo al señuelo y luego a cámara
 */

export const DECOY_V2_FRAMES = N;
const W = 1080;
const H = 1920;

type ShotFn = (f: number, t: number) => Cam;
type Shot = { from: number; cam: ShotFn; e?: EaseFn; shake?: number };

const fixed = (a: Cam, b: Cam): ShotFn => (_f, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) });

/** sigue la cabeza; `screenY` = altura de la cabeza en pantalla (0..1), `screenX` idem */
const onHead =
  (za: number, zb: number, screenX: number, screenY: number, target: "head" | "eyes" = "head"): ShotFn =>
  (f, t) => {
    const tl = getTimeline();
    const h = (target === "head" ? tl.head : tl.eyes)[Math.min(N - 1, Math.max(0, f))];
    const zoom = lerp(za, zb, t);
    return { x: h.x + (0.5 - screenX) * (W / zoom), y: h.y + (0.5 - screenY) * (H / zoom), zoom };
  };

const SHOTS: Shot[] = [
  {
    from: 0,
    cam: (f, t) => ({ x: Math.max(560, getTimeline().camFollowX[f]), y: 1090, zoom: lerp(1, 1.07, t) }),
    shake: 1,
  },
  { from: 44, cam: fixed({ x: 1000, y: 1195, zoom: 1.22 }, { x: 990, y: 1185, zoom: 1.29 }), shake: 1 },
  { from: 80, cam: onHead(2.15, 2.45, 0.6, 0.36), shake: 0.8 },
  { from: 124, cam: fixed({ x: 1270, y: 1185, zoom: 1.95 }, { x: 1270, y: 1190, zoom: 2.02 }), shake: 0.4 },
  { from: 142, cam: onHead(2.25, 2.4, 0.36, 0.36), e: ease.out, shake: 0.8 },
  { from: 154, cam: fixed({ x: 1035, y: 1190, zoom: 1.25 }, { x: 1065, y: 1180, zoom: 1.31 }), shake: 1 },
  { from: 186, cam: fixed({ x: 1030, y: 1150, zoom: 1.55 }, { x: 1045, y: 1150, zoom: 1.64 }), shake: 0.8 },
  { from: 204, cam: onHead(5.0, 5.2, 0.5, 0.5, "eyes"), shake: 0.5 },
  { from: 212, cam: fixed({ x: 1100, y: 1300, zoom: 2.6 }, { x: 1270, y: 1300, zoom: 2.68 }), e: ease.inOut, shake: 0.4 },
  { from: 220, cam: onHead(5.2, 5.6, 0.5, 0.5, "eyes"), shake: 0.4 },
  {
    from: 228,
    cam: (f, t) => {
      const punch = track(f, [[228, 0], [233, 0], [236, 1, ease.out]]);
      return onHead(2.1 + punch * 0.35, 2.15 + punch * 0.35, 0.5, 0.38)(f, t);
    },
    shake: 0.8,
  },
  { from: 246, cam: fixed({ x: 1020, y: 1190, zoom: 1.24 }, { x: 1050, y: 1180, zoom: 1.3 }), shake: 1 },
  {
    from: 276,
    cam: (f, t) => {
      // empieza mostrando al señuelo desplazado (lo mira de reojo) y empuja hacia la cara en la mirada a cámara
      const two = { x: 1085, y: 1165, zoom: 1.48 };
      const face = onHead(1.95, 2.1, 0.47, 0.32)(f, t);
      const push = track(f, [[276, 0], [286, 0], [297, 1, ease.inOut]]);
      return { x: lerp(two.x, face.x, push), y: lerp(two.y, face.y, push), zoom: lerp(two.zoom, face.zoom, push) };
    },
    shake: 0.6,
  },
];

const camAt = (f: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].from) i++;
  const s = SHOTS[i];
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : N;
  const t = (s.e ?? ease.inOut)(clamp((f - s.from) / (end - s.from), 0, 1));
  const c = s.cam(f, t);
  // cámara en mano muy sutil + temblor por el impacto del vaso
  const hand = (s.shake ?? 1) * 2.4;
  const impact = wobble(f, 132, 9, 2.3, 3.5);
  return {
    x: c.x + (noise(f, 11) * hand) / c.zoom,
    y: c.y + (noise(f, 23) * hand + impact) / c.zoom,
    zoom: c.zoom,
  };
};

const camTf = (c: Cam, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2},${H / 2}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

const CupShadow: React.FC<{ x: number; w: number; o?: number }> = ({ x, w, o = 1 }) => (
  <ellipse cx={x} cy={COUNTER_TOP + 2} rx={w} ry={9} fill="#3A1E10" opacity={0.22 * o} />
);

export const DecoyV2: React.FC<{ inst?: string; frame?: number }> = ({ inst = "", frame }) => {
  const current = useCurrentFrame();
  const f = frame ?? current;
  const tl = getTimeline();
  const pose = tl.poses[f];
  const rig = tl.rigs[f];
  const cam = camAt(f);

  // profundidad de campo: el fondo se desenfoca en los planos cerrados
  const dof = clamp((cam.zoom - 1.35) * 1.9, 0, 4.2);

  // vaso grande: imantado a la mano en el contacto, luego sostenido
  const held = f >= GRAB;
  const palm = tl.palm[f];
  const onCounter = { x: cupL(f), y: COUNTER_TOP };
  const magnet = smooth((f - (GRAB - 4)) / 4);
  const lPos = { x: lerp(onCounter.x, palm.x, magnet), y: lerp(onCounter.y, palm.y + GRIP_L, magnet) };
  const contact = track(f, [[GRAB - 3, 1], [GRAB - 1, 0.95], [GRAB + 2, 1.02], [GRAB + 5, 1]]);

  // señuelo
  const mVisible = f >= 124;
  const mSy = cupMsy(f);
  const mDim = track(f, [[GRAB + 2, 0], [GRAB + 14, 1]]);
  const mScale = track(f, [[GRAB, 1], [GRAB + 14, 0.86, ease.out]]);
  const mRot = wobble(f, GRAB, 6, 1.1, 5) + track(f, [[GRAB + 3, 0], [GRAB + 14, 8, ease.out]]);
  const mTagScale = track(f, [[135, 0], [143, 1, ease.overshoot]]);
  const lx = pose.face.lookX;
  const comparing = f >= 186 && f < 224;
  const lookM = comparing && lx > 0.8 ? 1 : 0;
  const lookL = comparing && lx <= 0.8 ? 1 : 0;
  const lChosen = smooth((f - 250) / 8);
  const sDim = track(f, [[GRAB + 4, 0], [GRAB + 20, 0.55]]);
  const shadowK = 1 - pose.hop / 90;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2DDBA" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id={`v2dofFar${inst}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={dof * 1.6 + 1.2} />
          </filter>
          <filter id={`v2dofWall${inst}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={dof} />
          </filter>
          <filter id={`v2fg${inst}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
        </defs>

        <g transform={camTf(cam, 0.55)} filter={`url(#v2dofFar${inst})`}>
          <Outside f={f} />
        </g>
        <g transform={camTf(cam, 0.85)} filter={dof > 0.05 ? `url(#v2dofWall${inst})` : undefined}>
          <BackWallV2 f={f} />
        </g>
        <g transform={camTf(cam, 0.92)} filter={dof > 0.05 ? `url(#v2dofWall${inst})` : undefined}>
          <Lamps f={f} />
        </g>

        <g transform={camTf(cam)}>
          <FloorV2 />
          <CounterV2 f={f} />

          {/* sombras de contacto de los vasos */}
          <CupShadow x={cupS(f)} w={CUP_H.S * 0.3} o={1 - sDim * 0.5} />
          {mVisible ? <CupShadow x={cupMx(f)} w={CUP_H.M * 0.3 * clamp(1 + cupMdrop(f) / 600, 0, 1)} /> : null}
          {!held ? <CupShadow x={lPos.x} w={CUP_H.L * 0.3} o={1 - magnet} /> : null}

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
              {[-1, 1].map((s) => (
                <path
                  key={s}
                  d={`M ${s * 70} -6 L ${s * (98 + (f - 131) * 7)} -16 M ${s * 68} -40 L ${s * (92 + (f - 131) * 7)} -66`}
                  stroke="#2A2024"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              ))}
            </g>
          ) : null}
          {!held ? (
            <g transform={`translate(${lPos.x},${lPos.y}) scale(${1 / Math.sqrt(contact)},${contact})`}>
              <Cup h={CUP_H.L} letter="L" steam={f} />
            </g>
          ) : null}

          {/* precios colgados del mostrador */}
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

          <Sunbeams f={f} />

          <ellipse cx={pose.x + 6} cy={FLOOR + 8} rx={90 * shadowK} ry={20 * shadowK} fill="#2A1408" opacity={0.28 * shadowK} />
          <Character
            pose={pose}
            rig={rig}
            uid={`tomi2${inst}`}
            frontProp={
              held ? (
                <g transform={`scale(${1 / S}) rotate(${tl.heldTilt[f]})`}>
                  <g transform={`translate(0,${GRIP_L})`}>
                    <Cup h={CUP_H.L} letter="L" steam={f} />
                  </g>
                </g>
              ) : undefined
            }
          />
        </g>

        <g transform={camTf(cam, 1.3)} filter={`url(#v2fg${inst})`} opacity={f < 44 ? 1 : 0}>
          <Foreground />
        </g>
        <GradeV2 w={W} h={H} />
      </svg>
    </AbsoluteFill>
  );
};
