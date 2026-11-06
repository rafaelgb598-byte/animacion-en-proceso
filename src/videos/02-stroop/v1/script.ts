import type { Word } from "../../01-efecto-senuelo/short-final/words";
import type { Ink } from "../../../canal/escenarios/mesa/theme";
import v1 from "../../../../public/videos/02-stroop/v1/voz/v1.align.json";
import v2 from "../../../../public/videos/02-stroop/v1/voz/v2.align.json";
import v3 from "../../../../public/videos/02-stroop/v1/voz/v3.align.json";
import v4 from "../../../../public/videos/02-stroop/v1/voz/v4.align.json";
import v5 from "../../../../public/videos/02-stroop/v1/voz/v5.align.json";
import lines from "./voice-lines.json";

/**
 * Datos del episodio: textos de voz y secuencia de tarjetas. El próximo episodio de la serie
 * cambia solo estos datos (y los tiempos de timeline.ts).
 */

export type CardSpec = { word: string; ink: Ink; dur: number };

/** palabra → color que nombra (para validar la prueba) */
export const WORD_COLOR: Record<string, Ink> = { ROJO: "red", AZUL: "blue", AMARILLO: "yellow", BLANCO: "white" };

/** Ronda 1: coinciden. 24 fotogramas cada una. */
export const ROUND1: CardSpec[] = [
  { word: "AZUL", ink: "blue", dur: 24 },
  { word: "ROJO", ink: "red", dur: 24 },
  { word: "AMARILLO", ink: "yellow", dur: 24 },
  { word: "BLANCO", ink: "white", dur: 24 },
  { word: "ROJO", ink: "red", dur: 24 },
];

/** Ronda 2: no coinciden, cada vez más rápido. */
export const ROUND2: CardSpec[] = [
  { word: "ROJO", ink: "blue", dur: 36 },
  { word: "AMARILLO", ink: "red", dur: 34 },
  { word: "AZUL", ink: "yellow", dur: 32 },
  { word: "BLANCO", ink: "red", dur: 30 },
  { word: "ROJO", ink: "yellow", dur: 28 },
  { word: "AZUL", ink: "white", dur: 28 },
  { word: "AMARILLO", ink: "blue", dur: 26 },
  { word: "ROJO", ink: "white", dur: 26 },
];

/** Voz: 5 bloques (ElevenLabs, Isaac). Texto en voice-lines.json. */
export const VOICE = lines as { id: "v1" | "v2" | "v3" | "v4" | "v5"; display: string; spoken: string }[];

type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
const ALIGN: Record<string, Alignment> = {
  v1: v1.alignment,
  v2: v2.alignment,
  v3: v3.alignment,
  v4: v4.alignment,
  v5: v5.alignment,
};

/** palabras de un bloque con tiempos en segundos (relativos al inicio del bloque) */
export const blockWords = (id: keyof typeof ALIGN): Word[] => {
  const a = ALIGN[id];
  const out: Word[] = [];
  let t = "";
  let s = 0;
  let e = 0;
  a.characters.forEach((ch, i) => {
    if (ch === " ") {
      if (t) out.push({ t, s, e });
      t = "";
      return;
    }
    if (!t) s = a.character_start_times_seconds[i];
    t += ch;
    e = a.character_end_times_seconds[i];
  });
  if (t) out.push({ t, s, e });
  return out;
};

/** fin del habla de un bloque (segundos) */
export const blockEnd = (id: keyof typeof ALIGN) => ALIGN[id].character_end_times_seconds[ALIGN[id].character_end_times_seconds.length - 1] ?? 0;
