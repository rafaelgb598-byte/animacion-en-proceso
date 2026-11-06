// V4 · Tiempo: frames → años, voz, planos, textos y sonidos. Único lugar con números de frame.
// Misma interfaz que la línea de tiempo de la V3 (los componentes copiados la leen igual).
import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION = 1327;
/** Desde acá el mundo vuelve al año 0 (el recuerdo): la electricidad vuelve a estar «encendida». */
export const LOOP_CUT = 1024;

export const DAY = 1 / 365;
export const WEEK = 7 / 365;

type Segment = { from: number; to: number; y0: number; y1: number; kind: "hold" | "jump" | "read" | "slow" };

/**
 * Tramos. "jump" = salto (timelapse, log10 con bezier); "slow" = lectura lenta en escala log
 * (los días del corte de luz y el derrumbe 30→50); "read" = deriva lineal mínima; "hold" = fijo.
 * El contador empieza a rodar en f40: el primer cambio de estado ocurre antes de f45.
 */
export const SEGMENTS: readonly Segment[] = [
  { from: 0, to: 40, y0: 0, y1: 0, kind: "hold" },
  { from: 40, to: 228, y0: DAY, y1: WEEK, kind: "slow" },
  { from: 228, to: 242, y0: WEEK, y1: 1, kind: "jump" },
  { from: 242, to: 344, y0: 1, y1: 1.3, kind: "read" },
  { from: 344, to: 358, y0: 1.3, y1: 10, kind: "jump" },
  { from: 358, to: 462, y0: 10, y1: 12, kind: "read" },
  { from: 462, to: 474, y0: 12, y1: 30, kind: "jump" },
  { from: 474, to: 520, y0: 30, y1: 50, kind: "slow" },
  { from: 520, to: 630, y0: 50, y1: 55, kind: "read" },
  { from: 630, to: 644, y0: 55, y1: 200, kind: "jump" },
  { from: 644, to: 800, y0: 200, y1: 210, kind: "read" },
  { from: 800, to: 814, y0: 210, y1: 1000, kind: "jump" },
  { from: 814, to: LOOP_CUT, y0: 1000, y1: 1000, kind: "hold" },
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

export const jumpAt = (frame: number): { t: number; index: number; from: number; to: number } | null => {
  const jumps = SEGMENTS.filter((s) => s.kind === "jump");
  for (let i = 0; i < jumps.length; i++) {
    const s = jumps[i];
    if (frame >= s.from && frame < s.to) return { t: (frame - s.from) / (s.to - s.from), index: i, from: s.from, to: s.to };
  }
  return null;
};

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

/** Frames donde el contador cambia de unidad (DÍA → SEMANA → AÑO): llevan clic de odómetro. */
export const UNIT_CHANGES: readonly number[] = [frameAtYear(DAY), frameAtYear(WEEK), frameAtYear(1)];

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

/** La ventana se rompe en cámara con «Se rompe la ventana» (f≈374); los derrumbes 35–48,5 quedan en la lectura lenta 30→50. */
export const EVENT_YEARS = {
  glassBreak: 10.3,
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

/** Voz (Isaac): frame de entrada de cada toma (todas existentes: no se generó voz nueva para la v4). */
export const VOICE_CUES = {
  v3hook: 2,
  v3power: 74,
  year1: 238,
  year10: 354,
  year50: 518,
  year200: 640,
  year1000: 810,
  v3remains: 834,
  v3before: 994,
  v4memory: 1088,
  photo: 1250,
} as const;
export type VoiceId = keyof typeof VOICE_CUES;

export const DUCK = { level: 0.4, attack: 4, release: 10 } as const;
export const SUB_FADE = 3;

/** Frames fijos del storyboard v4. */
export const CUE = {
  ticks: [] as number[],
  // gancho
  hookWordStep: 4,
  hookWordIn: 6,
  hookOut: 60,
  hookOutLen: 8,
  buzz: 6,
  buzzLen: 8,
  buzzAmp: 3,
  pushIn: [8, 40] as const,
  // corte de luz y plantado de la foto
  lampDips: [96, 98],
  lampOff: 98,
  lampFade: 6,
  screenOff: 162,
  screenFade: 8,
  powerOff: 96,
  chargerHumEnd: 98,
  xrayStart: 172,
  xrayEnd: 228,
  // ambiente
  roomStart: 74,
  roomEnd: 474,
  windStart: 358,
  insectsStart: 660,
  insectsEnd: 800,
  glassTick: 410,
  soil: 700,
  echoFrom: 700,
  echoTo: 800,
  // revelación: restos, etiquetas y carta
  callVidrio: [871, 891] as const,
  callMetal: [891, 912] as const,
  callPlastico: [912, 945] as const,
  glint: 915,
  glintLen: 24,
  card: 932,
  cardLen: 75,
  cardIn: 10,
  // epílogo de la memoria
  matchStart: 1024,
  matchEnd: 1049,
  decayStart: 1154,
  decayEnd: 1216,
  fadeBlack: 1238,
  fadeBlackLen: 10,
  photoNoText: [1248, 1282] as const,
  cta: [1282, 1318] as const,
  loopReturn: 1318,
  loopReturnLen: 8,
  // compatibilidad con componentes copiados
  photoNo: 99999,
  ghostLen: 1,
  photoBack: 1318,
  photoBackLen: 8,
} as const;

export const PERIOD = { lampBreath: 60, screenPulse: 60, grassSway: 120, dustDrift: 240 } as const;

/** Frames de los planos (cámara del mundo y planos macro). */
export const SHOT_F = {
  pullStart: 66,
  pullEnd: 90,
  mediumHold: 125,
  pushPhone: 160,
  wideCut: 228,
  wideHold: 285,
  lamp: 330,
  windowCut: 344,
  windowHold: 396,
  phone10: 440,
  collapseCut: 462,
  debrisCut: 520,
  meadowCut: 630,
  craneStart: 690,
  phone200: 790,
  meadow1000Cut: 800,
  fragmentCut: 834,
  xrayFrom: 150,
  xrayFadeIn: 12,
  finalFadeIn: 25,
} as const;
