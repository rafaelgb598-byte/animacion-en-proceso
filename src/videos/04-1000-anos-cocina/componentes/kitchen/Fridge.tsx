import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { ContactShadow, RoughFilter, Svg, poly } from "../../../../canal/mil-anos/svg";
import { dust, fridge } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const F = LAYOUT.fridge;
const I = F.inner;

/** Transformación de la caja: se aplasta y se tuerce (AÑO 150–450) apoyada en el piso. */
export const fridgeTransform = (year: number) => {
  const c = fridge(year).collapse;
  const sy = 1 - 0.42 * c;
  return `translate(0 ${F.bottom * (1 - sy)}) scale(1 ${sy}) skewX(${-4 * c})`;
};

/** Heladera: luz interior fría (parpadea y se apaga) → bisagras oxidadas → caja oxidada sin puerta → restos bajo tierra. */
export const Fridge: React.FC<KitchenProps & { light: number; children?: React.ReactNode }> = ({ year, light, children }) => {
  const f = fridge(year);
  const body = interpolateColors(f.rust, [0, 0.6, 1], [M.fridgeBody, M.fridgeShade, K.steelDull]);
  const inner = interpolateColors(light, [0, 1], [M.fridgeInnerDark, M.fridgeInner]);
  const dusty = dust(year);
  // manchas de óxido: muchas y chicas, que se juntan desde los bordes (no lunares)
  const spots = Array.from({ length: 40 }, (_, i) => {
    const edge = random(`fr-e-${i}`) > 0.45;
    const x = edge ? (random(`fr-s-${i}`) > 0.5 ? F.x0 + 10 : F.x1 - 14) + (random(`fr-x-${i}`) - 0.5) * 40 : F.x0 + 20 + random(`fr-x-${i}`) * (F.x1 - F.x0 - 40);
    return { x, y: F.top + 16 + random(`fr-y-${i}`) * (F.freezerBottom - F.top - 30), r: 5 + random(`fr-r-${i}`) * 16, at: random(`fr-a-${i}`) * 0.6 };
  });
  const sideSpots = Array.from({ length: 6 }, (_, i) => ({ x: F.x1 - 14, y: 760 + i * 90 + random(`frs-${i}`) * 40, r: 12 + random(`frs-r-${i}`) * 14 }));
  return (
    <Svg>
      <defs>
        <RoughFilter id="kc-fridge-rough" seed={41} scale={26} freq={0.05} />
        <linearGradient id="kc-fridge-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={K.fridgeLight} stopOpacity={0.85} />
          <stop offset="1" stopColor={K.fridgeLight} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <ContactShadow id="kc-fridge-shadow" cx={(F.x0 + F.x1) / 2 + 20} cy={F.bottom + 4} rx={210} ry={18} soft={10} opacity={0.5} />
      <g transform={fridgeTransform(year)}>
        {/* caja */}
        <rect x={F.x0} y={F.top} width={F.x1 - F.x0} height={F.bottom - F.top} rx={18} fill={body} />
        <rect x={F.x1 - 22} y={F.top + 10} width={14} height={F.bottom - F.top - 20} rx={7} fill={M.black} opacity={0.12} />
        {/* puerta del freezer (cerrada, con la receta y el imán) */}
        <rect x={F.x0 + 6} y={F.top + 6} width={F.x1 - F.x0 - 12} height={F.freezerBottom - F.top - 10} rx={14} fill={body} stroke={M.black} strokeOpacity={0.15} strokeWidth={3} />
        <rect x={F.x1 - 40} y={F.top + 60} width={12} height={150} rx={6} fill={K.steel} opacity={1 - 0.5 * f.rust} />
        {/* interior abierto */}
        <rect x={F.x0 + 8} y={F.freezerBottom + 4} width={F.x1 - F.x0 - 16} height={F.bottom - F.freezerBottom - 12} rx={10} fill={M.gasket} />
        <rect x={I.x0} y={I.y0} width={I.x1 - I.x0} height={I.y1 - I.y0} rx={6} fill={inner} />
        <rect x={I.x0} y={I.y0} width={I.x1 - I.x0} height={I.y1 - I.y0} rx={6} fill="url(#kc-fridge-glow)" opacity={light} />
        <rect x={I.x0} y={I.y0} width={I.x1 - I.x0} height={I.y1 - I.y0} rx={6} fill={K.rust} opacity={0.55 * f.rust} filter="url(#kc-fridge-rough)" />
        {/* lamparita */}
        <rect x={I.x1 - 70} y={I.y0 + 6} width={44} height={16} rx={6} fill={K.fridgeLight} opacity={0.4 + 0.6 * light} />
        {/* estantes de vidrio */}
        {F.shelves.map((y) => (
          <g key={y} opacity={1 - lerp(f.rust, [0.4, 1], [0, 0.8])}>
            <rect x={I.x0} y={y} width={I.x1 - I.x0} height={8} fill={M.shelf} />
            <rect x={I.x0} y={y} width={I.x1 - I.x0} height={2} fill={M.shelfEdge} />
          </g>
        ))}
        {children}
        {/* sombra interior para profundidad */}
        <rect x={I.x0} y={I.y0} width={22} height={I.y1 - I.y0} fill={M.black} opacity={0.12} />
        {/* óxido: bisagras (AÑO 5) y manchas (AÑO 10–60) */}
        <g filter="url(#kc-fridge-rough)">
          {[F.top + 18, F.freezerBottom - 14, F.freezerBottom + 18, F.bottom - 22].map((y) => (
            <circle key={y} cx={F.x0 + 8} cy={y} r={6 + 12 * f.hinge} fill={K.rust} opacity={f.hinge} />
          ))}
          {spots.map((s, i) => {
            const k = lerp(f.rust, [s.at, s.at + 0.4], [0, 1]);
            return k > 0 ? <circle key={i} cx={s.x} cy={s.y} r={s.r * (0.5 + k)} fill={K.rust} opacity={0.75 * k} /> : null;
          })}
          {sideSpots.map((s, i) => (
            <circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r * f.rust} fill={K.rust} opacity={0.8 * f.rust} />
          ))}
        </g>
        <rect x={F.x0} y={F.top} width={F.x1 - F.x0} height={F.freezerBottom - F.top} rx={18} fill={K.rust} opacity={0.3 * f.rust + 0.4 * f.collapse} />
        <rect x={F.x0} y={F.top} width={F.x1 - F.x0} height={14} rx={7} fill={M.dust} opacity={0.5 * dusty} />
      </g>
    </Svg>
  );
};

/** Puerta abierta hacia la cámara (bisagra izquierda): cae al piso cuando la caja se oxida (AÑO ~57). */
export const FridgeDoor: React.FC<KitchenProps & { light: number }> = ({ year, light }) => {
  const f = fridge(year);
  if (f.bury >= 0.98) return null;
  const g = f.doorFall * f.doorFall;
  const liner = interpolateColors(f.rust, [0, 1], [M.fridgeInner, K.steelDull]);
  const outer = interpolateColors(f.rust, [0, 1], [M.fridgeBody, K.steelDull]);
  const d = poly([
    [F.x0 + 2, F.freezerBottom + 8],
    [F.x0 + 2, F.bottom - 6],
    [-34, F.bottom + 40],
    [-34, F.freezerBottom - 34],
  ]);
  return (
    <Svg style={{ opacity: 1 - f.bury }}>
      <g transform={`translate(${30 * g} ${150 * g}) rotate(${-58 * g} 0 ${F.bottom + 30})`}>
        <path d={d} fill={outer} />
        <path d={poly([[F.x0 - 6, F.freezerBottom + 22], [F.x0 - 6, F.bottom - 20], [-24, F.bottom + 18], [-24, F.freezerBottom - 10]])} fill={liner} />
        <path d={poly([[F.x0 - 6, F.freezerBottom + 22], [F.x0 - 6, F.bottom - 20], [-24, F.bottom + 18], [-24, F.freezerBottom - 10]])} fill={K.fridgeLight} opacity={0.3 * light} />
        {[880, 1060, 1220].map((y) => (
          <path key={y} d={poly([[F.x0 - 6, y], [F.x0 - 6, y + 12], [-24, y + 26], [-24, y + 12]])} fill={M.shelfEdge} opacity={0.8 * (1 - f.rust)} />
        ))}
        <path d={d} fill={K.rust} opacity={0.6 * f.rust} />
      </g>
    </Svg>
  );
};

/** Imán redondo de la puerta del freezer: se queda en la puerta cuando la receta cae. */
export const FridgeMagnet: React.FC<KitchenProps> = ({ year }) => {
  const f = fridge(year);
  const m = LAYOUT.magnet;
  return (
    <Svg>
      <g transform={fridgeTransform(year)}>
        <circle cx={m.cx + 2} cy={m.cy + 3} r={m.r} fill={M.black} opacity={0.3} />
        <circle cx={m.cx} cy={m.cy} r={m.r} fill={interpolateColors(f.rust, [0, 1], [M.magnet, K.rust])} />
        <circle cx={m.cx - 5} cy={m.cy - 6} r={m.r * 0.35} fill={M.magnetHi} opacity={0.7 * (1 - f.rust)} />
      </g>
    </Svg>
  );
};
