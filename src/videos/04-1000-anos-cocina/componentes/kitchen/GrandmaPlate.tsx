import React from "react";
import { interpolate, interpolateColors, random } from "remotion";
import { CLAMP, TAU } from "../../../../canal/mil-anos/anim";
import { RoughFilter, Svg } from "../../../../canal/mil-anos/svg";
import { plate } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const P = LAYOUT.plate;
const FLOWERS = 12;

/** Flor simple de 5 pétalos (vector original), aplanada por la perspectiva del plato. */
const Flower: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s} ${s * (P.ry / P.rx) * 1.25})`}>
    {[0, 1, 2, 3, 4].map((k) => (
      <ellipse key={k} cx={0} cy={-4.6} rx={3.1} ry={4.4} fill={K.plateBlue} transform={`rotate(${k * 72})`} />
    ))}
    <circle r={2.2} fill={K.plateWhite} />
  </g>
);

/**
 * El plato de la abuela, sin lavar en la pileta: restos de salsa, borde con flores azules.
 * Polvo → manchas → musgo encima desde AÑO 50 → semienterrado en AÑO 1.000, ENTERO; el borde azul sigue visible.
 * `glint` (0 → 1) cruza un destello especular por el esmalte. Siempre nítido: sin desenfoque.
 */
export const GrandmaPlate: React.FC<KitchenProps & { glint: number | null }> = ({ year, glint }) => {
  const p = plate(year);
  const sauce = interpolateColors(p.sauceDry, [0, 1], [K.sauce, M.stewDark]);
  const gx = glint === null ? null : interpolate(glint, [0, 1], [P.cx - P.rx * 1.6, P.cx + P.rx * 1.6], CLAMP);
  return (
    <Svg>
      <defs>
        <clipPath id="kc-plate-clip">
          <ellipse cx={P.cx} cy={P.cy} rx={P.rx} ry={P.ry} />
        </clipPath>
        <RoughFilter id="kc-sauce-rough" seed={91} scale={10} freq={0.09} />
        <RoughFilter id="kc-plate-moss" seed={92} scale={12} freq={0.08} />
        {gx !== null ? (
          <linearGradient id="kc-glint" gradientUnits="userSpaceOnUse" x1={gx - 40} y1={P.cy - 40} x2={gx + 40} y2={P.cy + 40}>
            <stop offset="0" stopColor={M.specular} stopOpacity={0} />
            <stop offset="0.5" stopColor={M.specular} stopOpacity={0.85} />
            <stop offset="1" stopColor={M.specular} stopOpacity={0} />
          </linearGradient>
        ) : null}
      </defs>
      <ellipse cx={P.cx + 6} cy={P.cy + 6} rx={P.rx} ry={P.ry} fill={M.black} opacity={0.3} />
      <ellipse cx={P.cx} cy={P.cy} rx={P.rx} ry={P.ry} fill={K.plateWhite} />
      <ellipse cx={P.cx} cy={P.cy + 2} rx={P.rx * 0.64} ry={P.ry * 0.62} fill={M.fridgeShade} opacity={0.28} />
      <ellipse cx={P.cx} cy={P.cy} rx={P.rx * 0.64} ry={P.ry * 0.62} fill="none" stroke={M.fridgeShade} strokeWidth={2} opacity={0.5} />
      {/* borde azul: filete + flores */}
      <ellipse cx={P.cx} cy={P.cy} rx={P.rx * 0.93} ry={P.ry * 0.93} fill="none" stroke={K.plateBlue} strokeWidth={2.6} />
      <ellipse cx={P.cx} cy={P.cy} rx={P.rx * 0.7} ry={P.ry * 0.7} fill="none" stroke={K.plateBlue} strokeWidth={1.6} opacity={0.8} />
      {Array.from({ length: FLOWERS }, (_, i) => {
        const a = (i / FLOWERS) * TAU;
        return <Flower key={i} x={P.cx + Math.cos(a) * P.rx * 0.815} y={P.cy + Math.sin(a) * P.ry * 0.815} s={1.05} />;
      })}
      <g clipPath="url(#kc-plate-clip)">
        {/* restos de salsa (se secan y se borran) */}
        <g filter="url(#kc-sauce-rough)" opacity={1 - p.sauceGone}>
          <ellipse cx={P.cx - 14} cy={P.cy + 2} rx={30} ry={10} fill={sauce} />
          <ellipse cx={P.cx + 22} cy={P.cy - 4} rx={14} ry={6} fill={sauce} />
          <ellipse cx={P.cx + 40} cy={P.cy + 12} rx={8} ry={4} fill={sauce} opacity={0.8} />
        </g>
        {/* polvo y manchas */}
        <ellipse cx={P.cx} cy={P.cy} rx={P.rx} ry={P.ry} fill={M.dust} opacity={0.22 * p.dust} />
        {Array.from({ length: 10 }, (_, i) => {
          if (random(`pl-st-${i}`) > p.stain) return null;
          const a = random(`pl-sa-${i}`) * TAU;
          const r = random(`pl-sr-${i}`) * 0.8;
          return <ellipse key={i} cx={P.cx + Math.cos(a) * P.rx * r} cy={P.cy + Math.sin(a) * P.ry * r} rx={4 + random(`pl-sz-${i}`) * 7} ry={2 + random(`pl-sy-${i}`) * 3} fill={M.waterStain} opacity={0.5} />;
        })}
        {/* brillo del esmalte */}
        <path d={`M ${P.cx - P.rx * 0.8} ${P.cy - P.ry * 0.35} Q ${P.cx - P.rx * 0.45} ${P.cy - P.ry * 0.95} ${P.cx} ${P.cy - P.ry * 0.96}`} stroke={M.specular} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55 * (1 - 0.6 * p.dust)} />
        {gx !== null ? <rect x={P.cx - P.rx} y={P.cy - P.ry} width={P.rx * 2} height={P.ry * 2} fill="url(#kc-glint)" /> : null}
      </g>
      {/* musgo encima (AÑO 50+), sobre el lado izquierdo: las flores de la derecha siguen a la vista */}
      {p.moss > 0.01 ? (
        <g filter="url(#kc-plate-moss)">
          <ellipse cx={P.cx - P.rx * 0.62} cy={P.cy - P.ry * 0.15} rx={34 * p.moss} ry={13 * p.moss} fill={M.moss} />
          <ellipse cx={P.cx - P.rx * 0.4} cy={P.cy - P.ry * 0.62} rx={22 * p.moss} ry={8 * p.moss} fill={M.mossLight} />
          <ellipse cx={P.cx - P.rx * 0.82} cy={P.cy + P.ry * 0.3} rx={16 * p.moss} ry={7 * p.moss} fill={M.moss} />
        </g>
      ) : null}
    </Svg>
  );
};
