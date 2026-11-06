import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { FONTS, UI } from "../../theme";

export const contactSheetSchema = z.object({ frames: z.array(z.number()), prefix: z.string() });
type Props = z.infer<typeof contactSheetSchema>;

const COLS = 7;
const TW = 360;
const TH = 640;
const LABEL = 34;
const GAP = 8;
export const sheetSize = (n: number) => ({ width: COLS * TW + (COLS + 1) * GAP, height: Math.ceil(n / COLS) * (TH + LABEL + GAP) + GAP });

/** Hoja de contactos a 360 px desde PNG copiados temporalmente a public/videos/03-1000-anos/final/qa/. */
export const ContactSheetV3: React.FC<Props> = ({ frames, prefix }) => (
  <AbsoluteFill style={{ background: UI.ink }}>
    {frames.map((f, i) => (
      <div key={f} style={{ position: "absolute", left: GAP + (i % COLS) * (TW + GAP), top: GAP + Math.floor(i / COLS) * (TH + LABEL + GAP), width: TW, height: TH + LABEL }}>
        <Img src={staticFile(`videos/03-1000-anos/final/qa/${prefix}-${String(f).padStart(4, "0")}.png`)} style={{ width: TW, height: TH }} />
        <div style={{ position: "absolute", top: TH + 4, left: 0, color: UI.bone, fontFamily: FONTS.mono, fontSize: 22 }}>f{f}</div>
      </div>
    ))}
  </AbsoluteFill>
);
