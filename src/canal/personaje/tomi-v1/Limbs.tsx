import React from "react";
import { COLORS as C } from "../presets";
import type { ArmRig, HandShape, LegRig, Vec } from "../rig";

/**
 * Brazos, manos, piernas y zapatos.
 * Se dibujan a partir de las posiciones de las articulaciones que calcula el rig,
 * así cada segmento (hombro→codo→muñeca) se mueve de forma independiente.
 */

const poly = (pts: Vec[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const OUT = 11; // borde extra del contorno

/* ------------------------------ Manos ------------------------------ */

export const Hand: React.FC<{
  shape: HandShape;
  side: 1 | -1;
  shade?: boolean;
  layer?: "back" | "front";
}> = ({ shape, side, shade, layer = "back" }) => {
  const skin = shade ? C.skinShade : C.skin;
  const s = { fill: skin, stroke: C.line, strokeWidth: 5, strokeLinejoin: "round" as const };
  // +y = dirección del antebrazo
  if (shape === "hold") {
    if (layer === "back") return <circle cx={0} cy={14} r={15} {...s} />;
    return (
      <g>
        <rect x={-14} y={2} width={28} height={30} rx={13} {...s} />
        <path d="M -6 9 L -6 24 M 3 8 L 3 25" stroke={C.skinShade} strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  }
  if (layer === "front" || shape === "none") return null;
  if (shape === "fist") {
    return (
      <g>
        <circle cx={0} cy={13} r={15} {...s} />
        <path d={`M ${side * 4} 6 Q ${side * 12} 12 ${side * 6} 20`} stroke={C.skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (shape === "point" || shape === "chin") {
    const len = shape === "point" ? 44 : 32;
    return (
      <g>
        <rect x={-6} y={12} width={12} height={len} rx={6} {...s} />
        <circle cx={0} cy={13} r={15} {...s} />
        <ellipse cx={side * 13} cy={8} rx={6} ry={9} transform={`rotate(${side * -25} ${side * 13} 8)`} {...s} />
      </g>
    );
  }
  if (shape === "reach") {
    // mano abierta y extendida antes de agarrar (los dedos se separan)
    return (
      <g>
        <ellipse cx={side * 17} cy={8} rx={6.5} ry={12} transform={`rotate(${side * -50} ${side * 17} 8)`} {...s} />
        {[-9, 0, 9].map((x, i) => (
          <rect key={i} x={x - 5} y={22} width={10} height={24 - Math.abs(x) * 0.5} rx={5} transform={`rotate(${x * 0.9} ${x} 22)`} {...s} />
        ))}
        <rect x={-15} y={2} width={30} height={28} rx={13} {...s} />
      </g>
    );
  }
  if (shape === "open") {
    return (
      <g>
        <ellipse cx={side * 15} cy={10} rx={6.5} ry={11} transform={`rotate(${side * -38} ${side * 15} 10)`} {...s} />
        <rect x={-15} y={3} width={30} height={36} rx={14} {...s} />
        <path d="M -6 26 L -6 37 M 1 27 L 1 38 M 8 26 L 8 36" stroke={C.skinShade} strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  }
  // relaxed
  return (
    <g>
      <ellipse cx={side * 11} cy={8} rx={5.5} ry={9} transform={`rotate(${side * -20} ${side * 11} 8)`} {...s} />
      <ellipse cx={0} cy={15} rx={14} ry={17} {...s} />
    </g>
  );
};

/* ------------------------------ Brazo ------------------------------ */

export const Arm: React.FC<{
  rig: ArmRig;
  hand: HandShape;
  shade?: boolean;
  side: 1 | -1;
  /** objeto sostenido, dibujado entre la palma y los dedos (coordenadas locales del personaje) */
  prop?: React.ReactNode;
  /** V3: transición suave hacia otra forma de mano */
  handNext?: HandShape;
  handMix?: number;
}> = ({ rig, hand, shade, side, prop, handNext, handMix = 0 }) => {
  const skin = shade ? C.skinShade : C.skin;
  const shirt = shade ? C.shirtShade : C.shirt;
  const path = poly([rig.sh, rig.el, rig.wr]);
  const sleeveEnd = lerpV(rig.sh, rig.el, 0.55);
  const sleeve = poly([rig.sh, sleeveEnd]);
  const handTf = `translate(${rig.wr.x},${rig.wr.y}) rotate(${-rig.handAng})`;
  return (
    <g>
      <path d={path} stroke={C.line} strokeWidth={22 + OUT} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={skin} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleeve} stroke={C.line} strokeWidth={34 + OUT} fill="none" strokeLinecap="round" />
      <path d={sleeve} stroke={shirt} strokeWidth={34} fill="none" strokeLinecap="round" />
      <g transform={handTf}>
        {handNext && handMix > 0.001 ? (
          <>
            <g opacity={handMix > 0.8 ? (1 - handMix) * 5 : 1}>
              <Hand shape={hand} side={side} shade={shade} layer="back" />
            </g>
            <g opacity={Math.min(1, handMix * 1.6)} transform={`scale(${0.9 + 0.1 * handMix})`}>
              <Hand shape={handNext} side={side} shade={shade} layer="back" />
            </g>
          </>
        ) : (
          <Hand shape={hand} side={side} shade={shade} layer="back" />
        )}
      </g>
      {prop ? <g transform={`translate(${rig.palm.x},${rig.palm.y})`}>{prop}</g> : null}
      {hand === "hold" ? (
        <g transform={handTf}>
          <Hand shape={hand} side={side} shade={shade} layer="front" />
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------ Pierna ------------------------------ */

export const Shoe: React.FC<{ shade?: boolean }> = ({ shade }) => (
  <g>
    <path
      d="M -16 -8 Q -22 14 -6 20 L 44 20 Q 58 18 52 2 Q 44 -14 14 -14 Q -8 -14 -16 -8 Z"
      fill={shade ? C.shoeShade : C.shoe}
      stroke={C.line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d="M -16 12 L 54 12" stroke={C.sole} strokeWidth={7} strokeLinecap="round" />
    <path d="M -19 20 L 50 20" stroke={C.line} strokeWidth={5} strokeLinecap="round" />
    <circle cx={18} cy={-4} r={3} fill={C.sole} />
  </g>
);

export const Leg: React.FC<{ rig: LegRig; foot: number; shade?: boolean }> = ({ rig, foot, shade }) => {
  const path = poly([rig.hip, rig.knee, rig.ankle]);
  return (
    <g>
      <path d={path} stroke={C.line} strokeWidth={34 + OUT} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={path}
        stroke={shade ? C.pantsShade : C.pants}
        strokeWidth={34}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform={`translate(${rig.ankle.x},${rig.ankle.y + 4}) rotate(${foot})`}>
        <Shoe shade={shade} />
      </g>
    </g>
  );
};
