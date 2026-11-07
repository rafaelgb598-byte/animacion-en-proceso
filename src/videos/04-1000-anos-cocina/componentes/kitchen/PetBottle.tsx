import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp, OUT_CUBIC } from "../../../../canal/mil-anos/anim";
import { ContactShadow, Svg } from "../../../../canal/mil-anos/svg";
import { dust, pet } from "../../episodes/cocina.decay";
import { LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const B = LAYOUT.pet;
const HALF = B.w / 2;
/** Silueta (lado derecho, de arriba a abajo), misma idea que la botella del celular a escala de mesada. */
const RIGHT: readonly [number, number][] = [
  [12, 0], [12, 18], [10, 20], [10, 46], [HALF, 86], [HALF, 126], [HALF - 4, 138], [HALF, 150], [HALF, 190], [HALF - 4, 202], [HALF, 214], [HALF, 228], [HALF - 8, 236],
];
/** Bandas en que se parte (y desde arriba) y adónde va cada pedazo. */
const PIECES = [
  { y0: 0, y1: 70, dx: -86, dy: 172, rot: -80 },
  { y0: 70, y1: 120, dx: 64, dy: 120, rot: 70 },
  { y0: 120, y1: 168, dx: -40, dy: 74, rot: -60 },
  { y0: 168, y1: 206, dx: 30, dy: 30, rot: 20 },
  { y0: 206, y1: 236, dx: 0, dy: 0, rot: 0 },
] as const;

/** Botella PET: opaca → quebradiza → se fragmenta en AÑO 200–450. No desaparece: queda en pedazos. */
export const PetBottle: React.FC<KitchenProps> = ({ year }) => {
  const p = pet(year);
  const top = B.bottom - B.h;
  const pts = [...RIGHT.map(([px, py]) => [B.cx + px, top + py] as const), ...RIGHT.slice().reverse().map(([px, py]) => [B.cx - px, top + py] as const)];
  const sil = `M ${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(" L ")} Z`;
  const fill = interpolateColors(p.opaque, [0, 1], [M.pet, M.petOld]);
  const water = 1 - lerp(year, [1, 10], [0, 1]);
  const waterTop = B.bottom - 120 * water;
  const f = OUT_CUBIC(p.fragment);
  const buried = 1 - 0.55 * p.bury;
  return (
    <Svg style={{ opacity: buried }}>
      <defs>
        <clipPath id="kc-pet-clip">
          <path d={sil} />
        </clipPath>
        {PIECES.map((pc, i) => (
          <clipPath key={i} id={`kc-pet-piece-${i}`}>
            <rect x={B.cx - HALF - 10} y={top + pc.y0} width={B.w + 20} height={pc.y1 - pc.y0} />
          </clipPath>
        ))}
      </defs>
      <ContactShadow id="kc-pet-shadow" cx={B.cx + 8} cy={B.bottom + 2} rx={HALF * 1.3 + 60 * f} ry={8} soft={5} opacity={0.4} />
      {PIECES.map((pc, i) => {
        const cy = top + (pc.y0 + pc.y1) / 2;
        const jag = i < PIECES.length - 1 && f > 0 ? (random(`pet-j-${i}`) - 0.5) * 6 : 0;
        return (
          <g key={i} transform={`translate(${pc.dx * f} ${pc.dy * f + jag}) rotate(${pc.rot * f} ${B.cx} ${cy})`} clipPath={`url(#kc-pet-piece-${i})`}>
            <path d={sil} fill={fill} />
            <g clipPath="url(#kc-pet-clip)">
              {water > 0.01 ? <rect x={B.cx - HALF - 4} y={waterTop} width={B.w + 8} height={B.bottom - waterTop} fill={M.water} /> : null}
              <rect x={B.cx - HALF} y={top} width={B.w} height={B.h} fill={M.dust} opacity={0.3 * dust(year)} />
              <rect x={B.cx - HALF + 10} y={top + 54} width={8} height={B.h - 70} rx={4} fill={M.specular} opacity={0.45 * (1 - 0.7 * p.opaque)} />
              {/* quebradiza: grietas finas */}
              <g stroke={M.petEdge} strokeWidth={1.6} opacity={p.brittle}>
                <path d={`M ${B.cx - 20} ${top + 100} L ${B.cx - 4} ${top + 124} L ${B.cx - 14} ${top + 150}`} fill="none" />
                <path d={`M ${B.cx + 18} ${top + 160} L ${B.cx + 6} ${top + 186} L ${B.cx + 20} ${top + 206}`} fill="none" />
              </g>
            </g>
            <path d={sil} fill="none" stroke={M.petEdge} strokeWidth={2.2} opacity={1 - 0.5 * p.opaque} />
            {i === 0 ? <rect x={B.cx - 14} y={top - 4} width={28} height={20} rx={4} fill={M.petCap} opacity={1 - 0.4 * p.opaque} /> : null}
          </g>
        );
      })}
    </Svg>
  );
};
