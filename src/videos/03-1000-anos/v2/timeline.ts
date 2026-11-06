// Tiempo: frames → años (sección 5). Único lugar con números de frame.
import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION = 1200;
export const LOOP_CUT = 1155;

export const DAY = 1 / 365;
export const WEEK = 7 / 365;

type Segment = { from: number; to: number; y0: number; y1: number; kind: "hold" | "jump" | "read" };

/** Tabla de la sección 5. En los saltos se interpola log10(año); en las lecturas, deriva lineal mínima. */
export const SEGMENTS: readonly Segment[] = [
  { from: 0, to: 80, y0: 0, y1: 0, kind: "hold" },
  { from: 80, to: 100, y0: DAY, y1: WEEK, kind: "jump" },
  { from: 100, to: 200, y0: WEEK, y1: WEEK * 1.08, kind: "read" },
  { from: 200, to: 230, y0: WEEK * 1.08, y1: 1, kind: "jump" },
  { from: 230, to: 350, y0: 1, y1: 1.3, kind: "read" },
  { from: 350, to: 380, y0: 1.3, y1: 10, kind: "jump" },
  { from: 380, to: 530, y0: 10, y1: 12, kind: "read" },
  { from: 530, to: 560, y0: 12, y1: 50, kind: "jump" },
  { from: 560, to: 710, y0: 50, y1: 55, kind: "read" },
  { from: 710, to: 740, y0: 55, y1: 200, kind: "jump" },
  { from: 740, to: 890, y0: 200, y1: 210, kind: "read" },
  { from: 890, to: 920, y0: 210, y1: 1000, kind: "jump" },
  { from: 920, to: LOOP_CUT, y0: 1000, y1: 1000, kind: "hold" },
  { from: LOOP_CUT, to: DURATION, y0: 0, y1: 0, kind: "hold" },
];

const JUMP_EASE = Easing.bezier(0.65, 0, 0.35, 1);

const segmentAt = (frame: number): Segment => {
  for (const s of SEGMENTS) if (frame >= s.from && frame < s.to) return s;
  return SEGMENTS[SEGMENTS.length - 1];
};

/** Año continuo para cualquier frame (función pura). */
export const yearAt = (frame: number): number => {
  const s = segmentAt(frame);
  if (s.kind === "hold") return s.y0;
  const t = interpolate(frame, [s.from, s.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (s.kind === "read") return s.y0 + (s.y1 - s.y0) * t;
  const l = Math.log10(s.y0) + (Math.log10(s.y1) - Math.log10(s.y0)) * JUMP_EASE(t);
  return Math.pow(10, l);
};

/** Progreso 0..1 dentro de un salto, o null si no hay salto. */
export const jumpAt = (frame: number): { t: number; index: number; from: number; to: number } | null => {
  const jumps = SEGMENTS.filter((s) => s.kind === "jump");
  for (let i = 0; i < jumps.length; i++) {
    const s = jumps[i];
    if (frame >= s.from && frame < s.to) return { t: (frame - s.from) / (s.to - s.from), index: i, from: s.from, to: s.to };
  }
  return null;
};

export const JUMP_STARTS: readonly number[] = SEGMENTS.filter((s) => s.kind === "jump").map((s) => s.from);
export const JUMP_ENDS: readonly number[] = SEGMENTS.filter((s) => s.kind === "jump").map((s) => s.to);

/** Primer frame en el que el año alcanza `year` (eventos derivados, no a mano). */
export const frameAtYear = (year: number): number => {
  for (let f = 0; f < LOOP_CUT; f++) if (yearAt(f) >= year) return f;
  return LOOP_CUT;
};

/** Hitos del contador. */
export const MILESTONES = [
  { year: 0, label: "AÑO 0", words: "" },
  { year: WEEK, label: "1 SEMANA", words: "una semana después" },
  { year: 1, label: "AÑO 1", words: "un año después" },
  { year: 10, label: "AÑO 10", words: "diez años después" },
  { year: 50, label: "AÑO 50", words: "medio siglo después" },
  { year: 200, label: "AÑO 200", words: "dos siglos después" },
  { year: 1000, label: "AÑO 1.000", words: "mil años después" },
] as const;

/** Años en los que ocurren eventos con caída o rotura (sección 6.2). */
export const EVENT_YEARS = {
  glassBreak: 8,
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

/** Frames fijos del storyboard (secciones 4.4, 6 y 9). */
export const CUE = {
  ticks: [0, 30, 60],
  buzz: 45,
  buzzLen: 8,
  hookStart: 12,
  hookWordStep: 6,
  hookWordIn: 8,
  hookEnd: 80,
  hookOut: 8,
  lampDips: [88, 90],
  lampOff: 90,
  lampFade: 6,
  screenOff: 90,
  screenFade: 8,
  powerOff: 88,
  chargerHumEnd: 90,
  roomStart: 90,
  roomEnd: 380,
  windStart: 380,
  insectsStart: 740,
  insectsEnd: 920,
  readStartLabels: 100,
  glint: 990,
  glintLen: 24,
  zoomStart: 1000,
  zoomEnd: 1060,
  card: 1060,
  cardIn: 10,
  photoNo: 1100,
  ghostLen: 20,
  loopCut: LOOP_CUT,
  labelIn: 8,
  labelHold: 45,
  labelOut: 8,
  labelMax: 3,
} as const;

/** Etiquetas de desaparición (sección 6.3): frame de inicio → clave del episodio. */
export const LABEL_CUES = [
  { frame: 100, key: "power" },
  { frame: 115, key: "screen" },
  { frame: 235, key: "paper" },
  { frame: 250, key: "fabricStain" },
  { frame: 385, key: "window" },
  { frame: 400, key: "battery" },
  { frame: 415, key: "bookSwell" },
  { frame: 565, key: "particleboard" },
  { frame: 580, key: "bookGone" },
  { frame: 595, key: "fabricGone" },
  { frame: 745, key: "woodGone" },
  { frame: 760, key: "copper" },
  { frame: 775, key: "petDeformed" },
  { frame: 925, key: "aluminum" },
  { frame: 940, key: "pet" },
] as const;

export type LabelKey = (typeof LABEL_CUES)[number]["key"];

/** Cámara (sección 8). */
export const CAMERA_KEYS = {
  scale: { frames: [0, 80, 920, 1000, 1060], values: [1.0, 1.02, 0.98, 0.98, 1.14] },
  rotX: { frames: [0, 80, 920, 1000, 1060], values: [6, 6, 3, 3, 8] },
  zoom: { frames: [1000, 1060] },
  driftPeriodX: 150,
  driftPeriodY: 240,
  driftX: 3,
  driftY: 2,
} as const;

/** Voz (Isaac): frame de entrada de cada segmento. Ver produccion/03-1000-anos/v2/guion.json. */
export const VOICE_CUES = {
  hook: 12,
  week: 100,
  year1: 230,
  year10: 380,
  year50: 560,
  year200: 740,
  year1000: 922,
  winner: 1004,
  photo: 1100,
} as const;
export type VoiceId = keyof typeof VOICE_CUES;

/** Ducking de efectos bajo la voz y fundido de subtítulos (frames). */
export const DUCK = { level: 0.4, attack: 4, release: 10 } as const;
export const SUB_FADE = 4;

/** Respiración / pulsos (períodos que dividen 1.200 para el loop). */
export const PERIOD = { lampBreath: 60, screenPulse: 60, grassSway: 120, dustDrift: 240 } as const;
