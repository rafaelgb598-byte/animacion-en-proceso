// Voz del canal Despiece y palabras de los subtítulos.
// Con la voz real (ElevenLabs) se usan sus tiempos por palabra; sin voz se planifican a ritmo natural (borrador).
import type { Palabra } from "../../../canal/subtitulos/tipos";

/** «Matías – Argentine Customer Service» (biblioteca de ElevenLabs). Variable: ELEVENLABS_VOICE_ID_DESPIECE. */
export const VOZ_DESPIECE = {
  nombre: "Matías – Argentine Customer Service",
  voiceId: "wW8LJCzyKXPO6ftZkssL",
  env: "ELEVENLABS_VOICE_ID_DESPIECE",
  modelo: "eleven_multilingual_v2",
  velocidad: 1.0,
} as const;

/** Un bloque de voz: `dicho` = lo que se manda a la voz; `escrito` = lo que se lee en los subtítulos. */
export type BloqueVoz = {
  id: string;
  dicho: string;
  escrito: string;
  /** palabras con tiempos (s) desde el inicio del bloque; null = sin voz real todavía */
  palabras: Palabra[] | null;
  /** duración real del audio (s); null = planificada */
  duracion: number | null;
  /** archivo de audio (relativo a public/); null = sin voz */
  audio: string | null;
};

/**
 * Ritmo de planificación sin voz (caracteres/s). Medida real de Matías: ≈ 13,8 c/s a velocidad 1,0
 * (guiones/APRENDIZAJES.md). Se planifica con 15 (un poco más rápido, a propósito) y se corrige con la voz real.
 */
export const CPS_PLAN = 15;

export const duracionBloque = (b: BloqueVoz) => b.duracion ?? b.dicho.length / CPS_PLAN;

/** palabras de un bloque repartidas por largo (sin voz), en segundos desde el inicio del bloque */
export const palabrasPlanificadas = (escrito: string, dur: number): Palabra[] => {
  const ws = escrito.split(/\s+/).filter(Boolean);
  const total = ws.reduce((a, w) => a + w.length + 1, 0);
  let t = 0;
  return ws.map((w) => {
    const d = ((w.length + 1) / total) * dur;
    const p = { t: w, s: t, e: t + d * 0.92 };
    t += d;
    return p;
  });
};

export const palabrasDeBloque = (b: BloqueVoz): Palabra[] => b.palabras ?? palabrasPlanificadas(b.escrito, duracionBloque(b));

/** todas las palabras del video, en segundos absolutos (cada bloque empieza en `inicio[id]`, en frames) */
export const palabrasDelVideo = (bloques: BloqueVoz[], inicio: Record<string, number>, fps: number): Palabra[] =>
  bloques.flatMap((b) => palabrasDeBloque(b).map((w) => ({ t: w.t, s: w.s + inicio[b.id] / fps, e: w.e + inicio[b.id] / fps })));
