import React from "react";
import { random } from "remotion";
import { lerp, TAU } from "../../../../../canal/mil-anos/anim";
import { RoughFilter, Svg, poly } from "../../../../../canal/mil-anos/svg";
import { floor, walls } from "../../episodes/cocina.decay";
import { LAYOUT, M } from "../../theme";
import type { KitchenProps, Pt } from "./types";

const SINK = LAYOUT.sink;

/**
 * Escombros del techo (AÑO 50): caen con demora escalonada y quedan en la mesada o en el piso, nunca dentro de la bacha
 * ni en el piso del carril de subtítulos (pantalla x 180–900 ↔ mundo x ≈ 250–820).
 */
const CHUNKS = Array.from({ length: 16 }, (_, i) => {
  let x = 30 + random(`rc-x-${i}`) * 1020;
  const onCounter = x > LAYOUT.counter.x0 && random(`rc-c-${i}`) > 0.45;
  if (onCounter && x > SINK.x0 - 30 && x < SINK.x1 + 30) x = x < (SINK.x0 + SINK.x1) / 2 ? SINK.x0 - 50 : SINK.x1 + 50;
  if (!onCounter && x > 230 && x < 840) x = x < 535 ? 230 - random(`rc-l-${i}`) * 150 : 840 + random(`rc-r-${i}`) * 200;
  return {
    x,
    y0: 20 + random(`rc-y-${i}`) * 180,
    y1: onCounter ? 800 + random(`rc-t-${i}`) * 80 : LAYOUT.floorTop + 10 + random(`rc-t-${i}`) * 80,
    s: 18 + random(`rc-s-${i}`) * 34,
    delay: random(`rc-d-${i}`) * 0.4,
    spin: (random(`rc-r-${i}`) - 0.5) * 400,
    light: i % 3 === 0,
  };
});

export const RoofDebris: React.FC<KitchenProps> = ({ year }) => {
  const w = walls(year);
  if (w.roofFall <= 0) return null;
  const f = floor(year);
  const cloud = w.roofFall < 1 ? Math.sin(Math.PI * w.roofFall) : 0;
  return (
    <Svg style={{ opacity: 1 - lerp(f.soil, [0.5, 0.9], [0, 1]) }}>
      <defs>
        <RoughFilter id="kc-debris-rough" seed={111} scale={8} freq={0.1} />
      </defs>
      <g filter="url(#kc-debris-rough)">
        {CHUNKS.map((c, i) => {
          const t = lerp(w.roofFall, [c.delay, Math.min(1, c.delay + 0.6)], [0, 1]);
          const y = c.y0 + (c.y1 - c.y0) * t * t;
          const pts: Pt[] = [
            [c.x - c.s, y - c.s * 0.4],
            [c.x + c.s * 0.6, y - c.s * 0.7],
            [c.x + c.s, y + c.s * 0.3],
            [c.x - c.s * 0.3, y + c.s * 0.6],
          ];
          return (
            <g key={i} transform={`rotate(${c.spin * t} ${c.x} ${y})`}>
              <path d={poly(pts)} fill={c.light ? M.debrisLight : M.debris} />
              <path d={poly(pts)} fill={M.moss} opacity={0.8 * f.moss} />
            </g>
          );
        })}
      </g>
      {cloud > 0
        ? Array.from({ length: 9 }, (_, i) => <circle key={`dc-${i}`} cx={60 + i * 120} cy={200 + (i % 3) * 120 + 400 * w.roofFall} r={90 + 120 * w.roofFall} fill={M.dust} opacity={0.18 * cloud} />)
        : null}
    </Svg>
  );
};

/** Borde de la tierra que lo cubre todo hacia el AÑO 1.000 (deja ver la mitad de arriba del plato y los pedazos de PET). */
const MOUND_TOP: readonly Pt[] = LAYOUT.moundTop;

export const moundEdge = (year: number): Pt[] => {
  const s = floor(year).soil;
  const k = Math.pow(s, 0.8);
  return MOUND_TOP.map(([x, y], i) => [x, lerp(k, [0, 1], [1980, y]) + (random(`me-${i}`) - 0.5) * 16 * k] as const);
};

/** Tierra, piedritas y pasto sobre todo lo que quedó (AÑO 100+). */
export const SoilMound: React.FC<KitchenProps> = ({ year, frame }) => {
  const f = floor(year);
  if (f.soil <= 0.001) return null;
  const edge = moundEdge(year);
  const d = `M ${edge.map(([x, y]) => `${x} ${y}`).join(" L ")} L 1120 2000 L -40 2000 Z`;
  const yAt = (x: number) => {
    for (let i = 1; i < edge.length; i++) {
      if (x <= edge[i][0]) {
        const [x0, y0] = edge[i - 1];
        const [x1, y1] = edge[i];
        return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      }
    }
    return edge[edge.length - 1][1];
  };
  return (
    <Svg>
      <defs>
        <RoughFilter id="kc-mound-rough" seed={121} scale={14} freq={0.05} />
      </defs>
      <path d={d} fill={M.soil} filter="url(#kc-mound-rough)" />
      <path d={d} fill={M.soilDark} opacity={0.4} transform="translate(0 40)" />
      {Array.from({ length: 60 }, (_, i) => {
        const x = random(`mp-x-${i}`) * 1080;
        const y = yAt(x) + 20 + random(`mp-y-${i}`) * 700;
        return <ellipse key={i} cx={x} cy={y} rx={3 + random(`mp-r-${i}`) * 7} ry={2 + random(`mp-q-${i}`) * 4} fill={i % 2 ? M.pebble : M.soilLight} />;
      })}
      {Array.from({ length: 260 }, (_, i) => {
        const deep = i % 2 === 1;
        // las del campo van en matas de 5 (comparten centro), las del borde sueltas
        const x = deep ? -20 + random(`mg-cx-${Math.floor(i / 10)}`) * 1120 + (random(`mg-x-${i}`) - 0.5) * 40 : -20 + random(`mg-x-${i}`) * 1120;
        if (!deep && x > SINK.x0 && x < SINK.x1) return null;
        const base = yAt(x) + 4 + (deep ? 60 + Math.pow(random(`mg-cy-${Math.floor(i / 10)}`), 0.7) * 760 + random(`mg-y-${i}`) * 12 : random(`mg-y-${i}`) * 40);
        const h = (20 + random(`mg-h-${i}`) * 50) * f.grass;
        if (h < 1) return null;
        const sway = Math.sin(frame / 24 + random(`mg-p-${i}`) * TAU) * 4 * f.grass;
        const w = 3 + random(`mg-w-${i}`) * 3;
        return <path key={`g-${i}`} d={`M ${x - w} ${base} Q ${x} ${base - h * 0.6} ${x + sway} ${base - h} Q ${x + 1} ${base - h * 0.5} ${x + w} ${base} Z`} fill={i % 3 ? M.grass : M.grassLight} />;
      })}
    </Svg>
  );
};

/** Enredadera sobre los restos de pared (AÑO 56+), dibujada con strokeDashoffset. */
const VINES: readonly (readonly Pt[])[] = LAYOUT.vines;

export const Vines: React.FC<KitchenProps> = ({ year, frame }) => {
  const g = walls(year).vine;
  if (g <= 0.001) return null;
  const toD = (pts: readonly Pt[]) => pts.reduce((acc, p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `${acc} Q ${pts[i - 1][0]} ${pts[i - 1][1]} ${(pts[i - 1][0] + p[0]) / 2} ${(pts[i - 1][1] + p[1]) / 2}`), "");
  return (
    <Svg>
      {VINES.map((v, k) => (
        <g key={k}>
          <path d={toD(v)} fill="none" stroke={M.vine} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
          {v.slice(1).map((p, i) => {
            const s = Math.min(1, Math.max(0, (g - (i + 1) / v.length + 0.1) / 0.1));
            if (s <= 0) return null;
            const sway = Math.sin(frame / 30 + i + k) * 5;
            return (
              <g key={i} transform={`translate(${p[0]} ${p[1]}) rotate(${random(`vn-${k}-${i}`) * 360 + sway}) scale(${s})`}>
                <ellipse cx={14} cy={0} rx={16} ry={8} fill={M.vine} />
                <ellipse cx={-10} cy={6} rx={12} ry={6} fill={M.moss} transform="rotate(140)" />
              </g>
            );
          })}
        </g>
      ))}
    </Svg>
  );
};

/** Insectos sobre el pasto (puntos que vuelan): mantienen vivo el plano del AÑO 1.000. */
export const Insects: React.FC<KitchenProps> = ({ year, frame }) => {
  const s = floor(year).grass;
  if (s <= 0.3) return null;
  return (
    <Svg style={{ opacity: lerp(s, [0.3, 0.6], [0, 1]) }}>
      {Array.from({ length: 9 }, (_, i) => {
        // sobre la mesada hundida y la pared en ruinas (fuera del carril de subtítulos)
        const cx = 160 + random(`in-x-${i}`) * 640;
        const cy = 620 + random(`in-y-${i}`) * 240;
        const sp = 0.03 + random(`in-s-${i}`) * 0.05;
        const x = cx + Math.cos(frame * sp * 2 + i) * 60;
        const y = cy + Math.sin(frame * sp * 3 + i * 2) * 26;
        return <circle key={i} cx={x} cy={y} r={2} fill={M.fly} />;
      })}
    </Svg>
  );
};
