import React from "react";
import { clamp } from "../character/anim";
import { snap } from "../character/v2/motion2";
import type { Word } from "../short-final/words";
import type { Box } from "./cafe";
import { captionRect, centerY, getCaptions, hideFade, pageAt, slotAt, slotX, type CaptionOpts } from "./captions";

/**
 * Subtítulos del canal (carril fijo abajo, karaoke amarillo, MAYÚSCULAS con contorno).
 * Componente compartido entre episodios: los valores por defecto son los del Short aprobado.
 */

const LINE = "#2A2024";
const FONT = "'Segoe UI Black', 'Arial Black', 'Segoe UI', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export const CaptionsLayer: React.FC<{
  f: number;
  frames: number;
  boxesAt: (f: number) => Box[];
  debug?: boolean;
  /** palabras con tiempos (por defecto, las del Short del señuelo) */
  words?: Word[];
  opts?: CaptionOpts;
  /** palabras clave en serif itálica (comparación sin tildes ni signos, en minúsculas) */
  italic?: string[];
  /** visibilidad por fotograma (por defecto, siempre) */
  visible?: (f: number) => boolean;
}> = ({ f, frames, boxesAt, debug = false, words, opts, italic, visible }) => {
  if (visible && !visible(f)) return null;
  const caps = getCaptions(frames, boxesAt, words, opts);
  const page = pageAt(caps, f);
  if (!page) return null;
  const t = f / 30;
  let current = null as (typeof page.words)[number] | null;
  for (const w of page.words) if (t >= w.s - 0.04 && t < w.e + 0.25) current = w;
  const sl = slotAt(page, f);
  const last = Math.max(page.f0, ...page.switches.filter((x) => x <= f));
  const inT = last === 0 ? 1 : clamp((f - last) / 6, 0, 1);
  const sc = 0.86 + 0.14 * snap(0, 0.01, 4.5, 1.6 * Math.PI)(inT);
  const LH = page.size * 1.22;
  const cx = slotX(page, sl.x);
  const cy = centerY(page, sl.base);
  const baseY = cy - ((page.lines.length - 1) * LH) / 2 + page.size * 0.36;
  const r = captionRect(page, cy, sl.x);
  const op = clamp(inT * 2, 0, 1) * hideFade(page, f);
  if (op <= 0) return null;
  const isItalic = (w: string) => {
    if (!italic) return false;
    const k = w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ]/g, "");
    return italic.includes(k);
  };
  return (
    <g opacity={op} transform={`translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})`}>
      {debug ? <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="none" stroke="#00E0FF" strokeWidth={4} strokeDasharray="10 8" /> : null}
      {page.lines.map((line, li) => (
        <text key={li} x={cx} y={baseY + li * LH} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={page.size} letterSpacing={-1}>
          {line.map((w, wi) => {
            const active = w === current;
            const it = isItalic(w.t);
            return (
              <tspan
                key={wi}
                fill={active ? "#FFD84A" : "#FFFFFF"}
                stroke={LINE}
                strokeWidth={14}
                paintOrder="stroke"
                strokeLinejoin="round"
                dy={active ? -4 : 0}
                dx={wi === 0 ? 0 : 18}
                style={
                  it
                    ? { fontSize: (active ? page.size * 1.06 : page.size) * 1.08, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700 }
                    : { fontSize: active ? page.size * 1.06 : page.size }
                }
              >
                {it ? w.t : w.t.toUpperCase()}
              </tspan>
            );
          })}
        </text>
      ))}
    </g>
  );
};
