import React from "react";
import { ZONA } from "../../../canal/zonaSegura";
import { ALPHA, COLOR, TYPE } from "./theme";

/** «RECREACIÓN» visible todo el video, arriba a la derecha dentro de la zona segura; a la izquierda, el número de caso. */
export const RecreationTag: React.FC<{ texto: string; caso: string }> = ({ texto, caso }) => (
  <>
    <div
      style={{
        position: "absolute",
        right: 1080 - ZONA.right,
        top: ZONA.top + 4,
        ...TYPE.monoBold,
        fontSize: 26,
        letterSpacing: "0.12em",
        color: COLOR.text,
        border: `2px solid ${ALPHA.glassEdge}`,
        background: ALPHA.glass,
        borderRadius: 8,
        padding: "4px 12px",
      }}
    >
      {texto}
    </div>
    <div style={{ position: "absolute", left: 180, top: ZONA.top + 8, ...TYPE.mono, fontSize: 26, letterSpacing: "0.1em", color: COLOR.muted }}>{caso}</div>
  </>
);
