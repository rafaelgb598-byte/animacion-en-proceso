// Utilidades de animación (sección 8). Sin Math.random ni Date: azar con random('semilla').
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../timeline";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const lerp = (frame: number, input: readonly number[], output: readonly number[], easing?: (t: number) => number) =>
  interpolate(frame, input as number[], output as number[], { ...CLAMP, easing });

export const CAM_EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const OUT_CUBIC = Easing.out(Easing.cubic);
export const IN_CUBIC = Easing.in(Easing.cubic);

/** Caídas: spring({damping 14, stiffness 140, mass 0.8}) disparado en `eventFrame`, solo si el año ya cruzó el umbral. */
export const fall = (frame: number, eventFrame: number, active: boolean): number => {
  if (!active || frame < eventFrame) return 0;
  return spring({ frame: frame - eventFrame, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8 } });
};

/** Reacomodos suaves. */
export const settle = (frame: number, eventFrame: number, active: boolean): number => {
  if (!active || frame < eventFrame) return 0;
  return spring({ frame: frame - eventFrame, fps: FPS, config: { damping: 200 } });
};

export const TAU = Math.PI * 2;
