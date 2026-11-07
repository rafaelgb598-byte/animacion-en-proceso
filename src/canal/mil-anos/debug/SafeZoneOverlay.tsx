import React from "react";
import { SAFE, SERIES_FONTS, SERIES_UI } from "../theme";

/** Zona segura de textos (x 80–940, y 240–1420) y límites del canal (x 900, y 1536). */
export const SafeZoneOverlay: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top,
        width: SAFE.right - SAFE.left,
        height: SAFE.bottom - SAFE.top,
        border: `3px dashed ${SERIES_UI.safeZone}`,
        boxSizing: "border-box",
      }}
    />
    <div style={{ position: "absolute", left: 0, top: SAFE.channelBottom, width: 1080, height: 2, background: SERIES_UI.safeZone, opacity: 0.5 }} />
    <div style={{ position: "absolute", left: SAFE.channelRight, top: 0, width: 2, height: 1920, background: SERIES_UI.safeZone, opacity: 0.5 }} />
  </>
);

/** Lectura del año continuo (solo depuración). */
export const YearReadout: React.FC<{ frame: number; year: number }> = ({ frame, year }) => (
  <div style={{ position: "absolute", right: 20, bottom: 20, padding: "6px 12px", background: SERIES_UI.debug, color: SERIES_UI.bone, fontFamily: SERIES_FONTS.mono, fontSize: 26 }}>
    f{frame} · {year.toFixed(4)}
  </div>
);
