import React from "react";
import { random } from "remotion";
import { lerp } from "../../../../../canal/mil-anos/anim";
import { Svg, poly } from "../../../../../canal/mil-anos/svg";
import { daylight, leaves, moonBeam, rain } from "../../episodes/cocina.decay";
import { K, LAYOUT, M, MASK } from "../../theme";
import type { KitchenProps } from "./types";

const W = LAYOUT.window;
const POOL = LAYOUT.fridgePool;
const BEAM = poly(LAYOUT.moonBeam);

/**
 * Luz de la cocina por régimen (v2): heladera abierta (fría, `light` 1 → parpadea → 0 en f40) → noche con luna
 * → día verdoso y difuso por el techo caído (AÑO 50+). El haz de luna tiene bordes suaves (desenfoque de 24 px
 * sobre la LUZ, nunca sobre el dibujo), opacidad máxima 0,18, no cruza la heladera y se apaga con el techo.
 */
export const KitchenLight: React.FC<KitchenProps & { light: number }> = ({ year, light }) => {
  const day = daylight(year);
  const night = (1 - light) * (1 - day);
  const beam = 0.18 * night * moonBeam(year);
  return (
    <>
      <Svg>
        <defs>
          <radialGradient id="kc2-pool-dark" gradientUnits="userSpaceOnUse" cx={POOL.x} cy={POOL.y} r={POOL.r}>
            <stop offset="0" stopColor={M.night} stopOpacity={0} />
            <stop offset="0.22" stopColor={M.night} stopOpacity={0.1} />
            <stop offset="0.55" stopColor={M.night} stopOpacity={0.55} />
            <stop offset="1" stopColor={M.night} stopOpacity={0.8} />
          </radialGradient>
          <mask id="kc2-night-mask">
            <rect x={-200} y={-200} width={1500} height={2400} fill={MASK.show} />
            <rect x={W.x0} y={W.y0} width={W.x1 - W.x0} height={W.y1 - W.y0} fill={MASK.hide} />
          </mask>
        </defs>
        {light > 0.001 ? <rect x={-200} y={-200} width={1500} height={2400} fill="url(#kc2-pool-dark)" opacity={light} /> : null}
        {night > 0.001 ? <rect x={-200} y={-200} width={1500} height={2400} fill={M.night} opacity={0.56 * night} mask="url(#kc2-night-mask)" /> : null}
        {day > 0.001 ? <rect x={-200} y={-200} width={1500} height={2400} fill={M.night} opacity={0.08 * day} /> : null}
      </Svg>
      {/* tintes de color de cada luz */}
      <Svg style={{ mixBlendMode: "screen" }}>
        <defs>
          <radialGradient id="kc2-pool-tint" gradientUnits="userSpaceOnUse" cx={POOL.x} cy={POOL.y} r={POOL.r * 0.75}>
            <stop offset="0" stopColor={K.fridgeLight} stopOpacity={0.32} />
            <stop offset="1" stopColor={K.fridgeLight} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="kc2-day-tint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={M.day} stopOpacity={0.3} />
            <stop offset="1" stopColor={M.day} stopOpacity={0.06} />
          </linearGradient>
          <filter id="kc2-beam-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={24} />
          </filter>
          <clipPath id="kc2-beam-clip">
            <rect x={LAYOUT.beamClipX} y={-200} width={1500} height={2400} />
          </clipPath>
        </defs>
        {light > 0.001 ? <rect x={-200} y={-200} width={1500} height={2400} fill="url(#kc2-pool-tint)" opacity={light} /> : null}
        {beam > 0.001 ? (
          <g clipPath="url(#kc2-beam-clip)">
            <path d={BEAM} fill={K.moonLight} opacity={beam} filter="url(#kc2-beam-soft)" />
          </g>
        ) : null}
        {day > 0.001 ? <rect x={-200} y={-200} width={1500} height={2400} fill="url(#kc2-day-tint)" opacity={day} /> : null}
      </Svg>
    </>
  );
};

/** Lluvia: afuera, vista por la ventana, y ráfagas que entran por el vidrio roto (AÑO 1 → 13). */
export const KitchenRain: React.FC<KitchenProps> = ({ year, frame }) => {
  const r = rain(year);
  if (r <= 0.01) return null;
  return (
    <Svg style={{ opacity: r }}>
      <defs>
        <clipPath id="kc-rain-window">
          <rect x={W.x0} y={W.y0} width={W.x1 - W.x0} height={W.y1 - W.y0} />
        </clipPath>
      </defs>
      <g clipPath="url(#kc-rain-window)">
        {Array.from({ length: 40 }, (_, i) => {
          const speed = 60 + random(`kr-s-${i}`) * 30;
          const x0 = W.x0 + random(`kr-x-${i}`) * (W.x1 - W.x0 + 80);
          const y = W.y0 + ((random(`kr-y-${i}`) * 500 + frame * speed) % 500) - 60;
          return <line key={i} x1={x0 - (y - W.y0) * 0.2} y1={y} x2={x0 - (y - W.y0) * 0.2 - 8} y2={y + 44} stroke={M.dust} strokeWidth={2} opacity={0.55} />;
        })}
      </g>
      {Array.from({ length: 26 }, (_, i) => {
        const speed = 50 + random(`ki-s-${i}`) * 30;
        const x0 = W.x0 - 40 + random(`ki-x-${i}`) * (W.x1 - W.x0 + 80);
        const span = 700;
        const y = W.y0 + 100 + ((random(`ki-y-${i}`) * span + frame * speed) % span);
        return <line key={`in-${i}`} x1={x0 - (y - W.y0) * 0.25} y1={y} x2={x0 - (y - W.y0) * 0.25 - 7} y2={y + 36} stroke={M.dust} strokeWidth={1.6} opacity={0.3} />;
      })}
    </Svg>
  );
};

/** Hojas que entran volando por la ventana rota (micro-movimiento: cambia algo cada segundo del tramo). */
export const FlyingLeaves: React.FC<KitchenProps> = ({ year, frame }) => {
  const l = leaves(year);
  const r = rain(year);
  if (l <= 0.001 || r <= 0.01) return null;
  return (
    <Svg>
      {Array.from({ length: 5 }, (_, i) => {
        const period = 70 + random(`fl-p-${i}`) * 40;
        const t = ((frame + random(`fl-o-${i}`) * period) % period) / period;
        // caen sobre la mesada (arriba del carril de subtítulos), a los lados de la bacha
        const landX = i % 2 ? LAYOUT.counter.x0 + 20 + random(`fl-x-${i}`) * (LAYOUT.sink.x0 - LAYOUT.counter.x0 - 40) : LAYOUT.sink.x1 + 10 + random(`fl-x-${i}`) * 60;
        const x = lerp(t, [0, 1], [W.x0 + 30 + i * 25, landX]) + Math.sin(t * Math.PI * 4 + i) * 30;
        const y = lerp(t, [0, 1], [W.y0 + 60, LAYOUT.counter.backY + 30 + random(`fl-y-${i}`) * 80]);
        return <ellipse key={i} cx={x} cy={y} rx={13} ry={6} fill={i % 2 ? M.leaf : M.leafDry} transform={`rotate(${t * 540 + i * 70} ${x} ${y})`} opacity={r * Math.sin(Math.PI * t)} />;
      })}
    </Svg>
  );
};
