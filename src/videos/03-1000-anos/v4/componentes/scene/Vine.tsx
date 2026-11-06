import React from "react";
import { random } from "remotion";
import { lramp, vineGrowth } from "../../decay";
import { MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { Svg } from "../svg";

type Pt = readonly [number, number];

/** Enredadera que entra por la ventana y baja por la pared (dibujada con strokeDashoffset). */
export const Vine: React.FC<SceneBaseProps & { path: readonly Pt[]; branch: readonly Pt[] }> = ({ year, frame, path, branch }) => {
  const g = vineGrowth(year);
  const fallen = lramp(year, 42, 50);
  if (g <= 0.001 || fallen >= 0.999) return null;
  const toD = (pts: readonly Pt[]) =>
    pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      const mx = (prev[0] + p[0]) / 2;
      const my = (prev[1] + p[1]) / 2;
      return `${acc} Q ${prev[0]} ${prev[1]} ${mx} ${my}`;
    }, "");
  const leaves = (pts: readonly Pt[], growth: number, key: string) =>
    pts.slice(1).map((p, i) => {
      const at = (i + 1) / pts.length;
      const s = Math.min(1, Math.max(0, (growth - at + 0.08) / 0.08));
      if (s <= 0) return null;
      const rot = random(`${key}-r-${i}`) * 360;
      const sway = Math.sin((frame / 90) * Math.PI * 2 + i) * 4;
      return (
        <g key={`${key}-${i}`} transform={`translate(${p[0]} ${p[1]}) rotate(${rot + sway}) scale(${s})`}>
          <ellipse cx={14} cy={0} rx={16} ry={8} fill={MAT.vine} />
          <ellipse cx={-10} cy={6} rx={12} ry={6} fill={MAT.moss} transform="rotate(140)" />
        </g>
      );
    });
  const gb = Math.max(0, (g - 0.4) / 0.6);
  return (
    <Svg style={{ opacity: 1 - fallen }}>
      <path d={toD(path)} fill="none" stroke={MAT.vine} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
      <path d={toD(branch)} fill="none" stroke={MAT.vine} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - gb} />
      {leaves(path, g, "vine-a")}
      {leaves(branch, gb, "vine-b")}
    </Svg>
  );
};
