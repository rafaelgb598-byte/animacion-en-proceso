import React from "react";
import { random } from "remotion";
import { rain } from "../../decay";
import { MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { Svg } from "../svg";

/** Lluvia (años 30–60): trazos finos que caen en diagonal. */
export const Rain: React.FC<SceneBaseProps> = ({ year, frame }) => {
  const r = rain(year);
  if (r <= 0.01) return null;
  return (
    <Svg style={{ opacity: 0.45 * r }}>
      {Array.from({ length: 110 }, (_, i) => {
        const speed = 70 + random(`rain-s-${i}`) * 40;
        const x0 = random(`rain-x-${i}`) * 1300 - 100;
        const y = ((random(`rain-y-${i}`) * 2200 + frame * speed) % 2200) - 200;
        const x = x0 - (y + 200) * 0.18;
        const len = 40 + random(`rain-l-${i}`) * 40;
        return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke={MAT.dust} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />;
      })}
    </Svg>
  );
};
