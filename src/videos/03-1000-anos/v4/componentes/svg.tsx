import React from "react";
import { MAT, VIDEO } from "../theme";

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

/** Textura estática de material (papel, laminado, tela) con semilla fija. */
export const GrainFilter: React.FC<{ id: string; seed: number; freq?: number; opacity?: number }> = ({
  id,
  seed,
  freq = 0.8,
  opacity = 0.07,
}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
    <feColorMatrix
      in="n"
      type="matrix"
      values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity * 6} ${-opacity * 2.4}`}
      result="a"
    />
    <feComposite in="a" in2="SourceGraphic" operator="in" result="g" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="g" />
    </feMerge>
  </filter>
);

/** Filtro de polvo: ruido fino claro (se usa sobre una forma con el color del polvo). */
export const DustFilter: React.FC<{ id: string; seed: number }> = ({ id, seed }) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={2.2} numOctaves={1} seed={seed} result="n" />
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.81  0 0 0 0 0.8  0 0 0 0 0.76  0 0 0 2.2 -1.0" result="a" />
    <feComposite in="a" in2="SourceAlpha" operator="in" />
  </filter>
);

/** Borde irregular (manchas, roturas): desplaza la forma con ruido. */
export const RoughFilter: React.FC<{ id: string; seed: number; scale?: number; freq?: number }> = ({
  id,
  seed,
  scale = 18,
  freq = 0.04,
}) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={seed} result="t" />
    <feDisplacementMap in="SourceGraphic" in2="t" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** Sombra de contacto: elipse con desenfoque que se ablanda con la luz difusa. */
export const ContactShadow: React.FC<{ cx: number; cy: number; rx: number; ry: number; soft: number; opacity: number; id: string }> = ({
  cx,
  cy,
  rx,
  ry,
  soft,
  opacity,
  id,
}) => (
  <>
    <defs>
      <filter id={id} x="-50%" y="-200%" width="200%" height="500%">
        <feGaussianBlur stdDeviation={soft} />
      </filter>
    </defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={MAT.black} opacity={opacity} filter={`url(#${id})`} />
  </>
);
