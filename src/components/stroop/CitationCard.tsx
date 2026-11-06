import React from "react";
import { spring } from "remotion";

/** Ficha de cita del canal (papel con cinta, Georgia), la misma estética que la cita del pizarrón. */
export const CitationCard: React.FC<{ f: number; at: number; out: number; x: number; y: number; title: string; source: string; fps?: number }> = ({
  f,
  at,
  out,
  x,
  y,
  title,
  source,
  fps = 30,
}) => {
  if (f < at || f >= out + 10) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
  const o = Math.min(1, Math.max(0, 1 - (f - out) / 10));
  return (
    <g opacity={o} transform={`translate(${x + (1 - s) * 420},${y}) rotate(${-2 - (1 - s) * 6})`}>
      <rect x={-318} y={-70} width={636} height={140} rx={8} fill="#000" opacity={0.35} transform="translate(6,10)" />
      <rect x={-318} y={-70} width={636} height={140} rx={8} fill="#FBF3DF" stroke="#2A2024" strokeWidth={4} />
      <rect x={-40} y={-78} width={80} height={24} fill="#F2E6B8" opacity={0.9} />
      <text x={0} y={-8} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={44} fill="#2A2024">
        {title}
      </text>
      <text x={0} y={40} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill="#4A3C36">
        {source}
      </text>
    </g>
  );
};
