import React from "react";
import { SERIES_UI, VIDEO } from "./theme";

/** SVG de cuadro completo en coordenadas de mundo (1080 × 1920). */
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg
    width={VIDEO.width}
    height={VIDEO.height}
    viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}
  >
    {children}
  </svg>
);

/** Textura estática de material (papel, madera, azulejo) con semilla fija. */
export const GrainFilter: React.FC<{ id: string; seed: number; freq?: number; opacity?: number }> = ({ id, seed, freq = 0.8, opacity = 0.07 }) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
    <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity * 6} ${-opacity * 2.4}`} result="a" />
    <feComposite in="a" in2="SourceGraphic" operator="in" result="g" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="g" />
    </feMerge>
  </filter>
);

/** Borde irregular (manchas, roturas, tierra): desplaza la forma con ruido. No desenfoca. */
export const RoughFilter: React.FC<{ id: string; seed: number; scale?: number; freq?: number }> = ({ id, seed, scale = 18, freq = 0.04 }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={seed} result="t" />
    <feDisplacementMap in="SourceGraphic" in2="t" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** Sombra de contacto (la única forma con desenfoque: es sombra, no dibujo). */
export const ContactShadow: React.FC<{ cx: number; cy: number; rx: number; ry: number; soft: number; opacity: number; id: string }> = ({ cx, cy, rx, ry, soft, opacity, id }) => (
  <>
    <defs>
      <filter id={id} x="-50%" y="-200%" width="200%" height="500%">
        <feGaussianBlur stdDeviation={soft} />
      </filter>
    </defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={SERIES_UI.black} opacity={opacity} filter={`url(#${id})`} />
  </>
);

/** Une puntos en un path cerrado. */
export const poly = (pts: readonly (readonly [number, number])[]) => `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
