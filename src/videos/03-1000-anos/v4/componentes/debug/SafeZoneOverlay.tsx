import React from "react";
import { SAFE, UI } from "../../theme";

/** Zona segura de textos (x 80–940, y 240–1420) y límite del canal (x 900). */
export const SafeZoneOverlay: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top,
        width: SAFE.right - SAFE.left,
        height: SAFE.bottom - SAFE.top,
        border: `3px dashed ${UI.safeZone}`,
        boxSizing: "border-box",
      }}
    />
    <div style={{ position: "absolute", left: 0, top: 1536, width: 1080, height: 2, background: UI.safeZone, opacity: 0.5 }} />
    <div style={{ position: "absolute", left: SAFE.channelRight, top: 0, width: 2, height: 1920, background: UI.safeZone, opacity: 0.5 }} />
  </>
);
