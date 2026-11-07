// 1000 años · Cocina · Props del episodio: gancho, apuesta, etiquetas, ganador, remate, pregunta y origen del zoom.
// Textos en pantalla en español neutro. Las etiquetas con cifra salen de cocina.decay.ts (únicas cuatro).
import type { LabelCue } from "../../../canal/mil-anos/ui/DecayLabels";
import type { CardWinner } from "../../../canal/mil-anos/ui/LastStandingCard";
import type { GuessMarker } from "../../../canal/mil-anos/ui/GuessMarkers";
import type { HookLine } from "../../../canal/mil-anos/ui/HookText";
import { LAYOUT, TYPE } from "../theme";
import { FIGURES } from "./cocina.decay";
import { CUE, LABEL_FRAMES, type LabelKey } from "./cocina.timeline";

const words = (s: string) => s.split(" ");

export const HOOK: readonly HookLine[] = [
  { words: words("Se corta la luz."), from: CUE.hookLines[0] },
  { words: words("Nadie vuelve."), from: CUE.hookLines[1] },
];

export const BET: readonly HookLine[] = [
  { words: words("¿Cuál queda en pie?"), from: CUE.betLines[0] },
  { words: words("1, 2 o 3"), from: CUE.betLines[1] },
];

/** 1 · lata de conserva, 2 · plato de la pileta, 3 · botella PET (escalonados cada 6 frames). */
const MARK = {
  1: { x: LAYOUT.tin.cx, y: LAYOUT.tin.bottom - LAYOUT.tin.h - 56 },
  2: { x: LAYOUT.plate.cx, y: LAYOUT.plate.cy - LAYOUT.plate.ry - 54 },
  3: { x: LAYOUT.pet.cx, y: LAYOUT.pet.bottom - LAYOUT.pet.h - 54 },
} as const;

export const MARKERS: readonly GuessMarker[] = ([1, 2, 3] as const).map((n, i) => ({
  n,
  ...MARK[n],
  from: CUE.markersFrom + i * CUE.markerStagger,
  to: CUE.betEnd,
}));

/** El «2» reaparece un instante sobre el plato: le cierra la apuesta a quien acertó. */
export const MARKER_ECHO: readonly GuessMarker[] = [{ n: 2, ...MARK[2], from: CUE.markerEcho[0], to: CUE.markerEcho[1] }];

const LABEL_TEXT: Record<LabelKey, string> = {
  luz: "luz · cortada (nadie paga)",
  leche: "leche · se hincha",
  tupper: "tupper · moho",
  banana: FIGURES.banana.label,
  carton: FIGURES.carton.label,
  ventana: "ventana · rota",
  recetaMancha: "receta · se mancha",
  alacena: "alacena · se vino abajo",
  platos: "8 platos · rotos",
  platoEntero: "plato en la pileta · entero",
  lata: FIGURES.lata.label,
  techo: "techo · cayó",
  recetaFin: "receta · desapareció",
  pet: FIGURES.pet.label,
  heladera: "heladera · óxido y tierra",
};

export const LABELS: readonly LabelCue[] = (Object.keys(LABEL_FRAMES) as LabelKey[]).map((key) => ({ key, frame: LABEL_FRAMES[key], text: LABEL_TEXT[key] }));

export const LABEL_STYLE = {
  x: LAYOUT.labels.x,
  y: LAYOUT.labels.y,
  step: LAYOUT.labels.step,
  size: TYPE.label,
  inLen: CUE.labelIn,
  hold: CUE.labelHold,
  outLen: CUE.labelOut,
  max: CUE.labelMax,
} as const;

/** Carta sin cifra: la cerámica no tiene fecha de descomposición publicada (ver `nota` en cocina.decay.ts). */
export const WINNER: CardWinner = {
  kicker: "ÚLTIMO EN PIE",
  name: "el plato que no lavaste",
  figure: ["cerámica ·", "sin fecha de vencimiento conocida"],
  foot: "simulación · estimaciones",
  nameSize: TYPE.cardWinner,
};

export const REMATE: readonly HookLine[] = [{ words: words("El plato, sí. La receta, no."), from: CUE.remate[0] }];

export const QUESTION: readonly HookLine[] = [
  { words: words("¿Qué comida de tu heladera"), from: CUE.question[0] },
  { words: words("aguanta más? Comentalo."), from: CUE.question[0] + 12 },
];

/** Receta de la abuela (escrita a mano; Caveat). El fantasma final usa las dos primeras líneas. */
export const RECIPE = {
  title: ["Milanesas", "de la abuela"],
  lines: ["1 kg de nalga finita", "2 huevos, ajo, perejil", "pan rallado (mucho)", "aplastar con la mano", "freír hasta que doren"],
  ghost: ["Milanesas de la abuela", "pan rallado, huevo, perejil…"],
} as const;

/** Origen del acercamiento final: el plato semienterrado. */
export const ZOOM_ORIGIN = { x: LAYOUT.plate.cx, y: LAYOUT.plate.cy } as const;
