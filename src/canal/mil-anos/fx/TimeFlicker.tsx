import React from "react";
import { AbsoluteFill } from "remotion";
import { TAU } from "../anim";
import type { Clock } from "../clock";

/** Oscilación día/noche durante un salto: ±18 %, 3 ciclos por salto. */
export const flickerAt = (frame: number, clock: Clock): number => {
  const j = clock.jumpAt(frame);
  if (!j) return 0;
  return 0.18 * Math.sin(TAU * 3 * j.t) * Math.sin(Math.PI * j.t);
};

/** Intensidad del «ruido del tiempo» (0 en lectura, 1 en el centro de un salto). */
export const warpIntensity = (frame: number, clock: Clock): number => {
  const j = clock.jumpAt(frame);
  return j ? Math.sin(Math.PI * j.t) : 0;
};

/** Frame «acelerado» para micro-movimientos (partículas) que corren más rápido en los saltos. */
export const warpFrame = (frame: number, clock: Clock): number => {
  let extra = 0;
  for (const s of clock.segments) {
    if (s.kind !== "jump") continue;
    extra += Math.max(0, Math.min(frame, s.to) - s.from) * 5;
  }
  return frame + extra;
};

/** Brillo que parpadea día/noche en los saltos (filtro de brillo: no desenfoca). */
export const TimeFlicker: React.FC<{ frame: number; clock: Clock; children: React.ReactNode }> = ({ frame, clock, children }) => {
  const f = flickerAt(frame, clock);
  return <AbsoluteFill style={{ filter: f === 0 ? undefined : `brightness(${1 + f})` }}>{children}</AbsoluteFill>;
};
