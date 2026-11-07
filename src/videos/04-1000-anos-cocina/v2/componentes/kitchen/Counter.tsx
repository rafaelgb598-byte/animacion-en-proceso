import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../../canal/mil-anos/anim";
import { RoughFilter, Svg, poly } from "../../../../../canal/mil-anos/svg";
import { cabinets, dust } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const C = LAYOUT.counter;
/** Tres puertas iguales a lo ancho del bajo mesada. */
const DOOR_W = (C.x1 - C.x0 - 24) / 3;
const DOORS = [0, 1, 2].map((i) => [C.x0 + 12 + i * DOOR_W, C.x0 + 12 + (i + 1) * DOOR_W - 10] as const);

/** Mesada de piedra vista desde arriba (cámara alta) y bajo mesada de madera que se pudre. */
export const Counter: React.FC<KitchenProps> = ({ year }) => {
  const c = cabinets(year);
  const wood = interpolateColors(Math.min(1, 0.3 * c.swell + c.rot), [0, 1], [M.wood, M.woodRot]);
  const door = interpolateColors(Math.min(1, 0.3 * c.swell + c.rot), [0, 1], [M.woodLight, M.woodRot]);
  const cabinetsOp = 1 - lerp(c.rot, [0.55, 1], [0, 1]);
  const top = poly([
    [C.x0 + 14, C.backY],
    [C.x1 + 12, C.backY],
    [C.x1 + 12, C.frontY],
    [C.x0, C.frontY],
  ]);
  return (
    <Svg>
      <defs>
        <RoughFilter id="kc-counter-rough" seed={71} scale={22} freq={0.04} />
      </defs>
      {/* bajo mesada */}
      <g opacity={cabinetsOp}>
        <rect x={C.x0} y={C.lipY} width={C.x1 - C.x0 + 12} height={C.bottom - C.lipY} fill={wood} />
        {/* interior del mueble (se ve cuando se cae la puerta del medio) */}
        <rect x={DOORS[1][0] + 6} y={C.lipY + 14} width={DOORS[1][1] - DOORS[1][0] - 12} height={C.bottom - C.lipY - 34} fill={M.woodDark} />
        <rect x={DOORS[1][0] + 6} y={C.lipY + 14} width={DOORS[1][1] - DOORS[1][0] - 12} height={C.bottom - C.lipY - 34} fill={M.black} opacity={0.5} />
        {DOORS.map(([a, b], i) => {
          const sag = i === 1 ? 14 * c.rot : i === 2 ? 6 * c.rot : 0;
          // la puerta del medio se vence hacia la cámara y queda acostada en el piso (se aplana por la perspectiva)
          const g = i === 1 ? c.doorFall * c.doorFall : 0;
          const hinge = C.bottom - 18;
          const fallT = g > 0 ? ` translate(0 ${hinge + 150 * g}) scale(1 ${1 - 0.72 * g}) translate(0 ${-hinge})` : "";
          return (
            <g key={a} transform={`rotate(${sag * (1 - g)} ${a} ${C.lipY + 12})${fallT}`}>
              <rect x={a} y={C.lipY + 12} width={b - a} height={C.bottom - C.lipY - 30} rx={6} fill={door} />
              <rect x={a + 12} y={C.lipY + 24} width={b - a - 24} height={C.bottom - C.lipY - 54} rx={4} fill={M.black} opacity={0.08} />
              <rect x={i === 0 ? b - 34 : a + 22} y={C.lipY + 40} width={10} height={60} rx={5} fill={K.steel} opacity={1 - c.rot} />
            </g>
          );
        })}
        <rect x={C.x0} y={C.bottom - 16} width={C.x1 - C.x0 + 12} height={26} fill={M.black} opacity={0.45} />
        <rect x={C.x0} y={C.lipY} width={C.x1 - C.x0 + 12} height={C.bottom - C.lipY} fill={M.dust} opacity={0.2 * dust(year)} />
      </g>
      {/* superficie de piedra con vetas */}
      <path d={top} fill={M.counterTop} />
      {Array.from({ length: 90 }, (_, i) => (
        <circle key={i} cx={C.x0 + 20 + random(`ct-x-${i}`) * 690} cy={C.backY + 6 + random(`ct-y-${i}`) * 120} r={1.5 + random(`ct-r-${i}`) * 2} fill={M.counterFleck} />
      ))}
      <rect x={C.x0 + 14} y={C.backY} width={C.x1 - C.x0} height={6} fill={M.black} opacity={0.25} />
      <rect x={C.x0} y={C.frontY} width={C.x1 - C.x0 + 12} height={C.lipY - C.frontY} fill={M.counterEdge} />
      <rect x={C.x0} y={C.frontY} width={C.x1 - C.x0 + 12} height={3} fill={M.specular} opacity={0.15} />
      <path d={top} fill={M.dust} opacity={0.3 * dust(year)} />
      {/* grietas y musgo sobre la piedra */}
      <g stroke={M.wallCrack} strokeWidth={3} fill="none" opacity={c.countertopCrack}>
        <path d="M 420 780 L 470 830 L 455 896" />
        <path d="M 1000 774 L 960 840 L 985 898" />
      </g>
      <g filter="url(#kc-counter-rough)" opacity={c.moss}>
        <ellipse cx={460} cy={800} rx={60} ry={14} fill={M.moss} />
        <ellipse cx={960} cy={880} rx={90} ry={16} fill={M.mossLight} />
        <ellipse cx={850} cy={780} rx={50} ry={10} fill={M.moss} />
      </g>
    </Svg>
  );
};
