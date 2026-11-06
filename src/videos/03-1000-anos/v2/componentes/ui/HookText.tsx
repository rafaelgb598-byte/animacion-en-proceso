import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { CUE } from "../../timeline";

/** Gancho palabra por palabra (6 frames por palabra, sube 24 px), Barlow 600 64 px, centrado en y 1250. */
export const HookText: React.FC<{ frame: number; lines: readonly string[][] }> = ({ frame, lines }) => {
  if (frame >= CUE.hookEnd || frame < CUE.hookStart) return null;
  const out = interpolate(frame, [CUE.hookEnd - CUE.hookOut, CUE.hookEnd], [0, 1], { ...CLAMP, easing: IN_CUBIC });
  const lh = TYPE.hook * 1.18;
  const top = LAYOUT.hookY - (lines.length * lh) / 2;
  let wi = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top,
        opacity: 1 - out,
        transform: `translateY(${-10 * out}px)`,
        fontFamily: FONTS.display,
        fontWeight: 600,
        fontSize: TYPE.hook,
        lineHeight: `${lh}px`,
        color: UI.bone,
        textAlign: "center",
        textShadow: `0 3px 18px ${UI.shadow}`,
      }}
    >
      {lines.map((ws, li) => (
        <div key={li}>
          {ws.map((w, k) => {
            const start = CUE.hookStart + wi++ * CUE.hookWordStep;
            const t = interpolate(frame, [start, start + CUE.hookWordIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
            return (
              <span key={k} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 24}px)`, marginRight: k < ws.length - 1 ? "0.25em" : 0 }}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
