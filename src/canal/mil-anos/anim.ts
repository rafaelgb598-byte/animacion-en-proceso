// Serie «1000 años» · Utilidades de animación. Sin Math.random ni Date: azar con random('semilla').
import { Easing, interpolate, spring } from "remotion";
import { VIDEO } from "./theme";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TAU = Math.PI * 2;

export const CAM_EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const OUT_CUBIC = Easing.out(Easing.cubic);
export const IN_CUBIC = Easing.in(Easing.cubic);

/** interpolate con clamp en los dos extremos. */
export const lerp = (x: number, input: readonly number[], output: readonly number[], easing?: (t: number) => number) =>
  interpolate(x, input as number[], output as number[], { ...CLAMP, easing });

/** Rampa 0 → 1 lineal en años (clamp). */
export const ramp = (year: number, a: number, b: number) => lerp(year, [a, b], [0, 1]);

/** Rampa 0 → 1 en escala logarítmica de años (para curvas que cruzan días y siglos). */
export const lramp = (year: number, a: number, b: number) => {
  if (year <= a) return 0;
  if (year >= b) return 1;
  return (Math.log10(year) - Math.log10(a)) / (Math.log10(b) - Math.log10(a));
};

/** Caídas: spring({damping 14, stiffness 140, mass 0.8}) disparado en `eventFrame`, solo si `active`. */
export const fall = (frame: number, eventFrame: number, active: boolean): number => {
  if (!active || frame < eventFrame) return 0;
  return spring({ frame: frame - eventFrame, fps: VIDEO.fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });
};

/** Caída pesada sin rebote (gravedad: arranca lento y golpea). */
export const drop = (frame: number, eventFrame: number, len: number, active: boolean): number => {
  if (!active) return 0;
  return lerp(frame, [eventFrame, eventFrame + len], [0, 1], IN_CUBIC);
};

/** Reacomodos suaves. */
export const settle = (frame: number, eventFrame: number, active: boolean): number => {
  if (!active || frame < eventFrame) return 0;
  return spring({ frame: frame - eventFrame, fps: VIDEO.fps, config: { damping: 200 } });
};
