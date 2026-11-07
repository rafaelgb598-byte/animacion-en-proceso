import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp, TAU } from "../../../../canal/mil-anos/anim";
import { RoughFilter } from "../../../../canal/mil-anos/svg";
import { banana, carton, flies, tupper } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const SH = LAYOUT.fridge.shelves;

/**
 * Comida ESTILIZADA (no realista): moho como manchas suaves redondeadas blanco verdosas, moscas como puntos de 3 px.
 * Nada de gusanos, carne cruda ni líquidos gráficos. Se dibuja dentro del <svg> de la heladera (hereda su caída).
 */
export const FoodItems: React.FC<KitchenProps> = ({ year, frame }) => {
  const b = banana(year);
  const c = carton(year);
  const t = tupper(year);
  const fl = flies(year);
  return (
    <g>
      <defs>
        <RoughFilter id="kc-food-rough" seed={52} scale={5} freq={0.08} />
      </defs>
      {/* banana (estante de arriba) */}
      {b.gone < 0.999 ? (
        <g opacity={1 - b.gone} transform={`translate(180 ${SH[0]}) scale(${1 - 0.45 * b.shrink} ${1 - 0.55 * b.shrink}) translate(-180 ${-SH[0]})`}>
          <path d={`M 104 ${SH[0] - 30} Q 180 ${SH[0] + 6} 258 ${SH[0] - 34} Q 252 ${SH[0] - 8} 180 ${SH[0] - 2} Q 120 ${SH[0] - 6} 104 ${SH[0] - 30} Z`} fill={interpolateColors(b.black, [0, 1], [K.banana, K.bananaBlack])} />
          <path d={`M 112 ${SH[0] - 26} Q 180 ${SH[0] - 2} 250 ${SH[0] - 30}`} stroke={M.black} strokeOpacity={0.15} strokeWidth={3} fill="none" />
          <rect x={252} y={SH[0] - 42} width={8} height={12} rx={3} fill={M.bananaStem} transform={`rotate(30 256 ${SH[0] - 36})`} />
          {Array.from({ length: 14 }, (_, i) => {
            if (random(`bs-on-${i}`) > b.spots) return null;
            const x = 122 + random(`bs-x-${i}`) * 120;
            return <circle key={i} cx={x} cy={SH[0] - 14 - Math.abs(x - 180) * 0.14 + random(`bs-y-${i}`) * 8} r={2.5 + random(`bs-r-${i}`) * 3.5} fill={M.bananaSpot} opacity={1 - b.black * 0.7} />;
          })}
        </g>
      ) : null}
      {/* cartón de leche (estante del medio) */}
      {c.gone < 0.999 ? (
        <g opacity={1 - lerp(c.gone, [0.6, 1], [0, 1])} transform={`translate(0 ${SH[1]}) scale(1 ${1 - 0.85 * c.gone}) translate(0 ${-SH[1]})`}>
          {(() => {
            const sw = 9 * c.swell;
            const lean = 14 * c.soft;
            const top = 902 + 26 * c.soft;
            const color = interpolateColors(c.soft, [0, 1], [M.carton, M.cartonWet]);
            const body = `M 236 ${SH[1]} Q ${230 - sw} 980 ${236 + lean * 0.5} ${top + 24} L ${306 + lean * 0.5} ${top + 24} Q ${312 + sw} 980 306 ${SH[1]} Z`;
            return (
              <>
                <path d={body} fill={color} filter={c.soft > 0.05 ? "url(#kc-food-rough)" : undefined} />
                <path d={`M ${236 + lean * 0.5} ${top + 24} L ${271 + lean} ${top} L ${306 + lean * 0.5} ${top + 24} Z`} fill={color} />
                <path d={`M ${266 + lean} ${top + 2} L ${276 + lean} ${top + 2} L ${276 + lean} ${top - 8} L ${266 + lean} ${top - 8} Z`} fill={color} />
                <rect x={238 - sw * 0.6} y={960} width={66 + sw * 1.2} height={34} fill={M.cartonBlue} opacity={1 - 0.5 * c.soft} />
                <path d="M 271 966 Q 262 980 271 986 Q 280 980 271 966 Z" fill={M.carton} opacity={1 - 0.5 * c.soft} />
              </>
            );
          })()}
        </g>
      ) : null}
      {c.gone > 0 ? <ellipse cx={270} cy={SH[1] - 2} rx={50} ry={6} fill={M.cartonWet} opacity={0.8 * c.gone * (1 - t.dried)} /> : null}
      {/* tupper con comida (estante de abajo) */}
      {t.fragment < 0.999 ? (
        <g>
          {(() => {
            const x0 = 100;
            const x1 = 252;
            const y1 = SH[2];
            const y0 = y1 - 62;
            const shell = interpolateColors(t.opaque, [0, 1], [M.tupper, M.tupperOld]);
            const food = interpolateColors(t.dried, [0, 1], [M.stew, M.stewDark]);
            const level = y1 - 44 * (1 - 0.55 * t.sink);
            const pieces = t.fragment;
            const split = (i: number) => (pieces > 0 ? `translate(${(i - 1.5) * 26 * pieces} ${8 * pieces * (i % 2)}) rotate(${(i - 1.5) * 10 * pieces} ${x0 + 38 * i + 19} ${y1})` : undefined);
            if (pieces > 0) {
              return [0, 1, 2, 3].map((i) => (
                <g key={i} transform={split(i)} opacity={1 - pieces * 0.3}>
                  <rect x={x0 + 38 * i} y={y0 + 8 + 6 * i} width={36} height={y1 - y0 - 8 - 6 * i} fill={shell} />
                </g>
              ));
            }
            return (
              <>
                <rect x={x0 + 4} y={level} width={x1 - x0 - 8} height={y1 - level - 4} rx={4} fill={food} />
                {Array.from({ length: 8 }, (_, i) => {
                  const r = (6 + random(`mo-r-${i}`) * 12) * t.mold;
                  if (r < 0.5) return null;
                  const x = x0 + 18 + random(`mo-x-${i}`) * (x1 - x0 - 36);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={level + 4} r={r} fill={i % 3 === 0 ? K.moldDark : K.mold} />
                      <circle cx={x - r * 0.3} cy={level + 1} r={r * 0.45} fill={K.mold} opacity={0.8} />
                    </g>
                  );
                })}
                <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={8} fill={shell} />
                <rect x={x0 - 4} y={y0 - 10} width={x1 - x0 + 8} height={14} rx={6} fill={M.tupperLid} opacity={1 - 0.4 * t.opaque} />
                <rect x={x0 + 8} y={y0 + 8} width={8} height={y1 - y0 - 20} rx={4} fill={M.specular} opacity={0.35 * (1 - t.opaque)} />
              </>
            );
          })()}
        </g>
      ) : null}
      {/* moscas: puntos de 3 px que dan vueltas */}
      {fl > 0.01
        ? Array.from({ length: 11 }, (_, i) => {
            const cx = i < 6 ? 180 : 176;
            const cy = i < 6 ? SH[0] - 50 : SH[2] - 90;
            const r = 26 + random(`fly-r-${i}`) * 50;
            const sp = 0.05 + random(`fly-s-${i}`) * 0.07;
            const ph = random(`fly-p-${i}`) * TAU;
            const x = cx + Math.cos(frame * sp * 2.3 + ph) * r;
            const y = cy + Math.sin(frame * sp * 3.1 + ph * 1.7) * r * 0.5;
            if (random(`fly-on-${i}`) > fl) return null;
            return <circle key={`fly-${i}`} cx={x} cy={y} r={1.6} fill={M.fly} />;
          })
        : null}
    </g>
  );
};
