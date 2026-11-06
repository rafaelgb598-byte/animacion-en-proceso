import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CLAMP, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, MAT, TYPE, UI } from "../../theme";
import { CUE } from "../../timeline";

/** V4 · Negro final, «La foto, no.», invitación a comentar y vuelta al fotograma 0 (loop). */
export const Epilogue: React.FC<{ frame: number; photoNo: string; cta: string }> = ({ frame, photoNo, cta }) => {
  if (frame < CUE.fadeBlack) return null;
  const black =
    frame < CUE.loopReturn
      ? interpolate(frame, [CUE.fadeBlack, CUE.fadeBlack + CUE.fadeBlackLen], [0, 1], CLAMP)
      : interpolate(frame, [CUE.loopReturn, CUE.loopReturn + CUE.loopReturnLen - 1], [1, 0], CLAMP);
  const [p0, p1] = CUE.photoNoText;
  const [c0, c1] = CUE.cta;
  const pIn = interpolate(frame, [p0, p0 + 6], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const pOut = interpolate(frame, [p1 - 4, p1], [1, 0], CLAMP);
  const cIn = interpolate(frame, [c0, c0 + 6], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const cOut = interpolate(frame, [c1 - 4, c1], [1, 0], CLAMP);
  const S = LAYOUT.subtitles;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: MAT.black, opacity: black }} />
      {frame >= p0 && frame < p1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: LAYOUT.photoNoY - TYPE.photoNo / 2,
            textAlign: "center",
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontSize: TYPE.photoNo,
            lineHeight: 1,
            color: UI.bone,
            opacity: pIn * pOut,
            transform: `translateY(${(1 - pIn) * 12}px)`,
          }}
        >
          {photoNo}
        </div>
      ) : null}
      {frame >= c0 && frame < c1 ? (
        <div style={{ position: "absolute", left: S.x0, width: S.x1 - S.x0, bottom: 1920 - S.baseline, display: "flex", justifyContent: "center", opacity: cIn * cOut }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: TYPE.subtitle, lineHeight: 1.12, color: UI.bone, textAlign: "center", padding: "6px 20px 10px", borderRadius: 12, background: UI.veilStrong }}>
            {cta}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
