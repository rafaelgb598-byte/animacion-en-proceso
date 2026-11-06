import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONTS, UI } from "../../theme";

export const SHEET_FRAMES = [0, 45, 92, 150, 215, 300, 365, 450, 545, 640, 725, 820, 905, 980, 1030, 1080, 1120, 1160, 1199] as const;
const COLS = 7;
const TW = 360;
const TH = 640;
const LABEL = 34;
const GAP = 8;
export const UEP_SHEET_W = COLS * TW + (COLS + 1) * GAP;
export const UEP_SHEET_H = Math.ceil(SHEET_FRAMES.length / COLS) * (TH + LABEL + GAP) + GAP;

/**
 * Hoja de contactos a 360 px de ancho (reconocimiento y legibilidad móvil).
 * Lee los stills copiados temporalmente a public/videos/03-1000-anos/v2/qa/ por scripts/contact-sheet-ultimo.mjs.
 */
export const ContactSheet: React.FC = () => (
  <AbsoluteFill style={{ background: UI.ink }}>
    {SHEET_FRAMES.map((f, i) => {
      const x = GAP + (i % COLS) * (TW + GAP);
      const y = GAP + Math.floor(i / COLS) * (TH + LABEL + GAP);
      return (
        <div key={f} style={{ position: "absolute", left: x, top: y, width: TW, height: TH + LABEL }}>
          <Img src={staticFile(`videos/03-1000-anos/v2/qa/MilAnosCelularV2-${String(f).padStart(4, "0")}.png`)} style={{ width: TW, height: TH }} />
          <div style={{ position: "absolute", top: TH + 4, left: 0, color: UI.bone, fontFamily: FONTS.mono, fontSize: 22 }}>f{f}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
