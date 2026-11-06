import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, SAFE, TYPE, UI } from "../../theme";

export type CalloutSpec = { from: number; to: number; text: string; target: { x: number; y: number }; label: { x: number; y: number } };

/**
 * Indicación grande con flecha hacia la pieza que cambia (como mucho una por plano).
 * `label` es el punto donde nace la flecha desde el rótulo; el rótulo se acomoda dentro de x 80–900.
 */
export const Callout: React.FC<{ frame: number; spec: CalloutSpec }> = ({ frame, spec }) => {
  if (frame < spec.from || frame >= spec.to) return null;
  const tin = interpolate(frame, [spec.from, spec.from + 8], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
  const tout = interpolate(frame, [spec.to - 8, spec.to], [0, 1], { ...CLAMP, easing: IN_CUBIC });
  const op = tin * (1 - tout);
  const { target: t, label: l } = spec;
  const lineT = interpolate(frame, [spec.from + 2, spec.from + 12], [0, 1], CLAMP);
  const ex = l.x + (t.x - l.x) * lineT;
  const ey = l.y + (t.y - l.y) * lineT;
  const boxW = spec.text.length * TYPE.callout * 0.46 + 36;
  const left = Math.max(SAFE.left, Math.min(SAFE.channelRight - boxW, l.x - boxW / 2));
  const above = l.y < t.y;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={l.x} y1={l.y} x2={ex} y2={ey} stroke={UI.bone} strokeWidth={4} strokeLinecap="round" />
        <circle cx={t.x} cy={t.y} r={10 * lineT} fill="none" stroke={UI.bone} strokeWidth={4} />
        <circle cx={t.x} cy={t.y} r={4 * lineT} fill={UI.bone} />
      </svg>
      <div
        style={{
          position: "absolute",
          left,
          top: above ? l.y - TYPE.callout * 1.25 - 6 : l.y + 6,
          padding: "4px 18px 8px",
          borderRadius: 10,
          background: UI.veilStrong,
          color: UI.bone,
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: TYPE.callout,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
        }}
      >
        {spec.text}
      </div>
    </div>
  );
};

/** Rótulo chico permanente («representación», «simulación»). */
export const SmallTag: React.FC<{ frame: number; from: number; to: number; text: string; x: number; y: number }> = ({ frame, from, to, text, x, y }) => {
  if (frame < from || frame >= to) return null;
  const op = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: op,
        padding: "2px 12px 4px",
        borderRadius: 6,
        background: UI.veilStrong,
        color: UI.ash,
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: TYPE.small,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </div>
  );
};
