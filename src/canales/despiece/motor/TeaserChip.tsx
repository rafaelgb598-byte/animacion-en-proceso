// Aviso del final: «Próximo despiece: …». Solo en pantalla (sin voz).
import React from "react";
import { interpolate } from "remotion";
import { z } from "zod";
import { CLAMP, OUT } from "../marca/anim";
import { ALPHA, COLOR, STROKE, TYPE } from "../marca/theme";

export const teaserChipSchema = z.object({
  /** lo que viene (sin el «Próximo despiece:», que pone el chip) */
  proximo: z.string(),
  /** centro del chip */
  x: z.number(),
  y: z.number(),
  /** ancho fijo (el texto se escribe a mano para que entre) */
  ancho: z.number().default(640),
  progreso: z.number().min(0).max(1),
});
export type TeaserChipProps = z.input<typeof teaserChipSchema>;

export const TeaserChip: React.FC<TeaserChipProps> = (raw) => {
  const p = teaserChipSchema.parse(raw);
  if (p.progreso <= 0) return null;
  const t = interpolate(p.progreso, [0, 1], [0, 1], { ...CLAMP, easing: OUT });
  const h = 132;
  const x0 = p.x - p.ancho / 2;
  const y0 = p.y - h / 2;
  return (
    <g opacity={t} transform={`translate(0 ${(1 - t) * 24})`}>
      <rect x={x0} y={y0} width={p.ancho} height={h} rx={20} fill={ALPHA.chip} stroke={COLOR.paper} strokeWidth={STROKE.leader} />
      {/* la línea de corte en miniatura: marca del canal */}
      <line x1={x0 + 28} y1={y0 + 40} x2={x0 + 28 + 70 * t} y2={y0 + 40} stroke={COLOR.signal} strokeWidth={STROKE.cut} strokeLinecap="round" />
      <text x={x0 + 120} y={y0 + 52} fill={COLOR.paper} style={{ ...TYPE.chip, fontSize: 32 }}>
        PRÓXIMO DESPIECE
      </text>
      <text x={x0 + 28} y={y0 + 108} fill={COLOR.paper} style={{ fontFamily: TYPE.title.fontFamily, fontWeight: 700, fontSize: 48 }}>
        {p.proximo}
      </text>
    </g>
  );
};
