// V3 · Tiempo: frames → años, voz y planos. Único lugar con números de frame.
// Misma interfaz que la línea de tiempo de la V2 (los componentes copiados la leen igual).
import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION = 1350;
/** Desde acá el mundo vuelve al año 0 (el recuerdo); la electricidad vuelve a estar «encendida». */
export const LOOP_CUT = 1060;

export const DAY = 1 / 365;
export const WEEK = 7 / 365;

type Segment = { from: number; to: number; y0: number; y1: number; kind: "hold" | "jump" | "read" | "slow" };

/**
 * Tramos. "jump" = salto (timelapse, log10 con bezier); "slow" = lectura lenta en escala log
 * (corte de luz y derrumbe 30→50); "read" = deriva lineal mínima; "hold" = fijo.
 */
export const SEGMENTS: readonly Segment[] = [
  { from: 0, to: 86, y0: 0, y1: 0, kind: "hold" },
  { from: 86, to: 240, y0: DAY, y1: WEEK, kind: "slow" },
  { from: 240, to: 256, y0: WEEK, y1: 1, kind: "jump" },
  { from: 256, to: 364, y0: 1, y1: 1.3, kind: "read" },
  { from: 364, to: 380, y0: 1.3, y1: 10, kind: "jump" },
  { from: 380, to: 482, y0: 10, y1: 12, kind: "read" },
  { from: 482, to: 494, y0: 12, y1: 30, kind: "jump" },
  { from: 494, to: 556, y0: 30, y1: 50, kind: "slow" },
  { from: 556, to: 662, y0: 50, y1: 55, kind: "read" },
  { from: 662, to: 680, y0: 55, y1: 200, kind: "jump" },
  { from: 680, to: 836, y0: 200, y1: 210, kind: "read" },
  { from: 836, to: 852, y0: 210, y1: 1000, kind: "jump" },
  { from: 852, to: LOOP_CUT, y0: 1000, y1: 1000, kind: "hold" },
  { from: LOOP_CUT, to: DURATION, y0: 0, y1: 0, kind: "hold" },
];

const JUMP_EASE = Easing.bezier(0.65, 0, 0.35, 1);
const SLOW_EASE = Easing.bezier(0.4, 0, 0.6, 1);

const segmentAt = (frame: number): Segment => {
  for (const s of SEGMENTS) if (frame >= s.from && frame < s.to) return s;
  return SEGMENTS[SEGMENTS.length - 1];
};

export const yearAt = (frame: number): number => {
  const s = segmentAt(frame);
  if (s.kind === "hold") return s.y0;
  const t = interpolate(frame, [s.from, s.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (s.kind === "read") return s.y0 + (s.y1 - s.y0) * t;
  const e = s.kind === "jump" ? JUMP_EASE(t) : SLOW_EASE(t);
  return Math.pow(10, Math.log10(s.y0) + (Math.log10(s.y1) - Math.log10(s.y0)) * e);
};

/** Solo los saltos rápidos cuentan como «timelapse» (flicker, rueda del contador, barrido). */
export const jumpAt = (frame: number): { t: number; index: number; from: number; to: number } | null => {
  const jumps = SEGMENTS.filter((s) => s.kind === "jump");
  for (let i = 0; i < jumps.length; i++) {
    const s = jumps[i];
    if (frame >= s.from && frame < s.to) return { t: (frame - s.from) / (s.to - s.from), index: i, from: s.from, to: s.to };
  }
  return null;
};

/** Tramos donde el contador rueda (saltos y lecturas lentas). */
export const rollingAt = (frame: number): boolean => {
  const s = segmentAt(frame);
  return s.kind === "jump" || s.kind === "slow";
};

export const JUMP_STARTS: readonly number[] = SEGMENTS.filter((s) => s.kind === "jump").map((s) => s.from);
export const JUMP_ENDS: readonly number[] = SEGMENTS.filter((s) => s.kind === "jump" || s.kind === "slow").map((s) => s.to);

export const frameAtYear = (year: number): number => {
  for (let f = 0; f < LOOP_CUT; f++) if (yearAt(f) >= year) return f;
  return LOOP_CUT;
};

export const MILESTONES = [
  { year: 0, label: "AÑO 0", words: "" },
  { year: WEEK, label: "1 SEMANA", words: "" },
  { year: 1, label: "AÑO 1", words: "" },
  { year: 10, label: "AÑO 10", words: "" },
  { year: 30, label: "AÑO 30", words: "" },
  { year: 50, label: "AÑO 50", words: "" },
  { year: 200, label: "AÑO 200", words: "" },
  { year: 1000, label: "AÑO 1.000", words: "" },
] as const;

/**
 * Años de los eventos con caída o rotura. La ventana se rompe en cámara, sincronizada con
 * «Se rompe la ventana» (f≈386); los derrumbes 35–48,5 quedan repartidos en la lectura lenta 30→50.
 */
export const EVENT_YEARS = {
  glassBreak: 10.12,
  lampFall: 35,
  collapse: 44,
  wallPanels: [36, 38.5, 41, 43.5, 46, 48.5],
  chargerDrop: 46,
  rainStart: 30,
  rainEnd: 60,
} as const;

export const EVENTS = {
  glassBreak: frameAtYear(EVENT_YEARS.glassBreak),
  lampFall: frameAtYear(EVENT_YEARS.lampFall),
  collapse: frameAtYear(EVENT_YEARS.collapse),
  wallPanels: EVENT_YEARS.wallPanels.map((y) => frameAtYear(y)),
  chargerDrop: frameAtYear(EVENT_YEARS.chargerDrop),
  rainStart: frameAtYear(EVENT_YEARS.rainStart),
  rainEnd: frameAtYear(EVENT_YEARS.rainEnd),
  year200: frameAtYear(200),
} as const;

/** Voz (Isaac): frame de entrada de cada toma. */
export const VOICE_CUES = {
  v3hook: 4,
  v3power: 86,
  year1: 250,
  year10: 364,
  year50: 548,
  year200: 672,
  year1000: 846,
  v3remains: 872,
  v3before: 972,
  v3photo: 1066,
  v3close: 1236,
} as const;
export type VoiceId = keyof typeof VOICE_CUES;

export const DUCK = { level: 0.4, attack: 4, release: 10 } as const;
export const SUB_FADE = 4;

/** Frames fijos del storyboard. */
export const CUE = {
  ticks: [] as number[],
  buzz: 45,
  buzzLen: 8,
  hookEnd: 72,
  hookOut: 8,
  hookReturn: 1336,
  hookReturnLen: 10,
  counterIn: 78,
  counterOutStart: 1040,
  lampDips: [106, 108],
  lampOff: 108,
  lampFade: 6,
  screenOff: 172,
  screenFade: 8,
  powerOff: 170,
  chargerHumEnd: 108,
  roomStart: 86,
  roomEnd: 494,
  windStart: 380,
  insectsStart: 690,
  insectsEnd: 836,
  meadowStart: 836,
  xrayStart: 184,
  xrayEnd: 240,
  glint: 1000,
  glintLen: 24,
  matchStart: 1060,
  matchEnd: 1085,
  decayStart: 1110,
  decayEnd: 1204,
  blackStart: 1220,
  photoBack: 1240,
  photoBackLen: 12,
  simStart: 1240,
  simEnd: 1326,
  photoNo: 99999,
  ghostLen: 1,
} as const;

/** Respiración / pulsos. */
export const PERIOD = { lampBreath: 60, screenPulse: 60, grassSway: 120, dustDrift: 240 } as const;
