import React from "react";
import { clamp, ease, lerp, smooth, wobble } from "../../../canal/personaje/anim";
import { Character } from "../../../canal/personaje/tomi-v1/Character";
import { CHALK } from "../../../canal/escenarios/cafeteria/Cafe";
import { Cup } from "../../../canal/escenarios/cafeteria/Props";
import { BackWallV2, COUNTER_TOP, CounterV2, FLOOR, FloorV2, GradeV2, Lamps, Outside, PAL_CHAIN, Sunbeams } from "../../../canal/escenarios/cafeteria/CafeV2";
import { CUP_H, cupLx, cupSx, getCafe, mDropY, mSquash, mTagScale, mVisible, M_X, napkinDraped, napkinHeld, S } from "./cafe";
import { CUE, DURATION } from "./timing";

/**
 * Cafetería del Short: reutiliza el set de la V2/V3 y el personaje articulado.
 * Planos fijos con encuadres pensados para 9:16 (subtítulos en la franja inferior,
 * títulos en la pared, precios siempre por encima de la franja de subtítulos).
 */

const BADGE = PAL_CHAIN.band;
const W = 1080;
const H = 1920;
const LINE = "#2A2024";
type Cam = { x: number; y: number; zoom: number };

/* ------------------------------ planos ------------------------------ */

const headCam = (from: number, to: number, zoom: number, sx: number, sy: number) => {
  let memo: Cam | null = null;
  return (): Cam => {
    if (memo) return memo;
    const { head } = getCafe();
    let x = 0;
    let y = 0;
    for (let f = from; f < to; f++) {
      x += head[f].x / (to - from);
      y += head[f].y / (to - from);
    }
    memo = { x: x + (0.5 - sx) * (W / zoom), y: y + (0.5 - sy) * (H / zoom), zoom };
    return memo;
  };
};
const fixed = (c: Cam) => () => c;
const drift = (a: Cam, b: Cam, from: number, to: number) => (f: number): Cam => {
  const t = ease.inOut(clamp((f - from) / (to - from), 0, 1));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) };
};

const OPEN: Cam = { x: 1085, y: 1170, zoom: 1.36 };
const SHOTS: { from: number; cam: (f: number) => Cam }[] = [
  { from: 0, cam: fixed(OPEN) }, // gancho: ¿chico o grande?
  { from: 58, cam: drift({ x: 1270, y: 1290, zoom: 2.05 }, { x: 1270, y: 1290, zoom: 2.15 }, 58, 156) }, // detalle de precios
  { from: 156, cam: headCam(170, 230, 2.1, 0.58, 0.36) }, // primer plano: duda
  { from: 232, cam: fixed({ x: 1270, y: 1240, zoom: 1.72 }) }, // detalle: cae el mediano
  { from: 296, cam: headCam(300, 346, 2.1, 0.38, 0.36) }, // primer plano: reacción
  { from: 346, cam: fixed({ x: 1080, y: 1165, zoom: 1.32 }) }, // plano de dos: señala, "+US$0,50"
  { from: 456, cam: fixed({ x: 1010, y: 1175, zoom: 1.32 }) }, // va por el grande… se congela
  { from: 500, cam: drift({ x: 1080, y: 1365, zoom: 3.1 }, { x: 1080, y: 1362, zoom: 3.25 }, 500, 560) }, // revelación US$7
  { from: 560, cam: fixed({ x: 1270, y: 1195, zoom: 1.55 }) }, // contra qué lo comparás
  { from: 1112, cam: fixed({ x: 1080, y: 1165, zoom: 1.3 }) }, // vuelta: el truco
  { from: 1262, cam: fixed({ x: 1150, y: 1170, zoom: 1.42 }) }, // tapa el mediano
  { from: 1316, cam: fixed(OPEN) }, // loop: mismo encuadre que el gancho
];
export const cafeCamAt = (f: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].from) i++;
  const c = SHOTS[i].cam(f);
  return { ...c, y: c.y + wobble(f, CUE.mediano + 2, 5, 2.3, 3) / c.zoom };
};
const camTf = (c: Cam, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2},${H / 2}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

/* ------------------------------ elementos ------------------------------ */

/** cartel de precio colgado: tamaño + precio en US$ (coma decimal) */
export const Tag: React.FC<{ size: string; price: string; highlight?: number; glow?: number; dim?: number; scale?: number }> = ({
  size,
  price,
  highlight = 0,
  glow = 0,
  dim = 0,
  scale = 1,
}) => (
  <g transform={`scale(${scale})`} opacity={1 - dim * 0.45} style={{ filter: dim > 0 ? `grayscale(${dim})` : undefined }}>
    {glow > 0 ? <rect x={-104} y={6} width={208} height={128} rx={26} fill="#FFE27A" opacity={0.55 * glow} /> : null}
    <path d="M -50 -4 L -50 20 M 50 -4 L 50 20" stroke={LINE} strokeWidth={4} strokeLinecap="round" />
    <circle cx={-50} cy={-4} r={5} fill="#C9A15A" stroke={LINE} strokeWidth={3} />
    <circle cx={50} cy={-4} r={5} fill="#C9A15A" stroke={LINE} strokeWidth={3} />
    <rect x={-88} y={16} width={176} height={108} rx={12} fill="#7A4D33" stroke={LINE} strokeWidth={5} />
    <rect x={-78} y={25} width={156} height={90} rx={7} fill="#2F3B36" />
    <text x={0} y={52} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={21} letterSpacing={2} fill="#E9B44C">
      {size}
    </text>
    <text x={0} y={98} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={40} fill="#F4EFE3">
      {price}
    </text>
    {highlight > 0 ? (
      <path d={`M -58 108 Q 0 113 ${-58 + 116 * highlight} 107`} stroke="#E9B44C" strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : null}
  </g>
);

/** trazo de tiza que se dibuja (0..1) */
export const ChalkPath: React.FC<{ d: string; t: number; color?: string; w?: number }> = ({ d, t, color = "#FFF4D6", w = 7 }) =>
  t <= 0 ? null : (
    <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(t, 0, 1)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
export const ChalkText: React.FC<{ x: number; y: number; t: number; size: number; color?: string; children: string }> = ({ x, y, t, size, color = "#FFF4D6", children }) =>
  t <= 0 ? null : (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily={CHALK}
      fontWeight={700}
      fontSize={size}
      fill={color}
      stroke={LINE}
      strokeWidth={size * 0.16}
      paintOrder="stroke"
      opacity={clamp(t * 1.5, 0, 1)}
      transform={`translate(${x},${y}) scale(${0.85 + 0.15 * ease.overshoot(clamp(t, 0, 1))}) translate(${-x},${-y})`}
    >
      {children}
    </text>
  );

export const Sparkle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0 ? null : (
    <path
      transform={`translate(${x},${y}) scale(${s})`}
      d="M 0 -22 Q 3 -3 22 0 Q 3 3 0 22 Q -3 3 -22 0 Q -3 -3 0 -22 Z"
      fill="#FFE27A"
      stroke={LINE}
      strokeWidth={3}
    />
  );

/** servilleta: arrugada en la mano / apoyada sobre el vaso */
export const NapkinHeld: React.FC = () => (
  <g transform={`scale(${1 / S})`}>
    <path d="M -34 -14 Q -20 -40 6 -30 Q 34 -36 40 -8 Q 46 18 20 26 Q -6 36 -28 22 Q -46 6 -34 -14 Z" fill="#FFFFFF" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -14 -16 Q 0 -2 -6 14 M 12 -18 Q 22 0 14 16" stroke="#D8D2C8" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);
export const NapkinDraped: React.FC<{ h: number; t: number }> = ({ h, t }) => {
  const top = -h - 18;
  const drop = lerp(20, 92, t);
  return (
    <g>
      <path
        d={`M ${-74} ${top + drop} Q ${-82} ${top + 6} ${-30} ${top - 6} Q 0 ${top - 14} 32 ${top - 6} Q 84 ${top + 6} 76 ${top + drop} Q 52 ${top + drop - 14} 30 ${top + drop + 4} Q 6 ${top + drop - 12} -16 ${top + drop + 6} Q -44 ${top + drop - 12} -74 ${top + drop} Z`}
        fill="#FFFFFF"
        stroke={LINE}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M -30 ${top + 4} Q -26 ${top + drop * 0.6} -36 ${top + drop - 6} M 22 ${top + 2} Q 28 ${top + drop * 0.6} 18 ${top + drop - 4}`} stroke="#D8D2C8" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------ escena ------------------------------ */

export const CafeScene: React.FC<{ f: number; inst?: string }> = ({ f, inst = "" }) => {
  const { poses, rigs } = getCafe();
  const fr = clamp(f, 0, DURATION - 1);
  const pose = poses[fr];
  const rig = rigs[fr];
  const cam = cafeCamAt(fr);
  const dof = clamp((cam.zoom - 1.4) * 1.6, 0, 4);
  const id = (n: string) => `sf${n}${inst}`;

  const lx = cupLx(fr);
  const sx = cupSx(fr);
  const mv = mVisible(fr);
  const mY = mDropY(fr);
  const mSy = mSquash(fr);

  // resaltados sincronizados con la narración
  const hiS = smooth((fr - CUE.tres) / 6) * (1 - smooth((fr - CUE.tres - 50) / 10));
  const hiL1 = smooth((fr - CUE.siete) / 6) * (1 - smooth((fr - CUE.siete - 50) / 10));
  const hiM = smooth((fr - CUE.seis) / 6) * (1 - smooth((fr - 330) / 10));
  const halfDollar = smooth((fr - CUE.cincuenta + 2) / 12) * (1 - smooth((fr - 452) / 6));
  const reveal = fr >= 500 && fr < 632 ? smooth((fr - CUE.nunca + 4) / 8) : 0;
  const arcCaro = smooth((fr - CUE.cambio) / 14);
  const arcGanga = smooth((fr - CUE.comparas + 6) / 14);
  const showArcs = fr >= 560 && fr < 632;
  const mGlow = smooth((fr - CUE.medio) / 8) * (1 - smooth((fr - 1232) / 10));
  const lSparkle = smooth((fr - CUE.mejor) / 6) * (1 - smooth((fr - 1270) / 8));
  const napkinT = smooth((fr - CUE.mediano2 - 1) / 6);

  const mShadow = mv ? clamp(1 + mY / 600, 0, 1) * clamp(1 - mY / 40, 0, 1) : 0;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id={id("far")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={dof * 1.6 + 1.2} />
        </filter>
        <filter id={id("wall")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={dof} />
        </filter>
        <filter id={id("soft")} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
        <filter id={id("cast")} x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 1 0" />
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
        <clipPath id={id("counterFront")}>
          <rect x={740} y={COUNTER_TOP + 28} width={2600} height={FLOOR - COUNTER_TOP - 28} />
        </clipPath>
        <clipPath id={id("aboveCounter")}>
          <rect x={0} y={-2000} width={4000} height={2000 + COUNTER_TOP + 1} />
        </clipPath>
      </defs>

      <g transform={camTf(cam, 0.55)} filter={`url(#${id("far")})`}>
        <Outside f={fr} />
      </g>
      <g transform={camTf(cam, 0.85)} filter={dof > 0.05 ? `url(#${id("wall")})` : undefined}>
        <BackWallV2 f={fr} pal={PAL_CHAIN} />
        <rect x={-800} y={-600} width={4000} height={2400} fill="#F7EBD8" opacity={0.12} />
      </g>
      <g transform={camTf(cam, 0.92)} filter={dof > 0.05 ? `url(#${id("wall")})` : undefined}>
        <Lamps f={fr} pal={PAL_CHAIN} />
      </g>

      <g transform={camTf(cam)}>
        <FloorV2 />
        <CounterV2 f={fr} pal={PAL_CHAIN} />
        <g clipPath={`url(#${id("counterFront")})`} opacity={0.2}>
          <g transform="translate(34,10)" filter={`url(#${id("cast")})`}>
            <Character pose={pose} rig={rig} uid={`sfs${inst}`} />
          </g>
        </g>

        {/* sombras de contacto */}
        <ellipse cx={sx + 6} cy={COUNTER_TOP + 3} rx={CUP_H.S * 0.3} ry={8} fill="#3A1E10" opacity={0.3} filter={`url(#${id("soft")})`} />
        <ellipse cx={lx + 6} cy={COUNTER_TOP + 3} rx={CUP_H.L * 0.3} ry={8} fill="#3A1E10" opacity={0.3} filter={`url(#${id("soft")})`} />
        {mv ? (
          <ellipse cx={M_X + 6} cy={COUNTER_TOP + 3} rx={CUP_H.M * 0.3 * mShadow} ry={8} fill="#3A1E10" opacity={0.3 * mShadow} filter={`url(#${id("soft")})`} />
        ) : null}

        {/* brillo del mediano ("la opción del medio") */}
        {mv && mGlow > 0 ? <ellipse cx={M_X} cy={COUNTER_TOP - 80} rx={110} ry={130} fill="#FFE27A" opacity={0.6 * mGlow} filter={`url(#${id("glow")})`} /> : null}
        {reveal > 0 || lSparkle > 0 ? (
          <ellipse cx={lx} cy={COUNTER_TOP - 90} rx={120} ry={150} fill="#FFE27A" opacity={0.45 * Math.max(reveal, lSparkle)} filter={`url(#${id("glow")})`} />
        ) : null}

        <g transform={`translate(${sx},${COUNTER_TOP})`}>
          <Cup h={CUP_H.S} letter="S" steam={fr + 30} badge={BADGE} />
        </g>
        <g transform={`translate(${lx},${COUNTER_TOP})`}>
          <Cup h={CUP_H.L} letter="L" steam={fr} badge={BADGE} />
        </g>
        {mv ? (
          <g clipPath={`url(#${id("aboveCounter")})`}>
            <g transform={`translate(${M_X},${COUNTER_TOP + mY})`}>
              <Cup h={CUP_H.M} letter="M" sy={mSy} sx={1 / Math.sqrt(mSy)} sleeve="#9E6E4A" badge={BADGE} steam={fr > 270 && !napkinDraped(fr) ? fr + 12 : undefined} />
              {napkinDraped(fr) ? <NapkinDraped h={CUP_H.M} t={napkinT} /> : null}
            </g>
          </g>
        ) : null}
        {mv && fr >= CUE.mediano && fr < CUE.mediano + 7 ? (
          <g transform={`translate(${M_X},${COUNTER_TOP - 6})`} opacity={1 - (fr - CUE.mediano) / 7}>
            {[-1, 1].map((sg) => (
              <path key={sg} d={`M ${sg * 70} -6 L ${sg * (98 + (fr - CUE.mediano) * 7)} -16 M ${sg * 68} -40 L ${sg * (92 + (fr - CUE.mediano) * 7)} -66`} stroke={LINE} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        ) : null}

        {/* precios */}
        <g transform={`translate(${lx},${COUNTER_TOP + 22})`}>
          <Tag size="GRANDE" price="US$7" highlight={Math.max(hiL1, showArcs ? 1 : 0)} glow={Math.max(reveal, lSparkle)} />
        </g>
        <g transform={`translate(${sx},${COUNTER_TOP + 22})`}>
          <Tag size="CHICO" price="US$3" highlight={hiS} />
        </g>
        {mv && mTagScale(fr) > 0.01 ? (
          <g transform={`translate(${M_X},${COUNTER_TOP + 22})`}>
            <Tag size="MEDIANO" price="US$6,50" scale={mTagScale(fr)} highlight={hiM} glow={mGlow} />
          </g>
        ) : null}

        {/* "+US$0,50": une el mediano con el grande */}
        {halfDollar > 0 ? (
          <g>
            <ChalkPath d={`M ${lx} 1088 Q ${lx + 20} 1030 ${(lx + M_X) / 2} 1028 Q ${M_X - 20} 1030 ${M_X} 1118`} t={halfDollar * 1.3} color="#FFE27A" w={8} />
            <ChalkText x={(lx + M_X) / 2} y={1004} t={halfDollar * 1.6 - 0.4} size={46} color="#FFE27A">
              +US$0,50
            </ChalkText>
          </g>
        ) : null}

        {/* revelación: el grande sigue costando US$7 */}
        {reveal > 0 ? (
          <ChalkPath d={`M ${lx - 104} ${COUNTER_TOP + 86} Q ${lx - 100} ${COUNTER_TOP + 10} ${lx} ${COUNTER_TOP + 14} Q ${lx + 104} ${COUNTER_TOP + 18} ${lx + 100} ${COUNTER_TOP + 92} Q ${lx + 90} ${COUNTER_TOP + 160} ${lx} ${COUNTER_TOP + 156} Q ${lx - 92} ${COUNTER_TOP + 150} ${lx - 108} ${COUNTER_TOP + 80}`} t={reveal} color="#FFE27A" w={7} />
        ) : null}

        {/* contra qué lo comparás: grande vs chico = caro · grande vs mediano = ganga */}
        {showArcs ? (
          <g>
            <ChalkPath d={`M ${lx} 1090 Q ${(lx + sx) / 2} 900 ${sx} 1140`} t={arcCaro} color="#FF9C8A" w={7} />
            <ChalkText x={(lx + sx) / 2} y={922} t={arcCaro * 1.5 - 0.3} size={44} color="#FF9C8A">
              caro
            </ChalkText>
            <ChalkPath d={`M ${lx + 10} 1100 Q ${(lx + M_X) / 2} 1040 ${M_X} 1124`} t={arcGanga} color="#9FE3B0" w={7} />
            <ChalkText x={(lx + M_X) / 2 - 6} y={1052} t={arcGanga * 1.5 - 0.3} size={40} color="#9FE3B0">
              ¡ganga!
            </ChalkText>
          </g>
        ) : null}

        {lSparkle > 0 ? (
          <g>
            <Sparkle x={lx - 82} y={1070} s={lSparkle * (0.8 + 0.2 * Math.sin(fr * 0.5))} />
            <Sparkle x={lx + 88} y={1110} s={lSparkle * 0.7 * (0.8 + 0.2 * Math.sin(fr * 0.5 + 2))} />
            <Sparkle x={lx + 40} y={1030} s={lSparkle * 0.55} />
          </g>
        ) : null}

        <g opacity={0.6}>
          <Sunbeams f={fr} />
        </g>

        <ellipse cx={pose.x + 10} cy={FLOOR + 8} rx={95} ry={18} fill="#2A1408" opacity={0.2} />
        <Character pose={pose} rig={rig} uid={`sft${inst}`} frontProp={napkinHeld(fr) ? <NapkinHeld /> : undefined} />
      </g>
      <GradeV2 w={W} h={H} />
    </svg>
  );
};
