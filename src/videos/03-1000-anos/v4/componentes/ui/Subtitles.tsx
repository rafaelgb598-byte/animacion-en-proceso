import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { FPS, SUB_FADE } from "../../timeline";
import type { VoiceSegment } from "../../types";

const L = LAYOUT.subtitles;
/** Máximo de palabras por página (prompt v4). */
const MAX_WORDS = 4;
/** Y como mucho ~24 caracteres: a 60 px entra en una sola línea y no tapa el celular. */
const MAX_CHARS = 24;

type Word = { text: string; a: number; b: number };
type Page = { words: Word[]; a: number; b: number };

/**
 * Tiempos por palabra estimados dentro de cada frase (proporcionales a su largo).
 * Nota: las tomas no tienen alineación por palabra; la frase sí está medida sobre el audio.
 */
const wordsOf = (text: string, a: number, b: number): Word[] => {
  const ws = text.split(" ").filter(Boolean);
  const weight = (w: string) => w.replace(/[.,:;…?!¿¡]/g, "").length + 1;
  const total = ws.reduce((n, w) => n + weight(w), 0);
  let t = a;
  return ws.map((w) => {
    const d = ((b - a) * weight(w)) / total;
    const r = { text: w, a: t, b: t + d };
    t += d;
    return r;
  });
};

/** Páginas de ≤ 4 palabras; también se corta después de una coma o un punto. */
const pagesOf = (words: Word[]): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const len = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (cur.length && len + w.text.length > MAX_CHARS) {
      pages.push({ words: cur, a: cur[0].a, b: cur[cur.length - 1].b });
      cur = [];
    }
    cur.push(w);
    const punct = /[.,:…?!]$/.test(w.text);
    if (cur.length === MAX_WORDS || (punct && cur.length >= 2) || i === words.length - 1) {
      pages.push({ words: cur, a: cur[0].a, b: cur[cur.length - 1].b });
      cur = [];
    }
  });
  return pages;
};

export const activePage = (frame: number, voice: readonly VoiceSegment[]): Page | null => {
  for (const v of voice) {
    if (!v.subtitles) continue;
    for (const p of v.phrases) {
      const a = v.from + p.start * FPS;
      const b = v.from + p.end * FPS;
      if (frame < a - 1 || frame >= b + 3) continue;
      const pages = pagesOf(wordsOf(p.text, a, b));
      return pages.find((pg, i) => frame < pg.b + (i === pages.length - 1 ? 3 : 0)) ?? pages[pages.length - 1];
    }
  }
  return null;
};

/** V4 · Subtítulos: 60 px, peso 700, caja oscura, palabra activa al 100 % y el resto al 60 %. Carril fijo (apoya en y 1420). */
export const Subtitles: React.FC<{ frame: number; voice: readonly VoiceSegment[] }> = ({ frame, voice }) => {
  const pg = activePage(frame, voice);
  if (!pg) return null;
  const op = interpolate(frame, [pg.a - 1, pg.a - 1 + SUB_FADE], [0, 1], CLAMP);
  return (
    <div style={{ position: "absolute", left: L.x0, width: L.x1 - L.x0, bottom: 1920 - L.baseline, display: "flex", justifyContent: "center", opacity: op }}>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: TYPE.subtitle,
          lineHeight: 1.12,
          color: UI.bone,
          textAlign: "center",
          padding: "6px 20px 10px",
          borderRadius: 12,
          background: UI.veilStrong,
          maxWidth: L.x1 - L.x0,
        }}
      >
        {pg.words.map((w, i) => (
          <span key={i} style={{ opacity: frame >= w.a - 1 ? 1 : 0.6 }}>
            {w.text}
            {i < pg.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
