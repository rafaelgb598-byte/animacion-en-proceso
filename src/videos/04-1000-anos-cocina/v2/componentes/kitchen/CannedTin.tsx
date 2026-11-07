import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../../canal/mil-anos/anim";
import { ContactShadow, RoughFilter, Svg } from "../../../../../canal/mil-anos/svg";
import { dust, tin } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const T = LAYOUT.tin;

/** Lata de conserva (hojalata, etiqueta genérica sin marca): óxido desde AÑO 2 → perforada hacia AÑO 50 → desaparece. */
export const CannedTin: React.FC<KitchenProps> = ({ year }) => {
  const t = tin(year);
  const x0 = T.cx - T.w / 2;
  const top = T.bottom - T.h;
  const metal = interpolateColors(t.rust, [0, 1], [K.steel, K.rust]);
  const sink = lerp(t.gone, [0, 1], [1, 0.25]);
  const op = 1 - lerp(t.gone, [0.7, 1], [0, 1]);
  return (
    <Svg>
      <defs>
        <RoughFilter id="kc-tin-rough" seed={101} scale={10 + 20 * t.gone} freq={0.07} />
        <linearGradient id="kc-tin-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={M.black} stopOpacity={0.35} />
          <stop offset="0.35" stopColor={M.black} stopOpacity={0} />
          <stop offset="0.7" stopColor={M.specular} stopOpacity={0.18} />
          <stop offset="1" stopColor={M.black} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      {/* marca de óxido que queda en la piedra */}
      <ellipse cx={T.cx} cy={T.bottom} rx={T.w * 0.55} ry={9} fill={K.rust} opacity={0.5 * t.gone} />
      {op > 0.001 ? (
        <g opacity={op} transform={`translate(0 ${T.bottom}) scale(1 ${sink}) translate(0 ${-T.bottom})`} filter={t.gone > 0.02 ? "url(#kc-tin-rough)" : undefined}>
          <ContactShadow id="kc-tin-shadow" cx={T.cx + 8} cy={T.bottom + 2} rx={T.w * 0.62} ry={8} soft={4} opacity={0.45} />
          <rect x={x0} y={top} width={T.w} height={T.h} fill={metal} />
          {/* etiqueta genérica: franjas y un óvalo liso */}
          <g opacity={1 - t.label}>
            <rect x={x0} y={top + 16} width={T.w} height={T.h - 32} fill={M.tinLabel} />
            <rect x={x0} y={top + 24} width={T.w} height={6} fill={M.tinStripe} />
            <rect x={x0} y={T.bottom - 30} width={T.w} height={6} fill={M.tinStripe} />
            <ellipse cx={T.cx} cy={top + T.h / 2} rx={18} ry={14} fill={M.paper} opacity={0.85} />
          </g>
          <rect x={x0} y={top} width={T.w} height={T.h} fill="url(#kc-tin-shade)" />
          {/* óxido */}
          <g opacity={t.rust}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={x0 + random(`tn-x-${i}`) * T.w} cy={top + random(`tn-y-${i}`) * T.h} rx={6 + random(`tn-r-${i}`) * 14 * t.rust} ry={5 + random(`tn-q-${i}`) * 10 * t.rust} fill={K.rust} />
            ))}
          </g>
          {/* perforaciones */}
          {Array.from({ length: 5 }, (_, i) => {
            const r = (3 + random(`th-r-${i}`) * 7) * t.holes;
            if (r < 0.4) return null;
            return <circle key={`h-${i}`} cx={x0 + 14 + random(`th-x-${i}`) * (T.w - 28)} cy={top + 20 + random(`th-y-${i}`) * (T.h - 40)} r={r} fill={M.black} stroke={K.rust} strokeWidth={2} />;
          })}
          {/* tapa */}
          <ellipse cx={T.cx} cy={top} rx={T.w / 2} ry={10} fill={interpolateColors(t.rust, [0, 1], [M.tinTop, K.rust])} />
          <ellipse cx={T.cx} cy={top} rx={T.w / 2 - 6} ry={7} fill="none" stroke={M.black} strokeOpacity={0.2} strokeWidth={2} />
          <ellipse cx={T.cx} cy={top} rx={T.w / 2} ry={10} fill={M.dust} opacity={0.4 * dust(year)} />
        </g>
      ) : null}
    </Svg>
  );
};
