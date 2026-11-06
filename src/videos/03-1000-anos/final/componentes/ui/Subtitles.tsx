import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { FPS, SUB_FADE } from "../../timeline";
import type { VoiceSegment } from "../../types";

const L = LAYOUT.subtitles;

/** Frase activa de la narración (o null). */
/** Máximo de caracteres por subtítulo: una sola línea legible en el carril. */
const MAX_CHARS = 32;

/** Parte una frase larga en tramos de ≤ MAX_CHARS por palabras, con tiempo proporcional a su largo. */
const chunks = (text: string, a: number, b: number) => {
  // cortes marcados a mano con « | » tienen prioridad
  const marked = text.includes(" | ") ? text.split(" | ") : null;
  const words = text.split(" ");
  const parts: string[] = marked ? [...marked] : [];
  let cur = "";
  for (const w of marked ? [] : words) {
    if (cur && (cur + " " + w).length > MAX_CHARS) {
      parts.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) parts.push(cur);
  const total = parts.reduce((n, x) => n + x.length, 0);
  let t = a;
  return parts.map((x) => {
    const d = ((b - a) * x.length) / total;
    const r = { text: x, a: t, b: t + d };
    t += d;
    return r;
  });
};

export const activePhrase = (frame: number, voice: readonly VoiceSegment[]) => {
  for (const v of voice) {
    if (!v.subtitles) continue;
    for (const p of v.phrases) {
      const a = v.from + p.start * FPS;
      const b = v.from + p.end * FPS;
      if (frame >= a - 1 && frame < b + 2) {
        const cs = chunks(p.text, a, b);
        const c = cs.find((x, i) => frame < x.b + (i === cs.length - 1 ? 2 : 0)) ?? cs[cs.length - 1];
        return c;
      }
    }
  }
  return null;
};

/** Subtítulos en carril fijo abajo (CLAUDE.md): apoyan en y = 1530, crecen hacia arriba, nunca saltan. */
export const Subtitles: React.FC<{ frame: number; voice: readonly VoiceSegment[] }> = ({ frame, voice }) => {
  const p = activePhrase(frame, voice);
  if (!p) return null;
  const op = interpolate(frame, [p.a - 1, p.a - 1 + SUB_FADE, p.b + 2 - SUB_FADE, p.b + 2], [0, 1, 1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: L.x0,
        width: L.x1 - L.x0,
        bottom: 1920 - L.baseline,
        display: "flex",
        justifyContent: "center",
        opacity: op,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: TYPE.subtitle,
          lineHeight: 1.15,
          color: UI.bone,
          textAlign: "center",
          padding: "6px 18px 8px",
          borderRadius: 10,
          background: UI.veilStrong,
        }}
      >
        {p.text}
      </div>
    </div>
  );
};
