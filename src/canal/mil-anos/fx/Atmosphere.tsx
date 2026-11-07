import React from "react";
import { AbsoluteFill } from "remotion";
import { Svg } from "../svg";
import { SERIES_UI } from "../theme";

/**
 * Viñeta + grano animado de la serie (feTurbulence 0,9; semilla = grainSeed % 30; overlay) y oscurecido
 * radial alrededor de `focus` (revelación). `grainSeed` es explícito para que el loop cierre en el mismo grano.
 */
export const Atmosphere: React.FC<{ grainSeed: number; grain: number; darken: number; focus: { x: number; y: number }; focusR: number; vignette: number }> = ({
  grainSeed,
  grain,
  darken,
  focus,
  focusR,
  vignette,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Svg>
      <defs>
        <radialGradient id="mil-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor={SERIES_UI.black} stopOpacity={0} />
          <stop offset="1" stopColor={SERIES_UI.black} stopOpacity={0.75} />
        </radialGradient>
        <radialGradient id="mil-focus" gradientUnits="userSpaceOnUse" cx={focus.x} cy={focus.y} r={focusR}>
          <stop offset="0" stopColor={SERIES_UI.black} stopOpacity={0} />
          <stop offset="0.3" stopColor={SERIES_UI.black} stopOpacity={0} />
          <stop offset="1" stopColor={SERIES_UI.black} stopOpacity={1} />
        </radialGradient>
        <filter id="mil-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={((grainSeed % 30) + 30) % 30} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      {darken > 0 ? <rect width={1080} height={1920} fill="url(#mil-focus)" opacity={darken} /> : null}
      <rect width={1080} height={1920} fill="url(#mil-vignette)" opacity={vignette} />
    </Svg>
    <Svg style={{ mixBlendMode: "overlay", opacity: grain }}>
      <rect width={1080} height={1920} filter="url(#mil-grain)" />
    </Svg>
  </AbsoluteFill>
);
