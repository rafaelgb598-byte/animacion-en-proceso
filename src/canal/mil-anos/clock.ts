// Serie «1000 años» · Reloj del episodio: frames → años, a partir de una lista de tramos.
// Generaliza el timeline del celular v4 para que el contador, la barra y los efectos de tiempo
// lean el reloj de cada episodio por props (en la v4 lo importaban directo).
import { Easing, interpolate } from "remotion";

export const DAY = 1 / 365;
export const WEEK = 7 / 365;
export const MONTH = 1 / 12;

/**
 * "hold" = fijo; "read" = deriva lineal mínima (para leer); "slow" = lectura lenta en escala log
 * (el contador rueda); "jump" = salto rápido en escala log (timelapse, parpadeo día/noche y barrido).
 */
export type SegmentKind = "hold" | "jump" | "read" | "slow";
export type Segment = { from: number; to: number; y0: number; y1: number; kind: SegmentKind };
export type Milestone = { year: number; label: string };
/** Unidad del contador mientras rueda: vale hasta `upTo` años y cuenta `perYear` unidades por año. */
export type CounterUnit = { upTo: number; prefix: string; perYear: number };

export type Clock = {
  segments: readonly Segment[];
  milestones: readonly Milestone[];
  units: readonly CounterUnit[];
  /** Primer frame del corte de loop (desde acá el mundo vuelve al año 0). */
  loopCut: number;
  yearAt: (frame: number) => number;
  jumpAt: (frame: number) => { t: number; index: number; from: number; to: number } | null;
  rollingAt: (frame: number) => boolean;
  frameAtYear: (year: number) => number;
  milestoneAt: (year: number) => Milestone;
  unitAt: (year: number) => CounterUnit;
  /** Frames donde empieza un salto (barrido de sonido). */
  jumpStarts: readonly number[];
  /** Frames donde termina un tramo que rueda (golpe del odómetro). */
  rollEnds: readonly number[];
  /** Frames donde el contador cambia de unidad (DÍA → SEMANA → MES → AÑO): clic de odómetro. */
  unitChanges: readonly number[];
};

const JUMP_EASE = Easing.bezier(0.65, 0, 0.35, 1);
const SLOW_EASE = Easing.bezier(0.4, 0, 0.6, 1);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const makeClock = (cfg: {
  segments: readonly Segment[];
  milestones: readonly Milestone[];
  units: readonly CounterUnit[];
  loopCut: number;
}): Clock => {
  const { segments, milestones, units, loopCut } = cfg;
  const segmentAt = (frame: number): Segment => {
    for (const s of segments) if (frame >= s.from && frame < s.to) return s;
    return segments[segments.length - 1];
  };
  const yearAt = (frame: number): number => {
    const s = segmentAt(frame);
    if (s.kind === "hold") return s.y0;
    const t = interpolate(frame, [s.from, s.to], [0, 1], CLAMP);
    if (s.kind === "read") return s.y0 + (s.y1 - s.y0) * t;
    const e = s.kind === "jump" ? JUMP_EASE(t) : SLOW_EASE(t);
    return Math.pow(10, Math.log10(s.y0) + (Math.log10(s.y1) - Math.log10(s.y0)) * e);
  };
  const jumps = segments.filter((s) => s.kind === "jump");
  const jumpAt = (frame: number) => {
    for (let i = 0; i < jumps.length; i++) {
      const s = jumps[i];
      if (frame >= s.from && frame < s.to) return { t: (frame - s.from) / (s.to - s.from), index: i, from: s.from, to: s.to };
    }
    return null;
  };
  const rollingAt = (frame: number) => {
    const k = segmentAt(frame).kind;
    return k === "jump" || k === "slow";
  };
  const frameAtYear = (year: number): number => {
    for (let f = 0; f < loopCut; f++) if (yearAt(f) >= year) return f;
    return loopCut;
  };
  const milestoneAt = (year: number): Milestone => {
    let m = milestones[0];
    for (const ms of milestones) if (year >= ms.year - 1e-9) m = ms;
    return m;
  };
  const unitAt = (year: number): CounterUnit => units.find((u) => year < u.upTo) ?? units[units.length - 1];
  const unitChanges: number[] = [];
  for (let f = 1; f < loopCut; f++) {
    const a = yearAt(f - 1);
    const b = yearAt(f);
    if (a > 0 && unitAt(a).prefix !== unitAt(b).prefix) unitChanges.push(f);
  }
  return {
    segments,
    milestones,
    units,
    loopCut,
    yearAt,
    jumpAt,
    rollingAt,
    frameAtYear,
    milestoneAt,
    unitAt,
    jumpStarts: jumps.map((s) => s.from),
    rollEnds: segments.filter((s) => s.kind === "jump" || s.kind === "slow").map((s) => s.to),
    unitChanges,
  };
};
