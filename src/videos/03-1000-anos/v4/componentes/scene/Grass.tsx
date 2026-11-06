import React from "react";
import { random } from "remotion";
import { flowers, grassGrowth } from "../../decay";
import { TAU } from "../../lib/anim";
import { LAYOUT, MAT } from "../../theme";
import { PERIOD } from "../../timeline";
import type { SceneBaseProps } from "../../types";
import { Svg } from "../svg";
import { MOUND, moundY } from "./Ground";

type Blade = { x: number; floorY: number; onMound: boolean; h: number; lean: number; phase: number; light: boolean; w: number };

const makeBlades = (count: number): Blade[] =>
  Array.from({ length: count }, (_, i) => {
    const onMound = i % 2 === 0;
    const x = onMound
      ? MOUND.cx + (random(`gm-${i}`) * 2 - 1) * MOUND.half * 0.95
      : -20 + random(`gx-${i}`) * 1120;
    const floorY = LAYOUT.floorTop + 10 + Math.pow(random(`gy-${i}`), 0.8) * 720;
    const depth = (floorY - LAYOUT.floorTop) / 720;
    return {
      x,
      floorY,
      onMound,
      h: (30 + random(`gh-${i}`) * 60) * (onMound ? 1 : 0.55 + depth * 0.45),
      lean: (random(`gl-${i}`) - 0.5) * 24,
      phase: random(`gp-${i}`) * TAU,
      light: random(`gc-${i}`) > 0.6,
      w: 3 + random(`gw-${i}`) * 3,
    };
  });

/** Pasto: todas las briznas en un solo <svg> (rendimiento). */
export const Grass: React.FC<SceneBaseProps & { count: number; flowerCount: number }> = ({ year, frame, count, flowerCount }) => {
  const g = grassGrowth(year);
  const fl = flowers(year);
  if (g <= 0.001) return null;
  const blades = makeBlades(count);
  return (
    <Svg>
      {blades.map((b, i) => {
        const baseY = b.onMound ? moundY(b.x, year) + 6 : b.floorY;
        const h = b.h * g;
        const sway = Math.sin((frame / PERIOD.grassSway) * TAU + b.phase) * 5 * g;
        const tipX = b.x + b.lean + sway;
        return (
          <path
            key={i}
            d={`M ${b.x - b.w} ${baseY} Q ${b.x + b.lean * 0.3} ${baseY - h * 0.6} ${tipX} ${baseY - h} Q ${b.x + b.lean * 0.4} ${baseY - h * 0.5} ${b.x + b.w} ${baseY} Z`}
            fill={b.light ? MAT.grassLight : MAT.grass}
          />
        );
      })}
      {fl > 0.001
        ? Array.from({ length: flowerCount }, (_, i) => {
            const x = MOUND.cx + (random(`fx-${i}`) * 2 - 1) * MOUND.half * 0.85;
            if (Math.abs(x - LAYOUT.fragment.x) < 90) return null;
            const baseY = moundY(x, year) + 10 + random(`fy-${i}`) * 60;
            const h = (50 + random(`fh-${i}`) * 50) * fl;
            const sway = Math.sin((frame / PERIOD.grassSway) * TAU + i) * 4;
            const r = 9 * fl;
            return (
              <g key={`f-${i}`}>
                <path d={`M ${x} ${baseY} Q ${x + 4} ${baseY - h / 2} ${x + sway} ${baseY - h}`} stroke={MAT.grass} strokeWidth={3} fill="none" />
                <g transform={`translate(${x + sway} ${baseY - h})`}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <ellipse key={k} cx={0} cy={-r * 0.8} rx={r * 0.5} ry={r * 0.9} fill={MAT.flower} transform={`rotate(${k * 72})`} />
                  ))}
                  <circle r={r * 0.45} fill={MAT.flowerCenter} />
                </g>
              </g>
            );
          })
        : null}
    </Svg>
  );
};
