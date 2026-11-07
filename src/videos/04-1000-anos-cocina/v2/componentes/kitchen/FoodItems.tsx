import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp, TAU } from "../../../../../canal/mil-anos/anim";
import { RoughFilter } from "../../../../../canal/mil-anos/svg";
import { banana, carton, flies, tupper } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const SH = LAYOUT.fridge.shelves;
const B = LAYOUT.food.banana;
const C = LAYOUT.food.carton;
const T = LAYOUT.food.tupper;

/**
 * Comida ESTILIZADA (no realista), pensada para leerse con el acercamiento a la heladera (2.2):
 * banana amarilla → manchada → negra; 5–7 manchas de moho redondeadas que crecen y se superponen; el cartón se abomba ±6 %;
 * 4–6 moscas de 3 px con trayectorias de random('mosca-i'). Nada de gusanos ni líquidos realistas.
 */
export const FoodItems: React.FC<KitchenProps> = ({ year, frame }) => {
  const b = banana(year);
  const c = carton(year);
  const t = tupper(year);
  const fl = flies(year);
  const bc = (B.x0 + B.x1) / 2;
  const bw = B.x1 - B.x0;
  const by = SH[0];
  return (
    <g>
      <defs>
        <RoughFilter id="kc2-food-rough" seed={52} scale={5} freq={0.08} />
      </defs>
      {/* banana (estante de arriba) */}
      {b.gone < 0.999 ? (
        <g opacity={1 - b.gone} transform={`translate(${bc} ${by}) scale(${1 - 0.45 * b.shrink} ${1 - 0.55 * b.shrink}) translate(${-bc} ${-by})`}>
          <path
            d={`M ${B.x0} ${by - 40} Q ${bc} ${by + 8} ${B.x1} ${by - 46} Q ${B.x1 - 8} ${by - 10} ${bc} ${by - 2} Q ${B.x0 + 20} ${by - 8} ${B.x0} ${by - 40} Z`}
            fill={interpolateColors(b.black, [0, 1], [K.banana, K.bananaBlack])}
          />
          <path d={`M ${B.x0 + 10} ${by - 34} Q ${bc} ${by - 4} ${B.x1 - 10} ${by - 40}`} stroke={M.black} strokeOpacity={0.18} strokeWidth={3} fill="none" />
          <rect x={B.x1 - 8} y={by - 58} width={10} height={16} rx={3} fill={M.bananaStem} transform={`rotate(30 ${B.x1 - 3} ${by - 50})`} />
          {Array.from({ length: 18 }, (_, i) => {
            if (random(`bs-on-${i}`) > b.spots) return null;
            const x = B.x0 + 20 + random(`bs-x-${i}`) * (bw - 40);
            const yy = by - 18 - Math.abs(x - bc) * 0.16 + random(`bs-y-${i}`) * 10;
            return <circle key={i} cx={x} cy={yy} r={3.5 + random(`bs-r-${i}`) * 5} fill={M.bananaSpot} opacity={1 - b.black * 0.7} />;
          })}
        </g>
      ) : null}
      {/* cartón de leche (estante del medio): se abomba ±6 % y se deshace */}
      {c.gone < 0.999 ? (
        <g opacity={1 - lerp(c.gone, [0.6, 1], [0, 1])} transform={`translate(0 ${SH[1]}) scale(1 ${1 - 0.85 * c.gone}) translate(0 ${-SH[1]})`}>
          {(() => {
            const w = C.x1 - C.x0;
            const sw = 0.06 * w * c.swell;
            const lean = 14 * c.soft;
            const h = 150;
            const top = SH[1] - h + 26 * c.soft;
            const mid = SH[1] - h * 0.45;
            const cx = (C.x0 + C.x1) / 2;
            const color = interpolateColors(c.soft, [0, 1], [M.carton, M.cartonWet]);
            const body = `M ${C.x0} ${SH[1]} Q ${C.x0 - 2 * sw} ${mid} ${C.x0 + lean * 0.5} ${top + 26} L ${C.x1 + lean * 0.5} ${top + 26} Q ${C.x1 + 2 * sw} ${mid} ${C.x1} ${SH[1]} Z`;
            return (
              <>
                <path d={body} fill={color} filter={c.soft > 0.05 ? "url(#kc2-food-rough)" : undefined} />
                <path d={`M ${C.x0 + lean * 0.5} ${top + 26} L ${cx + lean} ${top} L ${C.x1 + lean * 0.5} ${top + 26} Z`} fill={color} />
                <rect x={cx + lean - 6} y={top - 10} width={12} height={12} fill={color} />
                <rect x={C.x0 - sw} y={mid - 22} width={w + 2 * sw} height={40} fill={M.cartonBlue} opacity={1 - 0.5 * c.soft} />
                <path d={`M ${cx} ${mid - 16} Q ${cx - 10} ${mid} ${cx} ${mid + 8} Q ${cx + 10} ${mid} ${cx} ${mid - 16} Z`} fill={M.carton} opacity={1 - 0.5 * c.soft} />
              </>
            );
          })()}
        </g>
      ) : null}
      {c.gone > 0 ? <ellipse cx={(C.x0 + C.x1) / 2} cy={SH[1] - 2} rx={50} ry={6} fill={M.cartonWet} opacity={0.8 * c.gone * (1 - t.dried)} /> : null}
      {/* tupper con comida (estante del medio): moho que crece en 6 manchas superpuestas */}
      {t.fragment < 0.999 ? (
        <g>
          {(() => {
            const y1 = SH[1];
            const y0 = y1 - 74;
            const shell = interpolateColors(t.opaque, [0, 1], [M.tupper, M.tupperOld]);
            const food = interpolateColors(t.dried, [0, 1], [M.stew, M.stewDark]);
            const level = y1 - 54 * (1 - 0.55 * t.sink);
            const pieces = t.fragment;
            const w = T.x1 - T.x0;
            if (pieces > 0) {
              return [0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${(i - 1.5) * 24 * pieces} ${8 * pieces * (i % 2)}) rotate(${(i - 1.5) * 10 * pieces} ${T.x0 + (w / 4) * i + w / 8} ${y1})`} opacity={1 - pieces * 0.3}>
                  <rect x={T.x0 + (w / 4) * i} y={y0 + 8 + 6 * i} width={w / 4 - 3} height={y1 - y0 - 8 - 6 * i} fill={shell} />
                </g>
              ));
            }
            const spots = 6;
            return (
              <>
                <rect x={T.x0 + 4} y={level} width={w - 8} height={y1 - level - 4} rx={4} fill={food} />
                {Array.from({ length: spots }, (_, i) => {
                  // cada mancha nace un poco después y crece hasta superponerse con las vecinas
                  const k = lerp(t.mold, [i * 0.08, i * 0.08 + 0.55], [0, 1]);
                  const r = (8 + random(`mo-r-${i}`) * 12) * k;
                  if (r < 0.5) return null;
                  const x = T.x0 + 16 + ((i + 0.5) / spots) * (w - 32) + (random(`mo-x-${i}`) - 0.5) * 10;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={level + 6} r={r} fill={i % 3 === 0 ? K.moldDark : K.mold} />
                      <circle cx={x - r * 0.3} cy={level + 2} r={r * 0.5} fill={K.mold} opacity={0.85} />
                    </g>
                  );
                })}
                <rect x={T.x0} y={y0} width={w} height={y1 - y0} rx={8} fill={shell} />
                <rect x={T.x0 - 4} y={y0 - 10} width={w + 8} height={14} rx={6} fill={M.tupperLid} opacity={1 - 0.4 * t.opaque} />
                <rect x={T.x0 + 8} y={y0 + 8} width={8} height={y1 - y0 - 20} rx={4} fill={M.specular} opacity={0.35 * (1 - t.opaque)} />
              </>
            );
          })()}
        </g>
      ) : null}
      {/* moscas: 5 puntos de 3 px con trayectorias de random('mosca-i') */}
      {fl > 0.01
        ? Array.from({ length: 5 }, (_, i) => {
            if (random(`mosca-on-${i}`) > fl) return null;
            const nearBanana = i % 2 === 0;
            const cx = nearBanana ? bc : (T.x0 + T.x1) / 2;
            const cy = nearBanana ? by - 70 : SH[1] - 110;
            const r = 30 + random(`mosca-${i}`) * 40;
            const sp = 0.05 + random(`mosca-s-${i}`) * 0.06;
            const ph = random(`mosca-p-${i}`) * TAU;
            const x = cx + Math.cos(frame * sp * 2.3 + ph) * r;
            const y = cy + Math.sin(frame * sp * 3.1 + ph * 1.7) * r * 0.5;
            return <circle key={`mosca-${i}`} cx={x} cy={y} r={1} fill={M.fly} />;
          })
        : null}
    </g>
  );
};
