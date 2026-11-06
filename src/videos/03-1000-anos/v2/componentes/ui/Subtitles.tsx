import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { FPS, SUB_FADE } from "../../timeline";
import type { VoiceSegment } from "../../types";

const L = LAYOUT.subtitles;

/** Frase activa de la narración (o null). */
export const activePhrase = (frame: number, voice: readonly VoiceSegment[]) => {
  for (const v of voice) {
    if (!v.subtitles) continue;
    for (const p of v.phrases) {
      const a = v.from + p.start * FPS;
      const b = v.from + p.end * FPS;
      if (frame >= a - 1 && frame < b + 2) return { text: p.text, a, b };
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
