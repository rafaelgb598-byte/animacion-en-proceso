// Curvas del canal (§ 10). Nada lineal salvo el rebobinado.
import { Easing, interpolate, spring } from "remotion";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** curva de cámara */
export const CAM_EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const OUT_CUBIC = Easing.out(Easing.cubic);
export const IN_CUBIC = Easing.in(Easing.cubic);

export const SPRING_MARKER = { damping: 14, stiffness: 140, mass: 0.8 } as const;
export const SPRING_SETTLE = { damping: 200 } as const;

/** Keyframes {f, v}: tramos con la curva de cámara, constantes fuera de rango. */
export type Key = { f: number; v: number };
export const track = (f: number, keys: readonly Key[], easing: (t: number) => number = CAM_EASE): number => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (f <= b.f) return b.f === a.f ? b.v : interpolate(f, [a.f, b.f], [a.v, b.v], { ...CLAMP, easing });
  }
  return keys[keys.length - 1].v;
};

/** Entrada de burbuja: 8 frames, sube 18 px + opacidad, out-cubic. */
export const enter = (f: number, at: number, len = 8) => interpolate(f, [at, at + len], [0, 1], { ...CLAMP, easing: OUT_CUBIC });
/** Salida: in-cubic, 10–15 frames (1 → 0). */
export const exit = (f: number, at: number, len = 12) => interpolate(f, [at, at + len], [1, 0], { ...CLAMP, easing: IN_CUBIC });
/** Visible entre [a, b) con entrada y salida. */
export const between = (f: number, a: number, b: number, inLen = 8, outLen = 12) => Math.min(enter(f, a, inLen), exit(f, b - outLen, outLen));

export const springIn = (frame: number, at: number, fps: number, config: { damping: number; stiffness?: number; mass?: number } = SPRING_SETTLE) =>
  frame < at ? 0 : spring({ frame: frame - at, fps, config });

/** Mezcla lineal de dos valores. */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
