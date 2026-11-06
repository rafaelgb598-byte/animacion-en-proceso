import React from "react";
import { ALPHA, COLOR, TYPE } from "../theme";

/** El código con botón «Copiar». `presionado` 0..1 hunde el botón; `copiado` cambia la etiqueta. */
export const CodeChip: React.FC<{ valor: string; copiar: string; copiado: string; presionado?: number; hecho?: boolean }> = ({ valor, copiar, copiado, presionado = 0, hecho = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ ...TYPE.monoBold, fontSize: 44, color: COLOR.text, letterSpacing: "0.04em", background: ALPHA.hairline, borderRadius: 14, padding: "6px 16px" }}>{valor}</div>
    <div
      style={{
        ...TYPE.uiStrong,
        fontSize: 28,
        color: COLOR.text,
        border: `2px solid ${ALPHA.glassEdge}`,
        borderRadius: 999,
        padding: "8px 20px",
        background: presionado > 0 ? ALPHA.glassEdge : "transparent",
        transform: `scale(${1 - presionado * 0.06})`,
      }}
    >
      {hecho ? copiado : copiar}
    </div>
  </div>
);
