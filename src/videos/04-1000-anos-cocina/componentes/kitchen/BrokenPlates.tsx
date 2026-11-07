import React from "react";
import { random as seeded } from "remotion";
import { OUT_CUBIC } from "../../../../canal/mil-anos/anim";
import { Svg, poly } from "../../../../canal/mil-anos/svg";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

/** Dónde caen y cómo vuelan los fragmentos de los 8 platos (semilla fija por plato). */
const shardField = () => {
  const S = LAYOUT.shards;
  const origin = { x: 790, y: 1340 };
  return Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => {
      const key = `plato-${i}-${j}`;
      const x = S.x0 + ((i + 0.5) / 8) * (S.x1 - S.x0) + (seeded(`${key}-x`) - 0.5) * 90;
      const y = S.y0 + seeded(`${key}-y`) * (S.y1 - S.y0);
      const s = 12 + seeded(`${key}-s`) * 18;
      const rot = seeded(`${key}-r`) * 360;
      return { x, y, s, rot, origin, edge: j % 2 === 0 };
    }),
  ).flat();
};

/** Fragmentos de los 8 platos en el piso: vuelan al caer la alacena, se ensucian y quedan enterrados. */
export const BrokenPlates: React.FC<KitchenProps & { scatter: number; dirt: number; bury: number }> = ({ scatter, dirt, bury }) => {
  if (scatter <= 0 || bury >= 0.999) return null;
  const t = OUT_CUBIC(scatter);
  const shards = shardField();
  const puff = scatter < 1 ? 1 - scatter : 0;
  return (
    <Svg style={{ opacity: 1 - bury }}>
      {shards.map((sh, i) => {
        const x = sh.origin.x + (sh.x - sh.origin.x) * t;
        const y = sh.origin.y + (sh.y - sh.origin.y) * t - Math.sin(Math.PI * t) * 40;
        const d = poly([
          [x, y - sh.s * 0.5],
          [x + sh.s, y + sh.s * 0.15],
          [x + sh.s * 0.2, y + sh.s * 0.4],
          [x - sh.s * 0.6, y + sh.s * 0.1],
        ]);
        return (
          <g key={i} transform={`rotate(${sh.rot * t} ${x} ${y})`}>
            <path d={d} fill={K.plateWhite} />
            {sh.edge ? <path d={d} fill="none" stroke={M.fridgeShade} strokeWidth={2} /> : null}
            <path d={d} fill={M.soilLight} opacity={0.7 * dirt} />
          </g>
        );
      })}
      {puff > 0
        ? Array.from({ length: 7 }, (_, i) => (
            <circle key={`p-${i}`} cx={660 + i * 50} cy={1350 - (i % 3) * 20} r={30 + 90 * scatter} fill={M.dust} opacity={0.22 * puff} />
          ))
        : null}
    </Svg>
  );
};
