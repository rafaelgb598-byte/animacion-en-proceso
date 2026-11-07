// 1000 años · Cocina · Tiempo: tramos, hitos y eventos (sección 5 del prompt). Único lugar con números de frame.
// 40 s · 30 fps · 1.200 frames. El tiempo frena en cada hito para leer y acelera entre hitos.
import { DAY, makeClock, MONTH, type Segment, WEEK } from "../../../canal/mil-anos/clock";

export const FPS = 30;
export const DURATION = 1200;
/** Desde acá, corte seco al estado del frame 0 (el frame 1199 es igual al 0). */
export const LOOP_CUT = 1170;

/**
 * Tramos del prompt → tramos del reloj:
 * Gancho f0–60 y Apuesta f60–120 (AÑO 0) · Comida f120–270 (DÍA 1 → SEMANA 1 → MES 3) · Ventana f270–420 (AÑO 1)
 * · Alacena f420–600 (AÑO 10) · Techo f600–810 (AÑO 50) · Tierra f810–990 (AÑO 200 → 1.000) · Carta, remate y loop.
 */
const SEGMENTS: readonly Segment[] = [
  { from: 0, to: 120, y0: 0, y1: 0, kind: "hold" },
  { from: 120, to: 140, y0: DAY, y1: 3 * DAY, kind: "slow" },
  { from: 140, to: 152, y0: 3 * DAY, y1: WEEK, kind: "jump" },
  { from: 152, to: 196, y0: WEEK, y1: 1.5 * WEEK, kind: "read" },
  { from: 196, to: 208, y0: 1.5 * WEEK, y1: 6 * WEEK, kind: "jump" },
  { from: 208, to: 236, y0: 6 * WEEK, y1: 6.4 * WEEK, kind: "read" },
  { from: 236, to: 248, y0: 6.4 * WEEK, y1: 3 * MONTH, kind: "jump" },
  { from: 248, to: 270, y0: 3 * MONTH, y1: 3.3 * MONTH, kind: "read" },
  { from: 270, to: 284, y0: 3.3 * MONTH, y1: 1, kind: "jump" },
  { from: 284, to: 420, y0: 1, y1: 1.6, kind: "read" },
  { from: 420, to: 434, y0: 1.6, y1: 10, kind: "jump" },
  { from: 434, to: 600, y0: 10, y1: 13, kind: "read" },
  { from: 600, to: 614, y0: 13, y1: 50, kind: "jump" },
  { from: 614, to: 810, y0: 50, y1: 62, kind: "read" },
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

/** Frames fijos del storyboard (sección 6). */
export const CUE = {
  // 6.1 gancho
  hookLines: [0, 42] as const,
  hookEnd: 60,
  hookOut: 8,
  wordStep: 4,
  wordIn: 6,
  /** Parpadeos irregulares de la heladera (tramos apagados) y apagón definitivo. */
  fridgeDips: [
    [7, 10],
    [18, 21],
    [29, 31],
  ] as const,
  fridgeOff: 40,
  pushIn: [8, 50] as const,
  // 6.2 apuesta
  betLines: [62, 80] as const,
  betEnd: 120,
  betOut: 8,
  markersFrom: 64,
  markerStagger: 6,
  markerIn: 8,
  markerOut: 8,
  // 6.3 etiquetas
  labelIn: 8,
  labelHold: 45,
  labelOut: 8,
  labelMax: 3,
  // eventos de la escena
  windowBreak: 290,
  windowBreakLen: 8,
  rainEnd: 600,
  cupboardFall: 450,
  cupboardFallLen: 12,
  recipeFall: 466,
  recipeFallLen: 26,
  roofFall: 670,
  roofFallLen: 18,
  fridgeDoorFall: 740,
  fridgeDoorFallLen: 14,
  /** Una puerta del bajo mesada (podrida) se cae al piso: mantiene vivo el final del tramo del AÑO 50. */
  cabinetDoorFall: 782,
  cabinetDoorFallLen: 10,
  // 6.4 revelación y carta
  reveal: [960, 1000] as const,
  glint: 970,
  glintLen: 24,
  card: 990,
  cardLen: 98,
  cardIn: 10,
  cardOut: 8,
  markerEcho: [1000, 1012] as const,
  // 6.5 remate y pregunta
  remate: [1082, 1125] as const,
  remateOut: 8,
  ghost: [1088, 1112] as const,
  question: [1125, LOOP_CUT] as const,
  questionOut: 6,
  // sonido (sección 8)
  clockTicks: [44, 74, 104] as const,
  flies: [150, 260] as const,
  windFrom: 810,
  insectsFrom: 830,
} as const;

/** Etiquetas: frame de entrada (sección 6.3). El texto vive en cocina.ts; las cifras, en cocina.decay.ts. */
export const LABEL_FRAMES = {
  luz: 122,
  leche: 150,
  tupper: 180,
  banana: 210,
  carton: 250,
  ventana: 290,
  recetaMancha: 320,
  alacena: 450,
  platos: 480,
  platoEntero: 510,
  lata: 640,
  techo: 670,
  recetaFin: 700,
  pet: 840,
  heladera: 880,
} as const;
export type LabelKey = keyof typeof LABEL_FRAMES;

/** Ventana de un evento en años (las curvas de deterioro dependen solo de `year`). */
export const eventYears = (from: number, len: number) => ({ y0: yearAt(from), y1: yearAt(from + len) });
