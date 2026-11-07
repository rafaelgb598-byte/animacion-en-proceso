// 1000 años · Cocina · v2 · Tiempo: tramos, hitos, eventos y voz. Único lugar con números de frame.
// 41,7 s · 30 fps · 1.250 frames (el usuario autorizó estirar hasta 42 s para que la voz entre sin acelerarla).
import { DAY, makeClock, MONTH, type Segment, WEEK } from "../../../../canal/mil-anos/clock";

export const FPS = 30;
export const DURATION = 1250;
/** Desde acá, corte seco al estado del frame 0 (el frame 1249 es igual al 0). */
export const LOOP_CUT = 1220;

/**
 * Gancho f0–76 y apuesta f76–135 (AÑO 0) · Comida f135–272 (DÍA 1 → SEMANA 1 → MES 3) · Ventana f272–420 (AÑO 1)
 * · Alacena f420–610 (AÑO 10) · Techo f610–810 (AÑO 50) · Tierra f810–896 (AÑO 200 → 1.000)
 * · Revelación f930–985 · Carta f990–1065 · Remate f1065–1150 · Pregunta f1155–1215 · Loop.
 */
const SEGMENTS: readonly Segment[] = [
  { from: 0, to: 135, y0: 0, y1: 0, kind: "hold" },
  { from: 135, to: 150, y0: DAY, y1: 3 * DAY, kind: "slow" },
  { from: 150, to: 162, y0: 3 * DAY, y1: WEEK, kind: "jump" },
  { from: 162, to: 200, y0: WEEK, y1: 1.5 * WEEK, kind: "read" },
  { from: 200, to: 212, y0: 1.5 * WEEK, y1: 6 * WEEK, kind: "jump" },
  { from: 212, to: 238, y0: 6 * WEEK, y1: 6.4 * WEEK, kind: "read" },
  { from: 238, to: 250, y0: 6.4 * WEEK, y1: 3 * MONTH, kind: "jump" },
  { from: 250, to: 272, y0: 3 * MONTH, y1: 3.3 * MONTH, kind: "read" },
  { from: 272, to: 286, y0: 3.3 * MONTH, y1: 1, kind: "jump" },
  { from: 286, to: 420, y0: 1, y1: 1.6, kind: "read" },
  { from: 420, to: 434, y0: 1.6, y1: 10, kind: "jump" },
  { from: 434, to: 610, y0: 10, y1: 13, kind: "read" },
  { from: 610, to: 624, y0: 13, y1: 50, kind: "jump" },
  { from: 624, to: 810, y0: 50, y1: 62, kind: "read" },
  { from: 810, to: 824, y0: 62, y1: 200, kind: "jump" },
  { from: 824, to: 868, y0: 200, y1: 450, kind: "slow" },
  { from: 868, to: 880, y0: 450, y1: 460, kind: "read" },
  { from: 880, to: 896, y0: 460, y1: 1000, kind: "jump" },
  { from: 896, to: LOOP_CUT, y0: 1000, y1: 1000, kind: "hold" },
  { from: LOOP_CUT, to: DURATION, y0: 0, y1: 0, kind: "hold" },
];

export const CLOCK = makeClock({
  segments: SEGMENTS,
  loopCut: LOOP_CUT,
  milestones: [
    { year: 0, label: "AÑO 0" },
    { year: DAY, label: "DÍA 1" },
    { year: 3 * DAY, label: "DÍA 3" },
    { year: WEEK, label: "SEMANA 1" },
    { year: 6 * WEEK, label: "SEMANA 6" },
    { year: 3 * MONTH, label: "MES 3" },
    { year: 1, label: "AÑO 1" },
    { year: 10, label: "AÑO 10" },
    { year: 50, label: "AÑO 50" },
    { year: 200, label: "AÑO 200" },
    { year: 450, label: "AÑO 450" },
    { year: 1000, label: "AÑO 1.000" },
  ],
  units: [
    { upTo: WEEK, prefix: "DÍA ", perYear: 365 },
    { upTo: 2 * MONTH, prefix: "SEMANA ", perYear: 52.18 },
    { upTo: 1, prefix: "MES ", perYear: 12 },
    { upTo: Infinity, prefix: "AÑO ", perYear: 1 },
  ],
});

export const yearAt = CLOCK.yearAt;

/**
 * Narración (Isaac): ventana [desde, hasta) de cada frase. La toma se ubica en `desde`; si no entra en su ventana,
 * se avisa (nunca se acelera). Los textos están en cocina.ts.
 */
export const VOICE_WINDOWS = {
  v01: [2, 72],
  v02: [76, 130],
  v03: [140, 265],
  v04: [285, 425],
  v05: [470, 600],
  v06: [620, 800],
  v07: [830, 902],
  v08: [905, 985],
  v09: [990, 1062],
  v10: [1068, 1160],
  v11: [1160, 1218],
} as const;
export type VoiceId = keyof typeof VOICE_WINDOWS;

/** Frames fijos del storyboard (prompt v2). */
export const CUE = {
  // gancho (texto sincronizado con la frase 1)
  hookEnd: 76,
  hookOut: 8,
  wordStep: 4,
  wordIn: 6,
  fridgeDips: [
    [7, 10],
    [18, 21],
    [29, 31],
  ] as const,
  fridgeOff: 40,
  pushIn: [8, 50] as const,
  // apuesta (2.4): texto + marcadores de 84 px con pulso, hasta f135
  betLines: [78, 92] as const,
  betEnd: 135,
  betOut: 8,
  markersFrom: 80,
  markerStagger: 6,
  markerIn: 10,
  markerOut: 8,
  // acercamiento a la heladera (2.2)
  fridgeZoomIn: [125, 150] as const,
  fridgeZoomOut: [255, 280] as const,
  // etiquetas con cifra (2.6)
  labelIn: 8,
  labelHold: 52,
  labelOut: 8,
  labelMax: 2,
  // eventos de la escena
  /** Con «se rompe» de la frase 4 (Scribe: 0,95 s después de f285). */
  windowBreak: 312,
  windowBreakLen: 8,
  rainEnd: 610,
  recipeFall: 436,
  recipeFallLen: 26,
  cupboardFall: 448,
  cupboardFallLen: 12,
  roofFall: 722,
  roofFallLen: 18,
  /** El haz de luna se apaga con el techo y no vuelve (2.3). */
  beamOff: [722, 752] as const,
  fridgeDoorFall: 770,
  fridgeDoorFallLen: 14,
  cabinetDoorFall: 790,
  cabinetDoorFallLen: 10,
  // revelación y carta (2.7–2.8)
  reveal: [930, 985] as const,
  glint: 970,
  glintLen: 24,
  card: 990,
  cardLen: 75,
  cardIn: 10,
  cardOut: 8,
  markerEcho: [1000, 1015] as const,
  // remate y pregunta (2.9)
  remateEnd: 1160,
  remateOut: 8,
  ghostLen: 30,
  questionEnd: LOOP_CUT - 4,
  questionOut: 6,
  // sonido (sección 4)
  clockTicks: [44, 74, 104] as const,
  flies: [140, 265] as const,
  drips: [340, 385] as const,
  /** Con «receta» de la frase 4. */
  paperCrinkle: 351,
  /** El plato gira durante «Todos…» y se detiene en «menos uno». */
  plateSpin: [536, 572] as const,
  dripLate: 560,
  windFrom: 810,
  insectsFrom: 830,
  duck: { attack: 4, release: 10, level: 0.4 },
} as const;

/** Etiquetas con cifra (las únicas que quedan en la v2). */
export const LABEL_FRAMES = {
  banana: 214,
  carton: 252,
  lata: 640,
  pet: 840,
} as const;
export type LabelKey = keyof typeof LABEL_FRAMES;

/** Ventana de un evento en años (las curvas de deterioro dependen solo de `year`). */
export const eventYears = (from: number, len: number) => ({ y0: yearAt(from), y1: yearAt(from + len) });
