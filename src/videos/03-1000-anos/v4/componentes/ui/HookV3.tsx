import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { CUE } from "../../timeline";

/**
 * V4 · Pregunta del gancho palabra por palabra desde f0 (CUE.hookWordStep frames por palabra), sobre el cielo
 * de la pantalla, dentro de la zona segura. En f0 todavía no se ve ninguna palabra: el último frame (loop) es igual.
 */
export const HookV3: React.FC<{ frame: number; text: string }> = ({ frame, text }) => {
  const out = interpolate(frame, [CUE.hookOut, CUE.hookOut + CUE.hookOutLen], [1, 0], { ...CLAMP, easing: IN_CUBIC });
  if (out <= 0.001) return null;
  const H = LAYOUT.hookV3;
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: H.cx - H.w / 2,
        width: H.w,
        top: H.cy - TYPE.hookV3 * 1.12,
        opacity: out,
        textAlign: "center",
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: TYPE.hookV3,
        lineHeight: 1.12,
        color: UI.bone,
        textShadow: `0 3px 18px ${UI.shadow}`,
      }}
    >
      {words.map((w, i) => {
        const start = i * CUE.hookWordStep;
        const t = interpolate(frame, [start, start + CUE.hookWordIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: t,
              transform: `translateY(${(1 - t) * 18}px)`,
              background: UI.veilStrong,
              padding: "2px 10px 6px",
              margin: "0 2px 6px",
              borderRadius: 10,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
