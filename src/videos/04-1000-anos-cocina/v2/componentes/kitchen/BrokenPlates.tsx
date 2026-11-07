import React from "react";
import { random as seeded } from "remotion";
import { OUT_CUBIC } from "../../../../../canal/mil-anos/anim";
import { Svg, poly } from "../../../../../canal/mil-anos/svg";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

type Area = { x0: number; x1: number; y0: number; y1: number };

/**
 * Dónde caen los fragmentos de los 8 platos (semilla fija por plato): 5 sobre la mesada a la derecha de la bacha
 * y 3 en el piso a la derecha del carril de subtítulos (nunca dentro de la bacha: el plato de la abuela queda entero).
 */
const shardField = () => {
  const S = LAYOUT.shards;
  const areaOf = (i: number): Area => (i < 5 ? S.counter : S.floor);
  return Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => {
      const a = areaOf(i);
      const key = `plato-${i}-${j}`;
      const slot = i < 5 ? i / 5 : (i - 5) / 3;
      const span = i < 5 ? 1 / 5 : 1 / 3;
      const x = a.x0 + (slot + seeded(`${key}-x`) * span) * (a.x1 - a.x0);
      const y = a.y0 + seeded(`${key}-y`) * (a.y1 - a.y0);
      const s = 10 + seeded(`${key}-s`) * 14;
      const rot = seeded(`${key}-r`) * 360;
      return { x, y, s, rot, edge: j % 2 === 0 };
    }),
  ).flat();
};

/** Fragmentos de los 8 platos: vuelan al caer la alacena, se ensucian y quedan enterrados. */
export const BrokenPlates: React.FC<KitchenProps & { scatter: number; dirt: number; bury: number }> = ({ scatter, dirt, bury }) => {
  if (scatter <= 0 || bury >= 0.999) return null;
  const t = OUT_CUBIC(scatter);
  const o = LAYOUT.shards.origin;
  const shards = shardField();
  const puff = scatter < 1 ? 1 - scatter : 0;
  return (
    <Svg style={{ opacity: 1 - bury }}>
      {shards.map((sh, i) => {
        const x = o.x + (sh.x - o.x) * t;
        const y = o.y + (sh.y - o.y) * t - Math.sin(Math.PI * t) * 50;
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
        ? Array.from({ length: 6 }, (_, i) => <circle key={`p-${i}`} cx={o.x - 60 + i * 50} cy={o.y + 40 - (i % 3) * 20} r={24 + 70 * scatter} fill={M.dust} opacity={0.22 * puff} />)
        : null}
    </Svg>
  );
};
