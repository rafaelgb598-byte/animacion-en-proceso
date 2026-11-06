import React from "react";
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { CUE, LABEL_CUES, type LabelKey } from "../../timeline";

const LIFE = CUE.labelIn + CUE.labelHold + CUE.labelOut;

/** Etiquetas «objeto · estado»: Plex Mono 500 30 px, apiladas hacia arriba desde (100, 1300), máximo 3. */
export const DecayLabels: React.FC<{ frame: number; texts: Record<LabelKey, string> }> = ({ frame, texts }) => {
  const visible = LABEL_CUES.filter((c) => frame >= c.frame && frame < c.frame + LIFE);
  return (
    <>
      {visible.slice(-CUE.labelMax).map((c) => {
        const slot = LABEL_CUES.filter((o) => o.frame < c.frame && c.frame < o.frame + LIFE).length;
        const local = frame - c.frame;
        const inT = interpolate(local, [0, CUE.labelIn], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
        const outT = interpolate(local, [LIFE - CUE.labelOut, LIFE], [0, 1], { ...CLAMP, easing: IN_CUBIC });
        const y = LAYOUT.labels.y + slot * LAYOUT.labels.step;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: LAYOUT.labels.x,
              top: y - TYPE.label,
              fontFamily: FONTS.mono,
              fontWeight: 500,
              fontSize: TYPE.label,
              lineHeight: `${TYPE.label * 1.2}px`,
              color: UI.ash,
              whiteSpace: "nowrap",
              opacity: inT * (1 - outT),
              transform: `translateY(${(1 - inT) * 12}px)`,
              padding: "2px 10px",
              marginLeft: -10,
              background: UI.veil,
              borderRadius: 6,
              textShadow: `0 1px 8px ${UI.shadow}`,
            }}
          >
            {texts[c.key]}
          </div>
        );
      })}
    </>
  );
};
