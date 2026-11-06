import React from "react";
import { random } from "remotion";
import { bottleDeform, bottleFade, bottleFill, bottleGone, dust, lramp } from "../../decay";
import { onSupport } from "../../lib/support";
import { MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { ContactShadow, Svg } from "../svg";

/** Botella PET: medio llena → vacía → descolorida → abollada y caída → desaparece (500–900). */
export const Bottle: React.FC<SceneBaseProps & { x: number; y: number; w: number; h: number; drop: number }> = ({ year, frame, x, y, w, h, drop }) => {
  const gone = bottleGone(year);
  if (gone >= 0.999) return null;
  const sup = onSupport(year, frame, drop, 86);
  const fill = Math.max(0, bottleFill(year));
  const fade = bottleFade(year);
  const deform = bottleDeform(year);
  const top = y - h / 2;
  const bottom = y + h / 2;
  const half = w / 2;
  // silueta (lado derecho de arriba a abajo); el izquierdo es espejo, con abolladuras
  const right: [number, number][] = [
    [17, 0], [17, 22], [15, 24], [15, 60], [half, 110], [half, 160], [half - 4, 175], [half, 190], [half, 240], [half - 4, 255], [half, 270], [half, 290], [half - 10, 300],
  ];
  const dent = (i: number, side: number) => (i >= 4 ? -deform * random(`dent-${side}-${i}`) * 18 : 0);
  const pts = [
    ...right.map(([px, py], i) => [x + px + dent(i, 1), top + py] as const),
    ...right
      .slice()
      .reverse()
      .map(([px, py], j) => [x - px - dent(right.length - 1 - j, 0), top + py] as const),
  ];
  const sil = `M ${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(" L ")} Z`;
  const bodyTop = top + 110;
  const waterTop = bottom - (bottom - bodyTop) * fill * 2 * 0.95;
  const residue = lramp(year, 2, 10) * (1 - lramp(year, 40, 80));
  const op = 1 - gone;
  return (
    <Svg style={{ opacity: op }}>
      <defs>
        <clipPath id="uep-bottle-clip">
          <path d={sil} />
        </clipPath>
      </defs>
      <ContactShadow id="uep-bottle-shadow" cx={x + 8 + sup.t * -60} cy={bottom + 2 + sup.dy} rx={w * 0.6 + sup.t * 110} ry={10} soft={6} opacity={0.4} />
      <g transform={`translate(${-200 * sup.t} ${sup.dy}) rotate(${sup.rot} ${x} ${bottom})`}>
        <path d={sil} fill={MAT.pet} />
        <g clipPath="url(#uep-bottle-clip)">
          {fill > 0.005 ? <rect x={x - half - 4} y={waterTop} width={w + 8} height={bottom - waterTop} fill={MAT.water} /> : null}
          {fill > 0.005 ? <rect x={x - half - 4} y={waterTop} width={w + 8} height={3} fill={MAT.specular} opacity={0.35} /> : null}
          {residue > 0.01
            ? Array.from({ length: 22 }, (_, i) => (
                <circle key={i} cx={x - half + random(`res-x-${i}`) * w} cy={bottom - 20 - random(`res-y-${i}`) * 120} r={1.5 + random(`res-r-${i}`) * 2.5} fill={MAT.specular} opacity={0.35 * residue} />
              ))
            : null}
          <rect x={x - half} y={top} width={w} height={h} fill={MAT.paperOld} opacity={0.22 * fade} />
          <rect x={x - half} y={top} width={w} height={h} fill={MAT.dust} opacity={0.35 * Math.max(0, dust(year))} />
          <rect x={x - half + 14} y={top + 70} width={10} height={h - 90} rx={5} fill={MAT.specular} opacity={0.45 * (1 - fade * 0.6)} />
        </g>
        <path d={sil} fill="none" stroke={MAT.petEdge} strokeWidth={2.5} opacity={1 - 0.5 * fade} />
        <rect x={x - 18} y={top - 4} width={36} height={24} rx={4} fill={MAT.petCap} opacity={1 - 0.4 * fade} />
      </g>
    </Svg>
  );
};
