import React from "react";
import { ALPHA, COLOR, TYPE } from "../theme";

/** Interruptor: `on` 0..1 (el resorte lo da quien lo usa). Encendido = turquesa (defensa). */
export const Toggle: React.FC<{ on: number }> = ({ on }) => {
  const w = 104;
  const h = 60;
  const k = Math.max(0, Math.min(1, on));
  return (
    <div style={{ width: w, height: h, borderRadius: h / 2, background: k > 0.5 ? COLOR.safe : ALPHA.glassEdge, position: "relative", flex: "none" }}>
      <div style={{ position: "absolute", top: 6, left: 6 + on * (w - h), width: h - 12, height: h - 12, borderRadius: (h - 12) / 2, background: COLOR.text }} />
    </div>
  );
};

/** Fila de ajustes con interruptor. */
export const SettingsRow: React.FC<{ titulo: string; detalle?: string; on: number }> = ({ titulo, detalle, on }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, background: COLOR.bubbleIn, borderRadius: 26, padding: "24px 24px", boxShadow: on > 0.5 ? `inset 0 0 0 3px ${COLOR.safe}` : "none" }}>
    <div style={{ flex: 1 }}>
      <div style={{ ...TYPE.uiStrong, fontSize: 38, lineHeight: 1.15, color: COLOR.text }}>
        {titulo.split("\n").map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {detalle ? (
        <div style={{ ...TYPE.ui, fontSize: 26, lineHeight: 1.25, color: COLOR.muted, marginTop: 8 }}>
          {detalle.split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ) : null}
    </div>
    <Toggle on={on} />
  </div>
);
