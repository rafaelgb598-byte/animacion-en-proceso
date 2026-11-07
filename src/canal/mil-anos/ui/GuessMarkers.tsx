import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../anim";
import { SERIES_FONTS, SERIES_UI } from "../theme";

export type GuessMarker = { n: number; x: number; y: number; from: number; to: number };

/**
 * Marcadores de apuesta 1-2-3 (reutilizable para próximos episodios): círculo de 64 px con borde bone de 3 px
 * y número en Plex Mono 700, bone (nunca ámbar: el ámbar es el tiempo). Entran con escala + opacidad.
 */
export const GuessMarkers: React.FC<{
  frame: number;
  markers: readonly GuessMarker[];
  inLen: number;
  outLen: number;
  size?: number;
  font?: number;
  /** grosor del borde (px) */
  border?: number;
  /** pulso de escala 1 → 1,08 → 1 al terminar de entrar */
  pulse?: boolean;
}> = ({ frame, markers, inLen, outLen, size = 64, font = 34, border = 3, pulse = false }) => (
  <>
    {markers.map((m) => {
      if (frame < m.from || frame >= m.to) return null;
      const tin = interpolate(frame, [m.from, m.from + inLen], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
      const tout = interpolate(frame, [m.to - outLen, m.to], [0, 1], { ...CLAMP, easing: IN_CUBIC });
      const op = tin * (1 - tout);
      const bump = pulse ? 0.08 * Math.sin(Math.PI * interpolate(frame - m.from, [inLen, inLen + 10], [0, 1], CLAMP)) : 0;
      return (
        <div
          key={`${m.n}-${m.from}`}
          style={{
            position: "absolute",
            left: m.x - size / 2,
            top: m.y - size / 2,
            width: size,
            height: size,
            boxSizing: "border-box",
            borderRadius: size / 2,
            border: `${border}px solid ${SERIES_UI.bone}`,
            background: SERIES_UI.veilStrong,
            boxShadow: `0 4px 18px ${SERIES_UI.shadow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIES_FONTS.mono,
            fontWeight: 700,
            fontSize: font,
            color: SERIES_UI.bone,
            opacity: op,
            transform: `translateY(${(1 - tin) * 14}px) scale(${0.8 + 0.2 * tin + bump})`,
          }}
        >
          {m.n}
        </div>
      );
    })}
  </>
);
