// Voz real por idioma (lo escribe el script de voz a partir de la alineación de ElevenLabs).
// Vacío = todavía no hay voz: los subtítulos usan tiempos planificados y el render es BORRADOR SIN VOZ.
import type { Palabra } from "../../../../canal/subtitulos/tipos";
import type { Lang } from "../../marca/tipos";

export type TomaVoz = { audio: string; duracion: number; palabras: Palabra[] };
export const VOZ_REAL: Record<Lang, Record<string, TomaVoz>> = { es: {}, en: {} };
