import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { RoughFilter, Svg } from "../../../../canal/mil-anos/svg";
import { sink, walls } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const S = LAYOUT.sink;
const RIM = 11;
const IN = { x: S.x0 + RIM, y: S.y0 + RIM, w: S.x1 - S.x0 - 2 * RIM, h: S.y1 - S.y0 - 2 * RIM };

/** Bacha de acero (fondo): opaca → óxido superficial. Se dibuja ANTES del plato. */
export const SinkBasin: React.FC<KitchenProps> = ({ year }) => {
  const s = sink(year);
  const steel = interpolateColors(s.dull, [0, 1], [K.steel, K.steelDull]);
  return (
    <Svg>
      <defs>
        <linearGradient id="kc-basin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={K.steelDull} />
          <stop offset="0.45" stopColor={steel} />
          <stop offset="1" stopColor={steel} />
        </linearGradient>
        <RoughFilter id="kc-sink-rough" seed={81} scale={14} freq={0.07} />
      </defs>
      <rect x={S.x0} y={S.y0} width={S.x1 - S.x0} height={S.y1 - S.y0} rx={18} fill={steel} />
      <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={12} fill="url(#kc-basin)" />
      <rect x={IN.x} y={IN.y} width={IN.w} height={22} rx={10} fill={M.black} opacity={0.3} />
      <ellipse cx={S.x1 - 46} cy={S.y1 - 26} rx={14} ry={6} fill={M.gasket} />
      <g filter="url(#kc-sink-rough)" opacity={s.rust}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={IN.x + random(`sk-x-${i}`) * IN.w} cy={IN.y + 10 + random(`sk-y-${i}`) * (IN.h - 20)} rx={12 + random(`sk-r-${i}`) * 22} ry={6 + random(`sk-q-${i}`) * 8} fill={K.rust} opacity={0.7} />
        ))}
      </g>
    </Svg>
  );
};

/** Canilla detrás de la bacha (se oxida y se quiebra cuando cae la pared). */
export const Faucet: React.FC<KitchenProps> = ({ year }) => {
  const s = sink(year);
  const broken = lerp(walls(year).ruin, [0.2, 0.5], [0, 1]);
  const chrome = interpolateColors(s.rust, [0, 1], [K.steel, K.rust]);
  const F = LAYOUT.faucet;
  if (broken >= 0.999) return null;
  return (
    <Svg style={{ opacity: 1 - broken }}>
      <ellipse cx={F.x} cy={F.baseY} rx={22} ry={8} fill={chrome} />
      <path d={`M ${F.x} ${F.baseY} L ${F.x} ${F.baseY - 62} Q ${F.x} ${F.baseY - 90} ${F.x + 30} ${F.baseY - 90} Q ${F.x + 56} ${F.baseY - 90} ${F.x + 56} ${F.baseY - 62} L ${F.x + 56} ${F.baseY - 46}`} stroke={chrome} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={`M ${F.x - 4} ${F.baseY - 10} L ${F.x - 4} ${F.baseY - 62}`} stroke={M.specular} strokeWidth={3} opacity={0.4 * (1 - s.dull)} />
    </Svg>
  );
};

/** Tierra que llena la bacha (AÑO 200 → 1.000): tapa la mitad de abajo del plato; el borde azul queda a la vista. Va DESPUÉS del plato. */
export const SinkSoil: React.FC<KitchenProps> = ({ year, frame }) => {
  const s = sink(year);
  if (s.bury <= 0.001) return null;
  const level = lerp(s.bury, [0, 1], [IN.y + IN.h + 4, LAYOUT.plate.cy + 4]);
  const pts = Array.from({ length: 14 }, (_, i) => {
    const x = IN.x - 4 + (i / 13) * (IN.w + 8);
    return `${x.toFixed(1)} ${(level + (random(`ss-${i}`) - 0.5) * 8).toFixed(1)}`;
  });
  return (
    <Svg>
      <defs>
        <clipPath id="kc-sink-in">
          <rect x={IN.x} y={IN.y - 40} width={IN.w} height={IN.h + 40} rx={12} />
        </clipPath>
      </defs>
      <g clipPath="url(#kc-sink-in)">
        <path d={`M ${pts.join(" L ")} L ${IN.x + IN.w + 4} ${S.y1 + 20} L ${IN.x - 4} ${S.y1 + 20} Z`} fill={M.soil} />
        {Array.from({ length: 30 }, (_, i) => {
          const x = IN.x + random(`ssp-x-${i}`) * IN.w;
          const y = level + 4 + random(`ssp-y-${i}`) * 30;
          return <circle key={i} cx={x} cy={y} r={1.5 + random(`ssp-r-${i}`) * 2.5} fill={i % 2 ? M.pebble : M.soilLight} />;
        })}
        {Array.from({ length: 22 }, (_, i) => {
          const x = IN.x + random(`ssg-x-${i}`) * IN.w;
          if (Math.abs(x - LAYOUT.plate.cx) < 60) return null;
          const h = (10 + random(`ssg-h-${i}`) * 22) * lerp(s.bury, [0.5, 1], [0, 1]);
          const sway = Math.sin(frame / 19 + i) * 2;
          return <path key={`g-${i}`} d={`M ${x - 2} ${level + 2} Q ${x} ${level - h * 0.6} ${x + sway} ${level - h} Q ${x + 1} ${level - h * 0.5} ${x + 2} ${level + 2} Z`} fill={i % 3 ? M.grass : M.grassLight} />;
        })}
      </g>
      {/* borde delantero de la bacha, por encima de la tierra */}
      <rect x={S.x0} y={S.y1 - RIM} width={S.x1 - S.x0} height={RIM} rx={5} fill={interpolateColors(s.dull, [0, 1], [K.steel, K.steelDull])} />
    </Svg>
  );
};
