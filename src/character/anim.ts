import { Easing } from "remotion";

/**
 * Herramientas de animación por fotogramas.
 *
 * Cada "canal" (ángulo del hombro, inclinación de la cabeza, apertura de boca…)
 * se anima con su propia lista de claves. Así distintas partes del cuerpo
 * pueden moverse con tiempos distintos (overlapping action), en vez de que
 * todo el cuerpo cambie de pose al mismo tiempo como un robot.
 */

export type EaseFn = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  /** Aceleración y desaceleración suaves (slow in / slow out). */
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  /** Arranca rápido y se asienta: bueno para gestos decididos. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Arranca lento y termina rápido: caídas, impactos. */
  in: Easing.bezier(0.55, 0, 0.85, 0.35),
  /** Pasa de largo y vuelve: remate con energía. */
  overshoot: Easing.bezier(0.34, 1.6, 0.64, 1),
  /** Desaceleración que empalma con una velocidad constante (frenar al caminar). */
  decel: Easing.bezier(0.33, 0.66, 0.5, 1),
  /** Movimiento de ojos (sacada): casi instantáneo. */
  saccade: Easing.bezier(0.1, 0.9, 0.2, 1),
};

/** [fotograma, valor, easing del tramo que TERMINA en esta clave] */
export type Key = [number, number, EaseFn?];

export const track = (f: number, keys: Key[]): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (e ?? ease.inOut)(t);
    }
  }
  return keys[keys.length - 1][1];
};

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Interpola todos los campos numéricos de dos objetos planos. */
export const mix = <T extends Record<string, number>>(a: T, b: T, t: number): T => {
  const out = {} as Record<string, number>;
  for (const k in a) out[k] = lerp(a[k], b[k] ?? a[k], t);
  return out as T;
};

/** Claves de objetos completos (por ejemplo expresiones faciales). */
export type PoseKey<T> = [number, T, EaseFn?];
export const poseTrack = <T extends Record<string, number>>(
  f: number,
  keys: PoseKey<T>[],
): T => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return mix(v0, v1, (e ?? ease.inOut)(t));
    }
  }
  return keys[keys.length - 1][1];
};

/**
 * Seguidor con resorte (follow-through / movimiento secundario).
 * Simula de forma determinista un resorte amortiguado que persigue a `signal`.
 * Se recalcula desde el fotograma `from`, por eso es estable al renderizar en paralelo.
 */
export const follow = (
  f: number,
  signal: (f: number) => number,
  opts: { stiffness?: number; damping?: number; from?: number } = {},
): number => {
  const { stiffness = 0.18, damping = 0.72, from = 0 } = opts;
  let x = signal(from);
  let v = 0;
  const end = Math.floor(f);
  for (let i = from + 1; i <= end; i++) {
    v = v * damping + (signal(i) - x) * stiffness;
    x += v;
  }
  return x;
};

/** Parpadeo: 1 = abierto, ~0 = cerrado. Cierra en 2 fotogramas, abre en 3. */
export const blink = (f: number, at: number[]): number => {
  let v = 1;
  for (const b of at) {
    const d = f - b;
    if (d >= -2 && d <= 3) {
      const c = d < 0 ? 1 - (d + 2) / 2 : d / 3;
      v = Math.min(v, Math.max(0.05, c));
    }
  }
  return v;
};

/** Oscilación amortiguada para rebotes de objetos. */
export const wobble = (f: number, start: number, amp: number, freq = 0.45, decay = 7) => {
  if (f < start) return 0;
  const t = f - start;
  return amp * Math.exp(-t / decay) * Math.sin(t * freq);
};
