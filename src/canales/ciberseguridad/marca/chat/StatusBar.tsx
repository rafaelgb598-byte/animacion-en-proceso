import React from "react";
import { CHAT, COLOR, TYPE } from "../theme";
import { IconoBateria, IconoSenal } from "./Iconos";

/** Barra superior genérica: hora, señal y batería (sin íconos de ninguna marca). */
export const StatusBar: React.FC<{ hora: string }> = ({ hora }) => (
  <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", color: COLOR.text }}>
    <span style={{ ...TYPE.uiStrong, fontSize: CHAT.metaSize + 2 }}>{hora}</span>
    <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <IconoSenal size={20} />
      <IconoBateria size={20} />
    </span>
  </div>
);
