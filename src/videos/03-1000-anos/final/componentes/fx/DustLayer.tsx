import React from "react";
import { MAT } from "../../theme";
import { DustFilter } from "../svg";

/** Polvo de superficie sobre una forma (opacidad = dust(year)). Se usa dentro de un <svg>. */
export const DustLayer: React.FC<{ id: string; seed: number; d: string; opacity: number }> = ({ id, seed, d, opacity }) => {
  if (opacity <= 0.001) return null;
  return (
    <g opacity={opacity * 0.7}>
      <defs>
        <DustFilter id={id} seed={seed} />
      </defs>
      <path d={d} fill={MAT.dust} opacity={0.12} />
      <path d={d} fill={MAT.dust} filter={`url(#${id})`} />
    </g>
  );
};
