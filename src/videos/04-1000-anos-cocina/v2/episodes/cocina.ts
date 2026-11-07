// 1000 años · Cocina · v2 · Textos del episodio (español neutro, sin voseo) y narración de Isaac.
// Las etiquetas con cifra salen de cocina.decay.ts (únicas cuatro); los frames, de cocina.timeline.ts.
import type { LabelCue } from "../../../../canal/mil-anos/ui/DecayLabels";
import type { CardWinner } from "../../../../canal/mil-anos/ui/LastStandingCard";
import type { GuessMarker } from "../../../../canal/mil-anos/ui/GuessMarkers";
import { LAYOUT, TYPE, UI_LAYOUT } from "../theme";
import { FIGURES } from "./cocina.decay";
import { CUE, LABEL_FRAMES, type LabelKey, type VoiceId } from "./cocina.timeline";

/** Guion de la voz (aprobado por el usuario). Las frases 1, 5 («Todos… menos uno.»), 9 y 10 son textuales. */
export const VOICE_TEXT: Record<VoiceId, string> = {
  v01: "Se corta la luz. Nadie vuelve.",
  v02: "¿Qué queda en pie?",
  v03: "A la semana, tu refrigerador ya tiene nuevos dueños.",
  v04: "Al año, se rompe la ventana. La receta empieza a borrarse.",
  v05: "A los diez, caen los platos. Todos… menos uno.",
  v06: "A los cincuenta, la lata está perforada. Y el techo… ya no está.",
  v07: "El plástico no se va: se rompe.",
  v08: "Mil años después, lo que queda…",
  v09: "…es el plato que no lavaste.",
  v10: "El plato, sí. La receta… no.",
  v11: "¿Qué comida tuya aguanta más?",
};

/**
 * Cómo se muestra cada frase. «grande» = texto grande sincronizado (gancho, remate, pregunta); «carta» = la dice la carta;
 * «apuesta» = la muestra el texto de la apuesta. Regla de la serie: nunca subtítulo + texto en pantalla diciendo lo mismo.
 */
export const VOICE_DISPLAY: Record<VoiceId, "grande" | "subtitulo" | "carta" | "apuesta"> = {
  v01: "grande",
  v02: "apuesta",
  v03: "subtitulo",
  v04: "subtitulo",
  v05: "subtitulo",
  v06: "subtitulo",
  v07: "subtitulo",
  v08: "subtitulo",
  v09: "carta",
  v10: "grande",
  v11: "grande",
};

/** Texto de la apuesta (2.4): pregunta en Barlow 72 px y números en Plex Mono 56 px. */
export const BET_QUESTION = "¿Cuál queda en pie?";
export const BET_NUMBERS = "1 · 2 · 3";

/** Pregunta final en pantalla (2.9): la voz dice la primera línea. */
export const QUESTION_LINES = ["¿Qué comida tuya aguanta más?", "Coméntalo."] as const;

/** Marcadores 1 · lata de conserva, 2 · plato de la pileta, 3 · botella PET (coordenadas de mundo; se pasan a pantalla). */
const MARK = {
  1: { x: LAYOUT.tin.cx, y: LAYOUT.tin.bottom - LAYOUT.tin.h - 46 },
  2: { x: LAYOUT.plate.cx, y: LAYOUT.plate.cy - LAYOUT.plate.ry - 44 },
  3: { x: LAYOUT.pet.cx, y: LAYOUT.pet.bottom - LAYOUT.pet.h - 46 },
} as const;

export const MARKERS: readonly GuessMarker[] = ([1, 2, 3] as const).map((n, i) => ({
  n,
  ...MARK[n],
  from: CUE.markersFrom + i * CUE.markerStagger,
  to: CUE.betEnd,
}));

/** El «2» reaparece sobre el plato (15 frames): le cierra la apuesta a quien acertó. */
export const MARKER_ECHO: readonly GuessMarker[] = [{ n: 2, ...MARK[2], from: CUE.markerEcho[0], to: CUE.markerEcho[1] }];

/** Solo las 4 etiquetas con cifra (2.6): con narración, las de proceso repetían lo que dice la voz. */
const LABEL_TEXT: Record<LabelKey, string> = {
  banana: FIGURES.banana.label,
  carton: FIGURES.carton.label,
  lata: FIGURES.lata.label,
  pet: FIGURES.pet.label,
};

export const LABELS: readonly LabelCue[] = (Object.keys(LABEL_FRAMES) as LabelKey[]).map((key) => ({ key, frame: LABEL_FRAMES[key], text: LABEL_TEXT[key] }));

export const LABEL_STYLE = {
  x: UI_LAYOUT.labels.x,
  y: UI_LAYOUT.labels.y,
  step: UI_LAYOUT.labels.step,
  size: TYPE.label,
  inLen: CUE.labelIn,
  hold: CUE.labelHold,
  outLen: CUE.labelOut,
  max: CUE.labelMax,
} as const;

/** Carta sin cifra, en dos renglones limpios (2.8). */
export const WINNER: CardWinner = {
  kicker: "ÚLTIMO EN PIE",
  name: "el plato que no lavaste",
  figure: ["cerámica", "sin fecha de vencimiento conocida"],
  foot: "simulación · estimaciones",
  nameSize: TYPE.cardWinner,
};

/** Receta de la abuela (escrita a mano; Caveat), en español neutro. El fantasma final usa dos renglones. */
export const RECIPE = {
  title: ["Milanesas", "de la abuela"],
  lines: ["1 kg de bistec", "2 huevos y perejil", "pan molido (mucho)", "aplanar con la mano", "freír hasta dorar"],
  ghost: ["Milanesas de la abuela", "pan molido, huevo, perejil…"],
} as const;
