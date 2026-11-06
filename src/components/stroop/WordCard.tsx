import React from "react";
import { interpolate, spring } from "remotion";
import { FONTS, STROOP } from "../../stroop/theme";

/**
 * Tarjeta de la prueba Stroop: papel oscuro apoyado en la mesa con la palabra en su tinta.
 * Entra con un resorte de aterrizaje y sale con la salida estándar (fundido + leve hundimiento).
 * Coordenadas de pantalla; la palabra queda centrada en (cx, cy).
 */

export const CARD = { cx: 520, cy: 760, w: 800, h: 300, fontSize: 170, maxText: 720 } as const;

/** tamaño de letra: 170 px, salvo que la palabra no entre en la tarjeta */
export type CardGeom = { cx: number; cy: number; w: number; h: number; fontSize: number; maxText: number };
export const wordSize = (word: string, g: CardGeom = CARD) => Math.min(g.fontSize, g.maxText / (word.length * 0.74));

export const WordCard: React.FC<{
  f: number;
  word: string;
  ink: string;
  /** fotograma en que aterriza */
  start: number;
  /** duración total en pantalla */
  dur: number;
  /** si es false, la tarjeta queda (p. ej. la última antes del congelado) */
  exits?: boolean;
  fps?: number;
  /** geometría (por defecto, la del episodio V1) */
  geom?: CardGeom;
}> = ({ f, word, ink, start, dur, exits = true, fps = 30, geom = CARD }) => {
  const t = f - start;
  if (t < 0 || t >= dur) return null;
  const land = spring({ frame: t, fps, config: { damping: 13, stiffness: 260, mass: 0.55 } });
  const out = exits ? interpolate(t, [dur - 4, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const y = -70 * (1 - land) + 14 * out;
  const sc = (1.06 - 0.06 * land) * (1 - 0.06 * out);
  const op = interpolate(t, [0, 2], [0, 1], { extrapolateRight: "clamp" }) * (1 - out);
  const size = wordSize(word, geom);
  const { cx, cy, w, h } = geom;
  return (
    <g opacity={op} transform={`translate(${cx},${cy + y}) scale(${sc})`}>
      {/* sombra de contacto: crece al apoyarse */}
      <ellipse cx={8} cy={h / 2 + 18} rx={(w / 2) * (0.75 + 0.2 * land)} ry={26} fill="#000" opacity={0.45 * land} filter="url(#stroopSoft)" />
      <rect x={-w / 2 + 6} y={-h / 2 + 14} width={w} height={h} rx={STROOP.cardRadius} fill="#000" opacity={0.35} filter="url(#stroopSoft)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={STROOP.cardRadius} fill={STROOP.card} stroke={STROOP.cardEdge} strokeWidth={3} />
      {/* fibra del papel */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={STROOP.cardRadius} fill="url(#stroopPaper)" opacity={0.5} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={size} letterSpacing={-2} fill={ink}>
        {word}
      </text>
    </g>
  );
};
