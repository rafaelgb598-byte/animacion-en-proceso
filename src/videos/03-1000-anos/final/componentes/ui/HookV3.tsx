import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { CUE } from "../../timeline";

/** Pregunta del gancho: visible desde el fotograma 0 y de vuelta al final (loop). */
export const HookV3: React.FC<{ frame: number; text: string }> = ({ frame, text }) => {
  const out = interpolate(frame, [CUE.hookEnd, CUE.hookEnd + CUE.hookOut], [1, 0], { ...CLAMP, easing: IN_CUBIC });
  const back = interpolate(frame, [CUE.hookReturn, CUE.hookReturn + CUE.hookReturnLen], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const op = frame < CUE.hookReturn ? out : back;
  if (op <= 0.001) return null;
  const H = LAYOUT.hookV3;
  return (
    <div
      style={{
        position: "absolute",
        left: H.cx - H.w / 2,
        width: H.w,
        top: H.cy - TYPE.hookV3 * 1.12,
        opacity: op,
        textAlign: "center",
        fontFamily: FONTS.display,
        fontWeight: 600,
        fontSize: TYPE.hookV3,
        lineHeight: 1.08,
        color: UI.bone,
        textShadow: `0 3px 18px ${UI.shadow}`,
      }}
    >
      <span style={{ background: UI.veilStrong, padding: "4px 18px 8px", borderRadius: 14, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{text}</span>
    </div>
  );
};
