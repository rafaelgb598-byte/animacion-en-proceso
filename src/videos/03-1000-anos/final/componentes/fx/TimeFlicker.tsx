import React from "react";
import { AbsoluteFill } from "remotion";
import { TAU } from "../../lib/anim";
import { jumpAt, SEGMENTS } from "../../timeline";

/** Oscilación día/noche durante un salto: ±18 %, 3 ciclos por salto. */
export const flickerAt = (frame: number): number => {
  const j = jumpAt(frame);
  if (!j) return 0;
  return 0.18 * Math.sin(TAU * 3 * j.t) * Math.sin(Math.PI * j.t);
};

/** Intensidad del «ruido del tiempo» (0 en lectura, 1 en el centro de un salto). */
export const warpIntensity = (frame: number): number => {
  const j = jumpAt(frame);
  return j ? Math.sin(Math.PI * j.t) : 0;
};

/** Frame «acelerado» para micro-movimientos (partículas) que corren más rápido en los saltos. */
export const warpFrame = (frame: number): number => {
  let extra = 0;
  for (const s of SEGMENTS) {
    if (s.kind !== "jump") continue;
    extra += Math.max(0, Math.min(frame, s.to) - s.from) * 5;
  }
  return frame + extra;
};

export const TimeFlicker: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const f = flickerAt(frame);
  return <AbsoluteFill style={{ filter: f === 0 ? undefined : `brightness(${1 + f})` }}>{children}</AbsoluteFill>;
};
