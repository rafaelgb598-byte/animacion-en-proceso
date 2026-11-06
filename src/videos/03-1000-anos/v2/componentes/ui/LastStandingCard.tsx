import React from "react";
import { interpolate } from "remotion";
import { CLAMP, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { CUE, LOOP_CUT } from "../../timeline";
import type { Episode } from "../../types";

const C = LAYOUT.card;

/** Carta «ÚLTIMO EN PIE» (f1060) + «La foto, no.» (f1100). Corte seco en f1155. */
export const LastStandingCard: React.FC<{ frame: number; winner: Episode["winner"] }> = ({ frame, winner }) => {
  if (frame < CUE.card || frame >= LOOP_CUT) return null;
  const t = interpolate(frame, [CUE.card, CUE.card + CUE.cardIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const t2 = interpolate(frame, [CUE.photoNo, CUE.photoNo + CUE.cardIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: C.cx - C.w / 2,
          top: C.cy - C.h / 2,
          width: C.w,
          height: C.h,
          borderRadius: C.radius,
          background: UI.ink,
          opacity: t * UI.inkAlpha,
          transform: `scale(${0.96 + 0.04 * t})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: C.cx - C.w / 2,
          top: C.cy - C.h / 2,
          width: C.w,
          height: C.h,
          opacity: t,
          transform: `scale(${0.96 + 0.04 * t})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: TYPE.cardKicker, letterSpacing: "0.12em", color: UI.amber }}>{winner.kicker}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: TYPE.cardWinner, lineHeight: 1, color: UI.bone }}>{winner.name}</div>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: TYPE.cardFigure, color: UI.bone, fontVariantNumeric: "tabular-nums" }}>{winner.figure}</div>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: TYPE.cardFoot, color: UI.bone, opacity: 0.6 }}>{winner.foot}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: C.cy + C.h / 2 + 4,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: TYPE.photoNo,
          lineHeight: 1,
          color: UI.bone,
          opacity: t2,
          transform: `translateY(${(1 - t2) * 16}px)`,
          textShadow: `0 3px 16px ${UI.shadow}`,
        }}
      >
        {winner.after}
      </div>
    </>
  );
};
