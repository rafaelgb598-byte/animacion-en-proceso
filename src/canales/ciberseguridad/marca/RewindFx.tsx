// Rebobinado de la serie: contador de tiempo hacia atrás (Space Mono) y líneas de barrido horizontales.
// Es lo único lineal del canal (el tiempo de escena retrocede a velocidad constante).
import React from "react";
import { between } from "./anim";
import { ALPHA, COLOR, TYPE } from "./theme";
import type { Episodio } from "./tipos";

const reloj = (frames: number, fps: number) => {
  const s = Math.max(0, frames) / fps;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${String(m).padStart(2, "0")}:${r.toFixed(1).padStart(4, "0")}`;
};

export const RewindFx: React.FC<{ ep: Episodio; f: number; fps: number }> = ({ ep, f, fps }) => {
  const r = ep.rebobinado;
  const op = between(f, r.f - 2, r.hasta + 6, 4, 10);
  if (op <= 0) return null;
  const st = ep.escena(f);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 300 + ((i * 197 + (f - r.f) * 38) % 1000);
        return <div key={i} style={{ position: "absolute", left: 60, right: 180, top: y, height: 2, background: ALPHA.glassEdge }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: ALPHA.glass, border: `2px solid ${ALPHA.glassEdge}`, borderRadius: 14, padding: "12px 24px" }}>
          <svg width={64} height={36} viewBox="0 0 64 36">
            <path d="M30 2 L4 18 L30 34 Z M60 2 L34 18 L60 34 Z" fill={COLOR.text} />
          </svg>
          <span style={{ ...TYPE.monoBold, fontSize: 40, color: COLOR.text }}>{reloj(st, fps)}</span>
          <span style={{ ...TYPE.mono, fontSize: 26, color: COLOR.muted, letterSpacing: "0.12em" }}>{r.desde}</span>
        </div>
      </div>
    </div>
  );
};
