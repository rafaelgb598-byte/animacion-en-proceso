import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { Svg, poly } from "../../../../canal/mil-anos/svg";
import { kitchenWindow, walls } from "../../episodes/cocina.decay";
import { LAYOUT, M } from "../../theme";
import type { KitchenProps, Pt } from "./types";

const W = LAYOUT.window;
const HIT = { x: 662, y: 478 };

/** Vidrios que quedan pegados al marco después de la rotura (esquinas). */
const SHARDS_LEFT: Pt[][] = [
  [[W.x0 + 14, W.y0 + 14], [W.x0 + 90, W.y0 + 14], [W.x0 + 14, W.y0 + 120]],
  [[W.x0 + 14, W.y1 - 14], [W.x0 + 14, W.y1 - 110], [W.x0 + 70, W.y1 - 14]],
  [[W.x1 - 14, W.y0 + 14], [W.x1 - 14, W.y0 + 96], [W.x1 - 60, W.y0 + 14]],
  [[W.x1 - 14, W.y1 - 14], [W.x1 - 110, W.y1 - 14], [W.x1 - 14, W.y1 - 60]],
];

/** Ventana sobre la pileta: de noche, intacta → se rompe en AÑO 1 (entran lluvia y hojas) → el marco se pudre → cae con la pared. */
export const KitchenWindow: React.FC<KitchenProps> = ({ year }) => {
  const k = kitchenWindow(year);
  const ruin = walls(year).ruin;
  const gone = lerp(ruin, [0.35, 0.6], [0, 1]);
  if (gone >= 0.999) return null;
  const frameColor = interpolateColors(k.frameRot, [0, 1], [M.windowFrame, M.windowFrameOld]);
  const midX = (W.x0 + W.x1) / 2;
  const midY = W.y0 + (W.y1 - W.y0) * 0.45;
  const crackRays = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + random(`wc-a-${i}`) * 0.4;
    const len = 60 + random(`wc-l-${i}`) * 140;
    return [HIT.x + Math.cos(a) * len * k.crack, HIT.y + Math.sin(a) * len * k.crack] as const;
  });
  return (
    <Svg style={{ opacity: 1 - gone }}>
      {/* vidrio (antes de romperse) */}
      {k.broken < 1 ? <rect x={W.x0} y={W.y0} width={W.x1 - W.x0} height={W.y1 - W.y0} fill={M.glass} /> : null}
      {k.broken < 1 ? <path d={`M ${W.x0 + 30} ${W.y0 + 40} L ${W.x0 + 90} ${W.y0 + 20} L ${W.x0 + 40} ${W.y0 + 200} Z`} fill={M.glassEdge} opacity={0.25} /> : null}
      {/* rotura: grietas en estrella y vidrios en las esquinas */}
      {k.broken >= 1 ? (
        <>
          {SHARDS_LEFT.map((s, i) => (
            <path key={i} d={poly(s)} fill={M.glass} stroke={M.glassEdge} strokeWidth={2} />
          ))}
          <g stroke={M.glassEdge} strokeWidth={2.5} opacity={1 - lerp(k.crack, [0.6, 1], [0, 1])}>
            {crackRays.map(([x, y], i) => (
              <line key={i} x1={HIT.x} y1={HIT.y} x2={x} y2={y} />
            ))}
          </g>
        </>
      ) : null}
      {/* marco y travesaños */}
      <rect x={W.x0} y={W.y0} width={W.x1 - W.x0} height={W.y1 - W.y0} fill="none" stroke={frameColor} strokeWidth={16} />
      <line x1={midX} y1={W.y0} x2={midX} y2={W.y1} stroke={frameColor} strokeWidth={10} />
      <line x1={W.x0} y1={midY} x2={W.x1} y2={midY} stroke={frameColor} strokeWidth={10} />
      {/* alféizar */}
      <rect x={W.x0 - 22} y={W.y1} width={W.x1 - W.x0 + 44} height={20} fill={frameColor} />
      <rect x={W.x0 - 22} y={W.y1 + 20} width={W.x1 - W.x0 + 44} height={6} fill={M.black} opacity={0.3} />
      {/* astillas en el alféizar */}
      {k.broken >= 1
        ? Array.from({ length: 9 }, (_, i) => {
            const x = W.x0 + 10 + random(`ws-x-${i}`) * (W.x1 - W.x0 - 20);
            const y = W.y1 + 4 + random(`ws-y-${i}`) * 10;
            const s = 6 + random(`ws-s-${i}`) * 10;
            return <path key={i} d={poly([[x, y], [x + s, y + 2], [x + s * 0.3, y - s * 0.6]])} fill={M.glassEdge} opacity={0.8} />;
          })
        : null}
    </Svg>
  );
};
