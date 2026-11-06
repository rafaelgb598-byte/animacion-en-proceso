import React from "react";
import { AbsoluteFill } from "remotion";
import { MAT } from "../../theme";
import { Svg } from "../svg";
import { warpIntensity } from "./TimeFlicker";

/** Viñeta + grano animado (feTurbulence 0,9; seed = frame % 30; 0,05 → 0,08 en los saltos; overlay). */
export const Atmosphere: React.FC<{ frame: number; darken: number; focus: { x: number; y: number }; vignette: number }> = ({ frame, darken, focus, vignette }) => {
  const grain = 0.05 + 0.03 * warpIntensity(frame);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg>
        <defs>
          <radialGradient id="uep-vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor={MAT.black} stopOpacity={0} />
            <stop offset="1" stopColor={MAT.black} stopOpacity={0.75} />
          </radialGradient>
          <radialGradient id="uep-focus" gradientUnits="userSpaceOnUse" cx={focus.x} cy={focus.y} r={760}>
            <stop offset="0" stopColor={MAT.black} stopOpacity={0} />
            <stop offset="0.25" stopColor={MAT.black} stopOpacity={0} />
            <stop offset="1" stopColor={MAT.black} stopOpacity={1} />
          </radialGradient>
          <filter id="uep-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 30} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {darken > 0 ? <rect width={1080} height={1920} fill="url(#uep-focus)" opacity={darken} /> : null}
        <rect width={1080} height={1920} fill="url(#uep-vignette)" opacity={vignette} />
      </Svg>
      <Svg style={{ mixBlendMode: "overlay", opacity: grain }}>
        <rect width={1080} height={1920} filter="url(#uep-grain)" />
      </Svg>
    </AbsoluteFill>
  );
};
