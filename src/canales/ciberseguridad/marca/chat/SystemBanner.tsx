import React from "react";
import { COLOR, TYPE } from "../theme";

/** Aviso del sistema («Tu número se registró en otro teléfono»), en rojo: SOLO el momento de la pérdida. */
export const SystemBanner: React.FC<{ texto: string; t?: number }> = ({ texto, t = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 14,
      right: 14,
      top: 60,
      borderRadius: 26,
      background: COLOR.danger,
      color: COLOR.ink,
      ...TYPE.uiStrong,
      fontSize: 34,
      lineHeight: 1.2,
      padding: "22px 26px",
      opacity: t,
      transform: `translateY(${(1 - t) * -30}px)`,
    }}
  >
    {texto.split("\n").map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);
