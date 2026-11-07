import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../anim";
import { SERIES_FONTS, SERIES_UI } from "../theme";

export type LabelCue = { key: string; frame: number; text: string };
export type LabelStyle = { x: number; y: number; step: number; size: number; inLen: number; hold: number; outLen: number; max: number };

/**
 * Etiquetas «objeto · estado» de la serie (Plex Mono 500, ash, con velo), apiladas hacia arriba desde (x, y).
 * Igual a la de la v2; ahora recibe las etiquetas y las medidas por props.
 */
export const DecayLabels: React.FC<{ frame: number; cues: readonly LabelCue[]; style: LabelStyle }> = ({ frame, cues, style }) => {
  const life = style.inLen + style.hold + style.outLen;
  // renglón: el primero libre cuando entra la etiqueta (las que siguen vivas mantienen el suyo)
  const slots = new Map<string, number>();
  for (const c of [...cues].sort((a, b) => a.frame - b.frame)) {
    const taken = new Set(cues.filter((o) => slots.has(o.key) && o.frame <= c.frame && c.frame < o.frame + life).map((o) => slots.get(o.key)));
    let s = 0;
    while (taken.has(s)) s++;
    slots.set(c.key, s);
  }
  const visible = cues.filter((c) => frame >= c.frame && frame < c.frame + life);
  return (
    <>
      {visible.slice(-style.max).map((c) => {
        const slot = slots.get(c.key) ?? 0;
        const local = frame - c.frame;
        const inT = interpolate(local, [0, style.inLen], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
        const outT = interpolate(local, [life - style.outLen, life], [0, 1], { ...CLAMP, easing: IN_CUBIC });
        const y = style.y + Math.min(slot, style.max - 1) * style.step;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: style.x,
              top: y - style.size,
              fontFamily: SERIES_FONTS.mono,
              fontWeight: 500,
              fontSize: style.size,
              lineHeight: `${style.size * 1.2}px`,
              color: SERIES_UI.ash,
              whiteSpace: "nowrap",
              opacity: inT * (1 - outT),
              transform: `translateY(${(1 - inT) * 12}px)`,
              padding: "3px 12px",
              marginLeft: -12,
              background: SERIES_UI.veilStrong,
              borderRadius: 8,
              textShadow: `0 1px 8px ${SERIES_UI.shadow}`,
            }}
          >
            {c.text}
          </div>
        );
      })}
    </>
  );
};
