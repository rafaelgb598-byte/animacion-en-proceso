// Grafo de contagio: nodos que se encienden de a uno y aristas que se dibujan (strokeDashoffset).
import React from "react";
import { interpolate } from "remotion";
import { CLAMP, OUT_CUBIC, between, enter } from "./anim";
import { IconoGrupo, IconoPersona } from "./chat/Iconos";
import { ALPHA, COLOR, TYPE } from "./theme";
import type { Episodio } from "./tipos";

const R = 46;

export const ContagionGraph: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const g = ep.grafo;
  const op = between(f, g.f, g.hasta, 10, 14);
  if (op <= 0) return null;
  const nodo = (id: string) => g.nodos.find((n) => n.id === id);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {g.aristas.map(([a, b]) => {
          const A = nodo(a);
          const B = nodo(b);
          if (!A || !B) return null;
          const len = Math.hypot(B.x - A.x, B.y - A.y) - 2 * R;
          const ux = (B.x - A.x) / (len + 2 * R);
          const uy = (B.y - A.y) / (len + 2 * R);
          const t = interpolate(f, [B.f - 10, B.f], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
          return (
            <line
              key={`${a}-${b}`}
              x1={A.x + ux * R}
              y1={A.y + uy * R}
              x2={B.x - ux * R}
              y2={B.y - uy * R}
              stroke={COLOR.text}
              strokeOpacity={0.7}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - t)}
            />
          );
        })}
      </svg>
      {g.nodos.map((n) => {
        const t = enter(f, n.f, 8);
        const I = n.icono === "grupo" ? IconoGrupo : IconoPersona;
        return (
          <div key={n.id} style={{ position: "absolute", left: n.x - 140, top: n.y - R, width: 280, display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.25 + 0.75 * t }}>
            <div
              style={{
                width: R * 2,
                height: R * 2,
                borderRadius: R,
                border: `4px solid ${COLOR.text}`,
                background: t > 0.5 ? COLOR.bubbleOut : ALPHA.glass,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${0.9 + 0.1 * t})`,
              }}
            >
              <I size={50} />
            </div>
            <div style={{ ...TYPE.monoBold, fontSize: 30, color: COLOR.text, marginTop: 10, whiteSpace: "nowrap" }}>{n.etiqueta}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 90, top: g.nodos[0].y - 120, ...TYPE.mono, fontSize: 26, letterSpacing: "0.12em", color: COLOR.muted }}>{g.titulo}</div>
    </div>
  );
};
