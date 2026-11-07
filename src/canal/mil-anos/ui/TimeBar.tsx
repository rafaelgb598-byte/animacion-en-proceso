import React from "react";
import { DAY } from "../clock";
import { SERIES_LAYOUT, SERIES_UI } from "../theme";

const L0 = Math.log10(DAY);
const L1 = 3;
const B = SERIES_LAYOUT.bar;

export const barX = (year: number) => {
  const l = Math.log10(Math.max(year, DAY));
  return B.x0 + ((Math.min(l, L1) - L0) / (L1 - L0)) * (B.x1 - B.x0);
};

/** Barra logarítmica de la serie (1 día → 1.000 años) bajo el contador; el punto es ámbar. */
export const TimeBar: React.FC<{ year: number; opacity: number }> = ({ year, opacity }) => {
  if (opacity <= 0.001) return null;
  const x = year <= 0 ? B.x0 : barX(year);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ position: "absolute", left: B.x0 - 14, top: B.y - 14, width: B.x1 - B.x0 + 28, height: 28, borderRadius: 14, background: SERIES_UI.veilStrong }} />
      <div style={{ position: "absolute", left: B.x0, top: B.y - 3, width: B.x1 - B.x0, height: 6, borderRadius: 3, background: SERIES_UI.ash, opacity: 0.45 }} />
      <div style={{ position: "absolute", left: B.x0, top: B.y - 3, width: x - B.x0, height: 6, borderRadius: 3, background: SERIES_UI.amber, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: x - 10, top: B.y - 10, width: 20, height: 20, borderRadius: 10, background: SERIES_UI.amber }} />
    </div>
  );
};
