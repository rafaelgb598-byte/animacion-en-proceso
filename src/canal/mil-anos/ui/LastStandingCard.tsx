import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../anim";
import { SERIES_FONTS, SERIES_LAYOUT, SERIES_TYPE, SERIES_UI } from "../theme";

/** `figure` admite varias líneas (una por elemento). */
export type CardWinner = { kicker: string; name: string; figure: readonly string[]; foot: string; nameSize: number };

/**
 * Carta fija de la serie («ÚLTIMO EN PIE» + ganador). Panel ink 78 %, radio 18, 820 × 420, centrada en (540, 1150).
 * Entra con escala 0,96 → 1 y opacidad en `inLen`; sale en `outLen`.
 */
export const LastStandingCard: React.FC<{ frame: number; from: number; len: number; inLen: number; outLen: number; winner: CardWinner }> = ({
  frame,
  from,
  len,
  inLen,
  outLen,
  winner,
}) => {
  if (frame < from || frame >= from + len) return null;
  const tin = interpolate(frame, [from, from + inLen], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const tout = interpolate(frame, [from + len - outLen, from + len], [0, 1], { ...CLAMP, easing: IN_CUBIC });
  const op = tin * (1 - tout);
  const C = SERIES_LAYOUT.card;
  const box: React.CSSProperties = {
    position: "absolute",
    left: C.cx - C.w / 2,
    top: C.cy - C.h / 2,
    width: C.w,
    height: C.h,
    transform: `scale(${0.96 + 0.04 * tin})`,
  };
  return (
    <>
      <div style={{ ...box, borderRadius: C.radius, background: SERIES_UI.ink, opacity: op * SERIES_UI.inkAlpha }} />
      <div
        style={{
          ...box,
          opacity: op,
          boxSizing: "border-box",
          padding: `0 ${C.padX}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: SERIES_FONTS.mono, fontWeight: 700, fontSize: SERIES_TYPE.cardKicker, letterSpacing: "0.12em", color: SERIES_UI.amber }}>{winner.kicker}</div>
        <div style={{ fontFamily: SERIES_FONTS.display, fontWeight: 600, fontSize: winner.nameSize, lineHeight: 1, color: SERIES_UI.bone }}>{winner.name}</div>
        <div style={{ fontFamily: SERIES_FONTS.mono, fontWeight: 500, fontSize: SERIES_TYPE.cardFigure, lineHeight: 1.25, color: SERIES_UI.bone }}>
          {winner.figure.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        <div style={{ fontFamily: SERIES_FONTS.mono, fontWeight: 500, fontSize: SERIES_TYPE.cardFoot, color: SERIES_UI.bone, opacity: 0.6 }}>{winner.foot}</div>
      </div>
    </>
  );
};
