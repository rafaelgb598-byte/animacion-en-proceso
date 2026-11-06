import React from "react";
import { bookFlake, bookSwell, dust, mixColor, pageWave, paperYellow } from "../../decay";
import { onSupport } from "../../lib/support";
import { MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { DustLayer } from "../fx/DustLayer";
import { ContactShadow, Svg } from "../svg";

const STRIPS = 5;

/** Libro cerrado acostado: canto de páginas al frente, tapa en perspectiva arriba. */
export const Book: React.FC<SceneBaseProps & { x: number; y: number; w: number; h: number; drop: number }> = ({ year, frame, x, y, w, h, drop }) => {
  const flake = bookFlake(year);
  if (flake >= 0.999) return null;
  const sup = onSupport(year, frame, drop, 6);
  const swell = bookSwell(year);
  const wave = pageWave(year);
  const paper = mixColor(MAT.paper, MAT.paperOld, paperYellow(year));
  const hh = h * (1 + 0.25 * swell);
  const left = x - w / 2;
  const bottom = y + h / 2;
  const top = bottom - hh;
  const depth = 62;
  const skew = 22;
  const bulge = 14 * swell;
  const coverD = `M ${left} ${top} Q ${x} ${top - bulge} ${left + w} ${top} L ${left + w + skew} ${top - depth} Q ${x + skew} ${top - depth - bulge} ${left + skew} ${top - depth} Z`;
  // canto de páginas con ondas de amplitud creciente
  const lines = Array.from({ length: 7 }, (_, i) => {
    const ly = top + 9 + ((hh - 18) * (i + 1)) / 8;
    let dd = `M ${left + 4} ${ly}`;
    for (let k = 1; k <= 12; k++) {
      const lx = left + 4 + ((w - 8) * k) / 12;
      dd += ` L ${lx} ${ly + Math.sin(k * 1.7 + i) * 3.5 * wave}`;
    }
    return dd;
  });
  const content = (
    <>
      <path d={coverD} fill={MAT.bookCover} />
      <DustLayer id="uep-book-dust" seed={72} d={coverD} opacity={Math.max(0, dust(year))} />
      <rect x={left} y={top} width={w} height={hh} fill={paper} />
      <rect x={left} y={top} width={w} height={8} fill={MAT.bookCover} />
      <rect x={left} y={bottom - 8} width={w} height={8} fill={MAT.bookCover} />
      <path d={`M ${left + w} ${top} L ${left + w + skew} ${top - depth} L ${left + w + skew} ${bottom - depth} L ${left + w} ${bottom} Z`} fill={MAT.bookCover} />
      {lines.map((dd, i) => (
        <path key={i} d={dd} stroke={MAT.paperOld} strokeWidth={1.6} fill="none" opacity={0.7} />
      ))}
    </>
  );
  return (
    <Svg>
      <ContactShadow id="uep-book-shadow" cx={x + 10} cy={bottom + 4 + sup.dy} rx={w * 0.6} ry={12} soft={7} opacity={0.5 * (1 - flake)} />
      <g transform={`translate(0 ${sup.dy}) rotate(${sup.rot} ${x} ${bottom})`}>
        {flake <= 0.001
          ? content
          : Array.from({ length: STRIPS }, (_, k) => {
              const sw = (w + skew) / STRIPS;
              const local = Math.min(1, Math.max(0, flake * 1.6 - k * 0.12));
              return (
                <g key={k} opacity={1 - local} transform={`translate(${(k - 2) * 6 * local} ${60 * local + k * 8 * local})`}>
                  <clipPath id={`uep-book-strip-${k}`}>
                    <rect x={left + k * sw - 1} y={top - depth - 40} width={sw + 2} height={hh + depth + 60} />
                  </clipPath>
                  <g clipPath={`url(#uep-book-strip-${k})`}>{content}</g>
                </g>
              );
            })}
      </g>
    </Svg>
  );
};
