import React from "react";
import { FONTS, UI } from "../../theme";

export const YearReadout: React.FC<{ frame: number; year: number }> = ({ frame, year }) => (
  <div style={{ position: "absolute", right: 20, top: 20, padding: "6px 12px", background: UI.debug, color: UI.bone, fontFamily: FONTS.mono, fontSize: 24 }}>
    f{frame} · año {year < 1 ? year.toFixed(4) : year.toFixed(2)}
  </div>
);
