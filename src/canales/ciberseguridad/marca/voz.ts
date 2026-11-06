// Palabras de los subtítulos a partir de los bloques de voz.
// Con alineación real (ElevenLabs) se usan sus tiempos; sin voz, se planifican a ritmo natural (borrador).
import type { Palabra } from "../../../canal/subtitulos/tipos";
import type { BloqueVoz } from "./tipos";

/** ritmo natural de referencia para planificar sin voz (caracteres por segundo) */
export const CPS_PLAN = 15;

export const duracionPlan = (b: BloqueVoz) => b.dicho.length / CPS_PLAN;

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

/** todas las palabras del video, en segundos absolutos */
export const palabrasDelVideo = (bloques: BloqueVoz[], fps: number): Palabra[] =>
  bloques.flatMap((b, i) => {
    const sig = bloques[i + 1];
    // sin voz real se deja una pausa de 0,35 s antes del bloque siguiente (como la voz real entre frases)
    const tope = sig ? (sig.f - b.f) / fps - 0.35 : Infinity;
    const ws = b.palabras ?? palabrasPlanificadas(b.escrito, Math.min(duracionPlan(b), tope));
    return ws.map((w) => ({ t: w.t, s: w.s + b.f / fps, e: w.e + b.f / fps }));
  });
