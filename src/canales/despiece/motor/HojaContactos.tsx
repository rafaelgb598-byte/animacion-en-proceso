// Hoja de contactos genérica: N fotogramas de un episodio en una grilla (Composition, no Still: <Freeze> necesita ir a cualquier frame).
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { COLOR, TYPE } from "../marca/theme";

export const HOJA = { cols: 4, esc: 0.25, rotulo: 44 } as const;
export const hojaTam = (n: number) => ({
  w: HOJA.cols * 1080 * HOJA.esc,
  h: Math.ceil(n / HOJA.cols) * (1920 * HOJA.esc + HOJA.rotulo),
});

export const HojaContactos: React.FC<{ frames: number[]; fps: number; render: () => React.ReactNode }> = ({ frames, fps, render }) => {
  const TW = 1080 * HOJA.esc;
  const TH = 1920 * HOJA.esc;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {frames.map((fr, i) => (
        <div key={fr} style={{ position: "absolute", left: (i % HOJA.cols) * TW, top: Math.floor(i / HOJA.cols) * (TH + HOJA.rotulo), width: TW, height: TH + HOJA.rotulo, overflow: "hidden" }}>
          <div style={{ height: HOJA.rotulo, fontFamily: TYPE.label.fontFamily, fontWeight: 700, fontSize: 26, color: COLOR.paper, padding: "6px 10px" }}>
            f{fr} · {(fr / fps).toFixed(1)} s
          </div>
          <div style={{ width: 1080, height: 1920, transform: `scale(${HOJA.esc})`, transformOrigin: "0 0", position: "relative", overflow: "hidden" }}>
            <Freeze frame={fr}>{render()}</Freeze>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
