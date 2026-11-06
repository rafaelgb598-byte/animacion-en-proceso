import React from "react";
import { AbsoluteFill, random } from "remotion";
import {
  aluminumDull,
  aluminumPits,
  batterySwell,
  cableCracks,
  cableFragment,
  cableGone,
  cableSplit,
  cableYellow,
  copperGreen,
  debrisMoss,
  dust,
  floorSoil,
  grassGrowth,
  laminatePeel,
  lightRegime,
  lramp,
  mixColor,
  mound,
  phoneBodyLoss,
} from "../../decay";
import { TAU } from "../../lib/anim";
import { buzzOffset, lampOn } from "../../lib/power";
import { LAYOUT, LIGHT, MAT } from "../../theme";
import { PERIOD } from "../../timeline";
import { lightColor } from "../fx/Light";
import { DustFilter, GrainFilter, RoughFilter, Svg } from "../svg";
import { DogScreen } from "./DogScreen";

const M = LAYOUT.macro;
const X0 = M.cx - M.w / 2;
const Y0 = M.cy - M.h / 2;
const GW = M.w - M.inset * 2;
const GH = M.h - M.inset * 2;
const GX = X0 + M.inset;
const GY = Y0 + M.inset;

/** Geometría pública (para indicaciones y la transición por forma). */
export const MACRO_GEO = {
  glassCenter: { x: M.cx, y: M.cy - 60 },
  chip: { x: GX + GW * 0.62, y: GY + GH * 0.16, w: 150, h: 112 },
  metal: { x: X0 - 55, y: Y0 + M.h * 0.42 },
  plastic: { x: X0 + M.w + 84, y: Y0 + M.h * 0.6 },
  sideGap: { x: LAYOUT.side.x1 - 70, y: LAYOUT.side.y - 60 },
};

const COLS = 16;
const ROWS = 34;

/** Momento (frame) en que se apaga cada bloque de la foto: de abajo hacia arriba, con azar determinista. */
const blockTime = (i: number, j: number, start: number, len: number) =>
  start + ((ROWS - 1 - j) / (ROWS - 1)) * 0.55 * len + random(`blk-${i}-${j}`) * 0.45 * len;

const PhotoDecayGrid: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const len = end - start;
  const cw = GW / COLS;
  const ch = GH / ROWS;
  const out: React.ReactNode[] = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const t = blockTime(i, j, start, len);
      if (frame < t - 6) continue;
      if (frame < t) {
        const dir = random(`blk-d-${i}-${j}`) > 0.5 ? 1 : -1;
        out.push(<rect key={`g${i}-${j}`} x={i * cw + dir * cw} y={j * ch} width={cw + 0.5} height={ch + 0.5} fill={MAT.pixelGlitch} opacity={0.85} />);
      } else {
        out.push(<rect key={`b${i}-${j}`} x={i * cw} y={j * ch} width={cw + 0.5} height={ch + 0.5} fill={MAT.pixelDead} />);
      }
    }
  }
  return <g>{out}</g>;
};

/** Interior estilizado: batería, placa y chip de memoria con la miniatura de la foto. */
const XRay: React.FC<{ uid: string; amount: number }> = ({ uid, amount }) => {
  if (amount <= 0.001) return null;
  const c = MACRO_GEO.chip;
  const cx = c.x - GX;
  const cy = c.y - GY;
  return (
    <g opacity={amount}>
      <rect x={20} y={GH * 0.36} width={GW - 40} height={GH * 0.58} rx={18} fill={MAT.pouchShade} />
      <rect x={34} y={GH * 0.38} width={GW - 68} height={GH * 0.54} rx={14} fill={MAT.pouch} opacity={0.5} />
      <rect x={14} y={14} width={GW - 28} height={GH * 0.32} rx={14} fill={MAT.board} />
      {Array.from({ length: 9 }, (_, k) => (
        <path key={k} d={`M 30 ${40 + k * 30} H ${GW * 0.45} V ${60 + k * 22}`} stroke={MAT.boardTrace} strokeWidth={3} fill="none" />
      ))}
      <rect x={40} y={70} width={110} height={90} rx={6} fill={MAT.chip} stroke={MAT.chipEdge} strokeWidth={3} />
      <rect x={60} y={200} width={80} height={60} rx={6} fill={MAT.chip} stroke={MAT.chipEdge} strokeWidth={3} />
      {/* chip de memoria con la foto adentro */}
      <defs>
        <radialGradient id={`${uid}-chipglow`}>
          <stop offset="0" stopColor={LIGHT.screen} stopOpacity={0.8} />
          <stop offset="1" stopColor={LIGHT.screen} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={130} fill={`url(#${uid}-chipglow)`} />
      <rect x={cx - c.w / 2} y={cy - c.h / 2} width={c.w} height={c.h} rx={8} fill={MAT.chip} stroke={LIGHT.screen} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, k) => (
        <React.Fragment key={k}>
          <rect x={cx - c.w / 2 + 12 + k * 22} y={cy - c.h / 2 - 10} width={8} height={10} fill={MAT.chipEdge} />
          <rect x={cx - c.w / 2 + 12 + k * 22} y={cy + c.h / 2} width={8} height={10} fill={MAT.chipEdge} />
        </React.Fragment>
      ))}
      <foreignObject x={cx - 52} y={cy - 38} width={104} height={76}>
        <div style={{ position: "relative", width: 104, height: 76, overflow: "hidden", borderRadius: 4 }}>
          <DogScreen w={104} h={76} id={`${uid}-thumb`} />
        </div>
      </foreignObject>
    </g>
  );
};

/** Fondo bajo el celular: laminado de la mesa → restos con musgo → tierra con pasto. */
const Surface: React.FC<{ uid: string; year: number; frame: number }> = ({ uid, year, frame }) => {
  const peel = laminatePeel(year);
  const moss = debrisMoss(year);
  const soil = Math.max(floorSoil(year), lramp(year, 44, 120));
  const grass = grassGrowth(year);
  const base = mixColor(mixColor(MAT.laminateLight, MAT.particle, 0.5 * peel), MAT.soil, soil);
  return (
    <>
      <defs>
        <GrainFilter id={`${uid}-grain`} seed={81} freq={0.55} opacity={0.09} />
        <RoughFilter id={`${uid}-rough`} seed={83} scale={40} freq={0.02} />
      </defs>
      <rect x={-50} y={-50} width={1180} height={2020} fill={base} filter={`url(#${uid}-grain)`} />
      {/* veta del laminado */}
      <g opacity={0.25 * (1 - soil)} stroke={MAT.laminate} strokeWidth={6} fill="none">
        {Array.from({ length: 14 }, (_, k) => (
          <path key={k} d={`M ${-40 + k * 85} -40 C ${k * 85 + 30} 500, ${k * 85 - 30} 1300, ${k * 85 + 10} 1980`} />
        ))}
      </g>
      <g filter={`url(#${uid}-rough)`} opacity={0.8 * moss * (1 - 0.5 * soil)}>
        {Array.from({ length: 7 }, (_, k) => (
          <ellipse key={k} cx={random(`mm-x-${k}`) * 1080} cy={random(`mm-y-${k}`) * 1920} rx={120 + random(`mm-r-${k}`) * 160} ry={70 + random(`mm-q-${k}`) * 90} fill={MAT.moss} />
        ))}
      </g>
      {soil > 0.05
        ? Array.from({ length: 70 }, (_, k) => (
            <ellipse
              key={`p${k}`}
              cx={random(`pb-x-${k}`) * 1080}
              cy={random(`pb-y-${k}`) * 1920}
              rx={4 + random(`pb-r-${k}`) * 12}
              ry={3 + random(`pb-q-${k}`) * 8}
              fill={random(`pb-c-${k}`) > 0.5 ? MAT.pebble : MAT.soilDark}
              opacity={soil}
            />
          ))
        : null}
      {grass > 0.02
        ? Array.from({ length: 70 }, (_, k) => {
            const x = random(`mg-x-${k}`) * 1080;
            const y = random(`mg-y-${k}`) * 1920;
            if (x > X0 - 40 && x < X0 + M.w + 40 && y > Y0 - 40 && y < Y0 + M.h + 40) return null;
            const len = (26 + random(`mg-h-${k}`) * 40) * grass;
            const sway = Math.sin((frame / PERIOD.grassSway) * TAU + k) * 0.08;
            const col = random(`mg-c-${k}`) > 0.5 ? MAT.grassLight : MAT.grass;
            return (
              <g key={`g${k}`} transform={`translate(${x} ${y})`}>
                {Array.from({ length: 7 }, (__, b) => {
                  const a = (b / 7) * TAU + random(`mg-a-${k}-${b}`) * 0.6 + sway;
                  const l = len * (0.6 + random(`mg-l-${k}-${b}`) * 0.5);
                  return <path key={b} d={`M 0 0 Q ${Math.cos(a + 0.3) * l * 0.5} ${Math.sin(a + 0.3) * l * 0.5} ${Math.cos(a) * l} ${Math.sin(a) * l}`} stroke={col} strokeWidth={5} strokeLinecap="round" fill="none" />;
                })}
              </g>
            );
          })
        : null}
    </>
  );
};

/** Cable que sale del puerto inferior (mismas curvas que el cable del plano general). */
const MacroCable: React.FC<{ year: number }> = ({ year }) => {
  const gone = cableGone(year);
  if (gone >= 0.999) return null;
  const split = cableSplit(year);
  const frag = cableFragment(year);
  const jacket = mixColor(MAT.cableWhite, MAT.cableOld, cableYellow(year));
  const copper = mixColor(MAT.copper, MAT.verdigris, copperGreen(year));
  const d = `M ${M.cx} ${Y0 + M.h - 4} C ${M.cx} ${Y0 + M.h + 120}, ${M.cx + 160} ${Y0 + M.h + 160}, ${M.cx + 220} 1980`;
  const fragDash = frag > 0.001 ? `${9 - 6 * frag} ${6 * frag}` : undefined;
  return (
    <g opacity={1 - gone}>
      {split > 0.001 ? <path d={d} pathLength={100} fill="none" stroke={copper} strokeWidth={10} strokeLinecap="round" strokeDasharray={fragDash} /> : null}
      <path d={d} pathLength={100} fill="none" stroke={jacket} strokeWidth={22} strokeLinecap="round" strokeDasharray={split > 0.001 ? `${10 - 5 * split} ${5 * split}` : fragDash} strokeDashoffset={3} />
      <path d={d} pathLength={100} fill="none" stroke={MAT.black} strokeOpacity={0.55 * cableCracks(year)} strokeWidth={22} strokeDasharray="0.4 3.1" />
      <rect x={M.cx - 34} y={Y0 + M.h - 8} width={68} height={60} rx={14} fill={jacket} opacity={1 - frag} />
    </g>
  );
};

type Props = {
  uid: string;
  view: "top" | "side" | "fragment";
  year: number;
  frame: number;
  /** 0..1: foto encendida en la pantalla. */
  screen: number;
  /** 0..1: vista de rayos X del interior. */
  xray?: number;
  /** Fragmentación de la foto (metáfora): rango de frames o null. */
  decay?: { start: number; end: number } | null;
  /** Reflejo tenue de la foto en el vidrio negro (eco visual). */
  echo?: number;
  /** Destello que cruza el vidrio: 0..1 o null. */
  glint?: number | null;
  opacity: number;
  scale: number;
};

/** El celular en primer plano: el protagonista. */
export const PhoneMacro: React.FC<Props> = (p) => {
  if (p.opacity <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: p.opacity, transform: `scale(${p.scale})`, transformOrigin: `${M.cx}px ${M.cy}px` }}>
      {p.view === "side" ? <SideView {...p} /> : <TopView {...p} />}
      <MacroLight year={p.year} frame={p.frame} />
    </AbsoluteFill>
  );
};

const MacroLight: React.FC<{ year: number; frame: number }> = ({ year, frame }) => {
  const { day, exterior } = lightRegime(year);
  const lamp = lampOn(frame) * (1 - day);
  const dark = (0.5 - 0.25 * day) * (1 - exterior) * (1 - lamp) + 0.08 * exterior;
  return (
    <Svg>
      <rect width={1080} height={1920} fill={lightColor(year, frame)} opacity={0.2} style={{ mixBlendMode: "soft-light" }} />
      <rect width={1080} height={1920} fill={MAT.bg} opacity={dark} />
    </Svg>
  );
};

const TopView: React.FC<Props> = ({ uid, view, year, frame, screen, xray = 0, decay = null, echo = 0, glint = null }) => {
  const isFragment = view === "fragment";
  const dull = aluminumDull(year);
  const pits = aluminumPits(year);
  const loss = phoneBodyLoss(year);
  const swell = batterySwell(year);
  const d = Math.max(0, dust(year));
  const scratches = lramp(year, 20, 1000);
  const haze = lramp(year, 150, 1000);
  const soilCover = mound(year);
  const frameCol = mixColor(MAT.aluminum, MAT.aluminumDull, dull);
  const pulse = 1 + 0.04 * Math.sin((frame / PERIOD.screenPulse) * TAU);
  const rot = isFragment ? -5 : 0;
  return (
    <Svg>
      <Surface uid={uid} year={year} frame={frame} />
      <MacroCable year={year} />
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={22} />
        </filter>
        <clipPath id={`${uid}-glass`}>
          <rect x={0} y={0} width={GW} height={GH} rx={M.radius - M.inset} />
        </clipPath>
        <DustFilter id={`${uid}-dust`} seed={91} />
        <RoughFilter id={`${uid}-soil`} seed={93} scale={50} freq={0.03} />
        <linearGradient id={`${uid}-glint`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={MAT.specular} stopOpacity={0} />
          <stop offset="0.5" stopColor={MAT.specular} stopOpacity={0.8} />
          <stop offset="1" stopColor={MAT.specular} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${isFragment ? 0 : buzzOffset(frame)} 0) rotate(${rot} ${M.cx} ${M.cy})`}>
        <rect x={X0 + 18} y={Y0 + 30} width={M.w} height={M.h} rx={M.radius} fill={MAT.black} opacity={0.5} filter={`url(#${uid}-shadow)`} />
        {/* cuerpo y marco (se pierden con los siglos) */}
        {!isFragment ? (
          <g opacity={1 - loss}>
            <rect x={X0} y={Y0} width={M.w} height={M.h} rx={M.radius} fill={MAT.phoneBody} />
            <rect x={X0 + 5} y={Y0 + 5} width={M.w - 10} height={M.h - 10} rx={M.radius - 5} fill="none" stroke={frameCol} strokeWidth={10} />
            <rect x={X0 + 3} y={Y0 + 3} width={M.w - 6} height={M.h - 6} rx={M.radius - 3} fill="none" stroke={MAT.specular} strokeOpacity={0.35 * (1 - dull)} strokeWidth={2} />
            {Array.from({ length: 40 }, (_, i) => {
              if (random(`mp-on-${i}`) > pits) return null;
              const side = i % 4;
              const u = random(`mp-u-${i}`);
              const x = side === 0 ? X0 + 6 : side === 1 ? X0 + M.w - 6 : X0 + u * M.w;
              const y = side === 2 ? Y0 + 6 : side === 3 ? Y0 + M.h - 6 : Y0 + u * M.h;
              return <circle key={i} cx={x} cy={y} r={2.5 + random(`mp-r-${i}`) * 3} fill={MAT.phoneBody} />;
            })}
            <rect x={M.cx - 40} y={Y0 + M.h - 9} width={80} height={6} rx={3} fill={MAT.black} />
          </g>
        ) : (
          <g>
            {/* restos: un tramo de marco de aluminio doblado y un trozo de plástico */}
            <path d={`M ${X0 - 70} ${Y0 + M.h * 0.3} q 30 120 10 240 q -10 90 40 150`} fill="none" stroke={frameCol} strokeWidth={14} strokeLinecap="round" />
            <path d={`M ${X0 - 70} ${Y0 + M.h * 0.3} q 30 120 10 240`} fill="none" stroke={MAT.specular} strokeOpacity={0.15} strokeWidth={3} />
            <path d={`M ${X0 + M.w + 40} ${Y0 + M.h * 0.46} l 80 -18 l 30 62 l -70 34 z`} fill={MAT.plasticShard} />
            <rect x={X0 + M.w + 52} y={Y0 + M.h * 0.6} width={64} height={44} rx={8} fill={MAT.petCap} opacity={0.75} transform={`rotate(-18 ${X0 + M.w + 84} ${Y0 + M.h * 0.62})`} />
          </g>
        )}
        {/* vidrio */}
        <g transform={`translate(${GX} ${GY})`} clipPath={`url(#${uid}-glass)`}>
          <rect width={GW} height={GH} fill={MAT.glass} />
          <XRay uid={uid} amount={xray} />
          {xray > 0 ? <rect width={GW} height={GH} fill={MAT.glass} opacity={0.82 * (1 - xray)} /> : null}
          {screen > 0.001 ? (
            <foreignObject x={0} y={0} width={GW} height={GH} opacity={Math.min(1, screen * pulse)}>
              <div style={{ position: "relative", width: GW, height: GH }}>
                <DogScreen w={GW} h={GH} id={`${uid}-dog`} />
              </div>
            </foreignObject>
          ) : null}
          {echo > 0.001 ? (
            <foreignObject x={0} y={0} width={GW} height={GH} opacity={echo}>
              <div style={{ position: "relative", width: GW, height: GH }}>
                <DogScreen w={GW} h={GH} id={`${uid}-echo`} />
              </div>
            </foreignObject>
          ) : null}
          {decay ? <PhotoDecayGrid frame={frame} start={decay.start} end={decay.end} /> : null}
          <circle cx={GW / 2} cy={30} r={9} fill={MAT.black} opacity={0.9} />
          {/* reflejo especular de la ventana (22 %) */}
          <polygon points={`${GW * 0.08},${GH * 0.04} ${GW * 0.5},${GH * 0.02} ${GW * 0.3},${GH * 0.6} ${GW * -0.06},${GH * 0.68}`} fill={MAT.specular} opacity={(0.22 + 0.1 * haze) * (1 - screen * 0.7)} />
          {/* rayas y opacidad del vidrio con el tiempo */}
          <g opacity={scratches} stroke={MAT.scratch} strokeWidth={1.6} strokeLinecap="round">
            {Array.from({ length: 26 }, (_, i) => {
              const x = random(`sc-x-${i}`) * GW;
              const y = random(`sc-y-${i}`) * GH;
              const l = 40 + random(`sc-l-${i}`) * 160;
              const a = random(`sc-a-${i}`) * Math.PI;
              return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} opacity={0.35 + random(`sc-o-${i}`) * 0.4} />;
            })}
          </g>
          <rect width={GW} height={GH} fill={MAT.haze} opacity={0.18 * haze} />
          {d > 0.001 ? (
            <g opacity={d * 0.5}>
              <rect width={GW} height={GH} fill={MAT.dust} opacity={0.2} />
              <rect width={GW} height={GH} fill={MAT.dust} filter={`url(#${uid}-dust)`} />
            </g>
          ) : null}
          {glint !== null ? (
            <rect x={-GW * 1.2 + glint * GW * 2.6} y={-GH * 0.2} width={GW * 0.5} height={GH * 1.4} fill={`url(#${uid}-glint)`} transform={`rotate(-24 ${GW / 2} ${GH / 2})`} />
          ) : null}
          <rect x={0.75} y={0.75} width={GW - 1.5} height={GH - 1.5} rx={M.radius - M.inset} fill="none" stroke={MAT.specular} strokeOpacity={0.2 + 0.25 * loss} strokeWidth={2} />
        </g>
        {/* junta iluminada cuando la batería empuja el vidrio */}
        {swell > 0.01 && !isFragment ? <rect x={GX + 20} y={GY + GH - 3} width={GW - 40} height={5} fill={LIGHT.window} opacity={0.8 * swell * (1 - loss)} /> : null}
        {/* tierra que cubre el borde inferior */}
        {soilCover > 0.01 ? (
          <>
          <g filter={`url(#${uid}-soil)`}>
            <path
              d={`M ${X0 - 160} ${Y0 + M.h * (1 - 0.2 * soilCover)} C ${X0 + 120} ${Y0 + M.h * (1 - 0.26 * soilCover)}, ${X0 + 360} ${Y0 + M.h * (1 - 0.15 * soilCover)}, ${X0 + M.w + 160} ${Y0 + M.h * (1 - 0.24 * soilCover)} L ${X0 + M.w + 160} 2000 L ${X0 - 160} 2000 Z`}
              fill={MAT.soil}
            />
          </g>
          {Array.from({ length: 30 }, (_, k) => (
            <ellipse
              key={`sp${k}`}
              cx={X0 - 100 + random(`sp-x-${k}`) * (M.w + 200)}
              cy={Y0 + M.h * (1 - 0.14 * soilCover) + random(`sp-y-${k}`) * 260}
              rx={4 + random(`sp-r-${k}`) * 10}
              ry={3 + random(`sp-q-${k}`) * 7}
              fill={random(`sp-c-${k}`) > 0.5 ? MAT.pebble : MAT.soilDark}
              opacity={soilCover}
            />
          ))}
          </>
        ) : null}
      </g>
    </Svg>
  );
};

const SideView: React.FC<Props> = ({ uid, year, frame }) => {
  const S = LAYOUT.side;
  const swell = batterySwell(year);
  const dull = aluminumDull(year);
  const d = Math.max(0, dust(year));
  const len = S.x1 - S.x0;
  const lift = Math.tan((4 * swell * Math.PI) / 180) * len;
  const top = S.y - S.thick / 2;
  const frameCol = mixColor(MAT.aluminum, MAT.aluminumDull, dull);
  const tableTop = S.y + S.thick / 2;
  const wobble = Math.sin((frame / 90) * TAU) * 0.5;
  return (
    <Svg>
      <defs>
        <linearGradient id={`${uid}-sidebg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAT.wallTop} />
          <stop offset="1" stopColor={MAT.wallBottom} />
        </linearGradient>
        <GrainFilter id={`${uid}-sgrain`} seed={95} freq={0.5} opacity={0.08} />
        <DustFilter id={`${uid}-sdust`} seed={96} />
      </defs>
      <rect x={-50} y={-50} width={1180} height={tableTop + 50} fill={`url(#${uid}-sidebg)`} />
      <rect x={-50} y={tableTop} width={1180} height={2000} fill={mixColor(MAT.laminateLight, MAT.particle, 0.3)} filter={`url(#${uid}-sgrain)`} />
      <rect x={-50} y={tableTop} width={1180} height={10} fill={MAT.black} opacity={0.25} />
      <ellipse cx={(S.x0 + S.x1) / 2} cy={tableTop + 6} rx={len * 0.52} ry={14} fill={MAT.black} opacity={0.45} />
      {/* cuerpo */}
      <rect x={S.x0} y={top + 10} width={len} height={S.thick - 10} rx={14} fill={MAT.phoneBody} />
      <rect x={S.x0} y={top + 18} width={len} height={10} fill={frameCol} />
      <rect x={S.x0} y={top + 18} width={len} height={2} fill={MAT.specular} opacity={0.3 * (1 - dull)} />
      {/* batería hinchada que asoma por la separación */}
      {swell > 0.01 ? (
        <path
          d={`M ${S.x0 + 180} ${top + 10} Q ${S.x0 + len * 0.62} ${top + 10 - lift * 0.9} ${S.x1 - 40} ${top + 10 - lift * 0.55} L ${S.x1 - 40} ${top + 12} Z`}
          fill={MAT.pouch}
          stroke={MAT.pouchShade}
          strokeWidth={2}
        />
      ) : null}
      {/* vidrio: bisagra en el extremo izquierdo, se levanta hacia la derecha */}
      <g transform={`rotate(${-4 * swell + wobble * swell * 0.1} ${S.x0 + 8} ${top + 6})`}>
        <rect x={S.x0} y={top} width={len} height={11} rx={5} fill={MAT.glass} />
        <rect x={S.x0 + 10} y={top + 1} width={len - 20} height={2} fill={MAT.specular} opacity={0.4} />
        {d > 0.001 ? <rect x={S.x0} y={top - 3} width={len} height={5} fill={MAT.dust} filter={`url(#${uid}-sdust)`} opacity={d} /> : null}
      </g>
      {/* línea de luz en la junta */}
      {swell > 0.01 ? <path d={`M ${S.x1 - 30} ${top + 10} L ${S.x1 - 30} ${top + 10 - lift}`} stroke={LIGHT.window} strokeWidth={3} opacity={0.8 * swell} /> : null}
    </Svg>
  );
};
