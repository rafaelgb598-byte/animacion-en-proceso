import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../anim";
import { SERIES_FONTS, SERIES_UI } from "../theme";

/** Una línea del texto: palabras y frame en que entra la primera. */
export type HookLine = { words: readonly string[]; from: number };

/**
 * Texto palabra por palabra (Barlow 600, bone, centrado): cada palabra sube 24 px + opacidad en `wordIn` frames
 * con Easing.out(cubic), una cada `wordStep`. Sale en `outLen` frames antes de `end`.
 * Generaliza el HookText de la v2 (sirve para el gancho, la apuesta, el remate y la pregunta).
 */
export const HookText: React.FC<{
  frame: number;
  lines: readonly HookLine[];
  end: number;
  centerY: number;
  size: number;
  wordStep: number;
  wordIn: number;
  outLen: number;
  /** Si es true, `centerY` es la base de la última línea (crece hacia arriba). */
  anchorBottom?: boolean;
}> = ({ frame, lines, end, centerY, size, wordStep, wordIn, outLen, anchorBottom = false }) => {
  const start = Math.min(...lines.map((l) => l.from));
  if (frame >= end || frame < start) return null;
  const out = interpolate(frame, [end - outLen, end], [0, 1], { ...CLAMP, easing: IN_CUBIC });
  const lh = size * 1.18;
  const top = anchorBottom ? centerY - lines.length * lh : centerY - (lines.length * lh) / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: 920,
        top,
        opacity: 1 - out,
        transform: `translateY(${-10 * out}px)`,
        fontFamily: SERIES_FONTS.display,
        fontWeight: 600,
        fontSize: size,
        lineHeight: `${lh}px`,
        color: SERIES_UI.bone,
        textAlign: "center",
        textShadow: `0 3px 18px ${SERIES_UI.shadow}, 0 0 4px ${SERIES_UI.shadow}`,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.words.map((w, k) => {
            const s = line.from + k * wordStep;
            const t = interpolate(frame, [s, s + wordIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
            return (
              <span key={k} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 24}px)`, marginRight: k < line.words.length - 1 ? "0.25em" : 0 }}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
