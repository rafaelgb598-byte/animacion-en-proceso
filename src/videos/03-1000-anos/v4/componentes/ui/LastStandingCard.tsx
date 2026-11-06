import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";

export type CardWinner = { kicker: string; name: string; figure: string; foot: string };

/**
 * Carta fija de la serie «1000 años» («ÚLTIMO EN PIE» + ganador). Reutilizable: recibe el ganador y su ventana de tiempo.
 * Panel ink 78 %, radio 18, 820 de ancho, centrado en (540, 1150). Entra con escala 0,96 → 1 y opacidad.
 */
export const LastStandingCard: React.FC<{ frame: number; from: number; len: number; inLen: number; winner: CardWinner }> = ({ frame, from, len, inLen, winner }) => {
  if (frame < from || frame >= from + len) return null;
  const tin = interpolate(frame, [from, from + inLen], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const tout = interpolate(frame, [from + len - inLen, from + len], [0, 1], { ...CLAMP, easing: IN_CUBIC });
  const op = tin * (1 - tout);
  const C = LAYOUT.card;
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
      <div style={{ ...box, borderRadius: C.radius, background: UI.ink, opacity: op * UI.inkAlpha }} />
      <div style={{ ...box, opacity: op, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: TYPE.cardKicker, letterSpacing: "0.12em", color: UI.amber }}>{winner.kicker}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: TYPE.cardWinner, lineHeight: 1, color: UI.bone }}>{winner.name}</div>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: TYPE.cardFigure, color: UI.bone }}>{winner.figure}</div>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: TYPE.cardFoot, color: UI.bone, opacity: 0.6 }}>{winner.foot}</div>
      </div>
    </>
  );
};
