// Presets de animación del canal Despiece. Nada lineal salvo la línea de corte (velocidad constante, «de regla»).
import { Easing, interpolate, spring } from "remotion";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const OUT = Easing.out(Easing.cubic);
export const IN = Easing.in(Easing.cubic);

/** resorte mecánico (pernos que se asientan) */
export const SPRING_PIN = { damping: 11, stiffness: 180, mass: 0.6 } as const;
export const SPRING_SOFT = { damping: 200 } as const;

/** 0 → 1 entre [a, a + len) con la curva dada */
export const ramp = (f: number, a: number, len: number, easing: (t: number) => number = EASE) =>
  len <= 0 ? (f >= a ? 1 : 0) : interpolate(f, [a, a + len], [0, 1], { ...CLAMP, easing });

/** visible entre [a, b) con entrada y salida */
export const between = (f: number, a: number, b: number, inLen = 10, outLen = 10) =>
  Math.min(ramp(f, a, inLen, OUT), 1 - ramp(f, b - outLen, outLen, IN));

/** Keyframes {f, v}: tramos con la curva del canal, constantes fuera de rango. */
export type Key = { f: number; v: number };
export const track = (f: number, keys: readonly Key[], easing: (t: number) => number = EASE): number => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (f <= b.f) return b.f === a.f ? b.v : interpolate(f, [a.f, b.f], [a.v, b.v], { ...CLAMP, easing });
  }
  return keys[keys.length - 1].v;
};

export const springAt = (f: number, at: number, fps: number, config: { damping: number; stiffness?: number; mass?: number } = SPRING_SOFT) =>
  f < at ? 0 : spring({ frame: f - at, fps, config });

/** latido periódico 0..1 que cierra el loop: el período tiene que dividir la duración del video */
export const pulse = (f: number, period: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * f) / period);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
