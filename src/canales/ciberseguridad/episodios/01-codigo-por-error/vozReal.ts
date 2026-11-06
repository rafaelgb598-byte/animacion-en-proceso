// Voz real por idioma: una toma por idioma (plugin de ElevenLabs, Donovan) cortada en bloques con los tiempos de Scribe.
// Lo escribe `node scripts/voz-ciberseguridad.mjs 01-codigo-por-error <es|en>`; no editar a mano.
import type { Palabra } from "../../../../canal/subtitulos/tipos";
import type { Lang } from "../../marca/tipos";
import EN_VOZ from "./voz/en.json";
import ES_VOZ from "./voz/es.json";

export type TomaVoz = { audio: string; duracion: number; palabras: Palabra[] };
export const VOZ_REAL: Record<Lang, Record<string, TomaVoz>> = { es: ES_VOZ, en: EN_VOZ };
