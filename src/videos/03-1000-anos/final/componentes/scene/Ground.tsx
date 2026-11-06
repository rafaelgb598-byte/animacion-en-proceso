import React from "react";
import { random } from "remotion";
import { floorMoss, floorSoil, grassGrowth, lramp, mound, mixColor } from "../../decay";
import { lerp } from "../../lib/anim";
import { LAYOUT, MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { GrainFilter, RoughFilter, Svg } from "../svg";

const TOP = LAYOUT.floorTop;
const VP = { x: 540, y: 560 };

/** Altura del borde superior del montículo en x (curva coseno). */
export const MOUND = { cx: 550, half: 500, base: 1600 } as const;
export const moundPeak = (year: number) => lerp(mound(year), [0, 0.3, 1], [1380, 1228, 1128]);
export const moundY = (x: number, year: number) => {
  const u = (x - MOUND.cx) / MOUND.half;
  if (Math.abs(u) >= 1) return MOUND.base;
  const c = Math.cos((u * Math.PI) / 2);
  return MOUND.base - (MOUND.base - moundPeak(year)) * c * c;
};
export const moundVisible = (year: number) => lramp(year, 50, 75);

/** Piso del cuarto: tablas en perspectiva → musgo → tierra. */
export const Floor: React.FC<SceneBaseProps> = ({ year }) => {
  const moss = floorMoss(year);
  const soil = floorSoil(year);
  const boards = Array.from({ length: 13 }, (_, i) => -900 + i * 240);
  return (
    <Svg>
      <defs>
        <GrainFilter id="uep-floor-grain" seed={21} freq={0.5} opacity={0.08} />
        <RoughFilter id="uep-moss-rough" seed={23} scale={50} freq={0.02} />
        <linearGradient id="uep-floor-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAT.black} stopOpacity={0.45} />
          <stop offset="0.35" stopColor={MAT.black} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-200} y={TOP} width={1480} height={2600} fill={mixColor(mixColor(MAT.floor, MAT.soil, soil), MAT.grass, 0.55 * grassGrowth(year))} filter="url(#uep-floor-grain)" />
      <g opacity={1 - soil} stroke={MAT.floorLine} strokeWidth={3}>
        {boards.map((x, i) => {
          const dx = x - VP.x;
          const t = (TOP - VP.y) / (2200 - VP.y);
          return <line key={i} x1={VP.x + dx * t} y1={TOP} x2={x} y2={2200} />;
        })}
      </g>
      <g filter="url(#uep-moss-rough)" opacity={0.75 * moss * (1 - 0.6 * soil)}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx={random(`moss-x-${i}`) * 1080}
            cy={TOP + 40 + random(`moss-y-${i}`) * 650}
            rx={(60 + random(`moss-rx-${i}`) * 160) * (0.4 + 0.6 * moss)}
            ry={(20 + random(`moss-ry-${i}`) * 50) * (0.4 + 0.6 * moss)}
            fill={MAT.moss}
          />
        ))}
      </g>
      <rect x={-200} y={TOP} width={1480} height={500} fill="url(#uep-floor-shade)" opacity={1 - 0.8 * grassGrowth(year)} />
    </Svg>
  );
};

/** Montículo de tierra delante del celular (sube con los siglos). */
export const Mound: React.FC<SceneBaseProps> = ({ year }) => {
  const vis = moundVisible(year);
  if (vis <= 0.001) return null;
  const pts: string[] = [];
  for (let x = MOUND.cx - MOUND.half - 40; x <= MOUND.cx + MOUND.half + 40; x += 20) pts.push(`${x},${moundY(x, year).toFixed(1)}`);
  const d = `M ${pts.join(" L ")} L ${MOUND.cx + MOUND.half + 40},2600 L ${MOUND.cx - MOUND.half - 40},2600 Z`;
  return (
    <Svg style={{ opacity: vis }}>
      <defs>
        <GrainFilter id="uep-soil-grain" seed={31} freq={0.9} opacity={0.12} />
        <linearGradient id="uep-mound-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAT.grass} stopOpacity={0.55} />
          <stop offset="0.12" stopColor={MAT.soil} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={d} fill={mixColor(MAT.soil, MAT.grass, 0.35 * grassGrowth(year))} filter="url(#uep-soil-grain)" />
      <path d={d} fill="url(#uep-mound-top)" opacity={lramp(year, 80, 300)} />
    </Svg>
  );
};
