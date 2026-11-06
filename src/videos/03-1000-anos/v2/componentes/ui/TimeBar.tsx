import React from "react";
import { FONTS, LAYOUT, SAFE, TYPE, UI } from "../../theme";
import { DAY, WEEK } from "../../timeline";

const L0 = Math.log10(DAY);
const L1 = 3;
const B = LAYOUT.timeBar;

/** x de un año en la barra logarítmica (1 día → 1.000 años). */
export const barX = (year: number) => {
  const l = Math.log10(Math.max(year, DAY));
  return B.x0 + ((Math.min(l, L1) - L0) / (L1 - L0)) * (B.x1 - B.x0);
};

const MARKS = [
  { year: WEEK, label: "1 sem" },
  { year: 1, label: "1 a" },
  { year: 10, label: "10" },
  { year: 100, label: "100" },
  { year: 1000, label: "1.000" },
];

/** Barra de tiempo (y 1390, x 100–920). El último rótulo se alinea a la derecha para no pasar x = 900 (CLAUDE.md). */
export const TimeBar: React.FC<{ year: number; opacity: number }> = ({ year, opacity }) => {
  const x = year <= 0 ? B.x0 : barX(year);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity }}>
      <div style={{ position: "absolute", left: B.x0 - 14, top: B.y - 16, width: B.x1 - B.x0 + 28, height: 60, borderRadius: 10, background: UI.veilStrong }} />
      <div style={{ position: "absolute", left: B.x0, top: B.y - 2, width: B.x1 - B.x0, height: 4, background: UI.ash, opacity: 0.6, borderRadius: 2 }} />
      {MARKS.map((m, i) => {
        const mx = barX(m.year);
        const last = i === MARKS.length - 1;
        return (
          <React.Fragment key={m.label}>
            <div style={{ position: "absolute", left: mx - 1.5, top: B.y - 9, width: 3, height: 18, background: UI.ash, opacity: 0.6 }} />
            <div
              style={{
                position: "absolute",
                top: B.y + 12,
                left: last ? undefined : mx - 60,
                right: last ? 1080 - SAFE.channelRight : undefined,
                width: last ? undefined : 120,
                textAlign: last ? "right" : "center",
                fontFamily: FONTS.mono,
                fontWeight: 500,
                fontSize: TYPE.bar,
                color: UI.ash,
                textShadow: `0 1px 8px ${UI.shadow}`,
              }}
            >
              {m.label}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: x - 7, top: B.y - 7, width: 14, height: 14, borderRadius: 7, background: UI.amber, boxShadow: `0 0 10px ${UI.shadow}` }} />
    </div>
  );
};
