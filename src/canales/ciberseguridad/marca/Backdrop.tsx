// Fondo «expediente nocturno» (§ 5.5): gradiente radial frío (elipse en 50 % / 30 %), viñeta y grano feTurbulence.
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR, GRAIN } from "./theme";

export const Backdrop: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at 50% 30%, ${COLOR.slateLit} 0%, ${COLOR.slate} 45%, ${COLOR.bg} 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 75% at 50% 42%, rgba(0,0,0,0) 55%, ${COLOR.black} 100%)`, opacity: 0.85 }} />
    <Grano f={f} />
  </AbsoluteFill>
);

export const Grano: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: GRAIN.opacity }}>
    <filter id="cdGrano" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={GRAIN.baseFrequency} numOctaves={2} seed={f % GRAIN.seeds} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#cdGrano)" />
  </svg>
);
