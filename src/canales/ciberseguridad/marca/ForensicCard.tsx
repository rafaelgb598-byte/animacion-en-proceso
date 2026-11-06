// Ficha forense («SI YA TE PASÓ»): tarjeta centrada en la zona segura, con acento turquesa (defensa).
import React from "react";
import { CENTRO_X, ANCHO_TEXTO_MAX } from "../../../canal/zonaSegura";
import { between } from "./anim";
import { ALPHA, COLOR, TYPE } from "./theme";

export const ForensicCard: React.FC<{ f: number; desde: number; hasta: number; titulo: string; lineas: string[]; top?: number }> = ({ f, desde, hasta, titulo, lineas, top = 520 }) => {
  const t = between(f, desde, hasta, 10, 12);
  if (t <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: ALPHA.dim, opacity: t }} />
      <div
        style={{
          position: "absolute",
          left: CENTRO_X - ANCHO_TEXTO_MAX / 2,
          width: ANCHO_TEXTO_MAX,
          top,
          opacity: t,
          transform: `translateY(${(1 - t) * 24}px)`,
          background: COLOR.slate,
          borderRadius: 22,
          border: `2px solid ${ALPHA.glassEdge}`,
          boxShadow: `0 40px 80px ${ALPHA.shadow}`,
          padding: "40px 44px 44px",
          borderLeft: `10px solid ${COLOR.safe}`,
        }}
      >
        <div style={{ ...TYPE.monoBold, fontSize: 40, letterSpacing: "0.08em", color: COLOR.safe }}>{titulo}</div>
        {lineas.map((l, i) => (
          <div key={i} style={{ ...TYPE.uiStrong, fontSize: 46, lineHeight: 1.22, color: COLOR.text, marginTop: i === 0 ? 26 : 30 }}>
            {l.split("\n").map((r, k) => (
              <div key={k}>{r}</div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
