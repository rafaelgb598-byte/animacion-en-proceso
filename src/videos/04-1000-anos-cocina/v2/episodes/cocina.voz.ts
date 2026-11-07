// 1000 años · Cocina · v2 · Narración de Isaac: tiempos por palabra, frames y ducking.
// `cocina.voz.json` lo escribe scripts/gen-voz-cocina-v2.mjs con los tiempos reales de ElevenLabs.
// Mientras una frase tenga `estimado: true` (sin audio), sus tiempos son una estimación a ~15 caracteres por segundo.
import type { Palabra } from "../../../../canal/subtitulos/tipos";
import { interpolate } from "remotion";
import { CLAMP } from "../../../../canal/mil-anos/anim";
import VOZ from "./cocina.voz.json";
import { CUE, FPS, VOICE_WINDOWS, type VoiceId } from "./cocina.timeline";
import { VOICE_DISPLAY } from "./cocina";

export type VoiceWord = { t: string; s: number; e: number };
export type VoiceEntry = { estimado: boolean; archivo: string | null; toma: string | null; duracion: number; palabras: VoiceWord[] };

export const VOICE = VOZ as Record<VoiceId, VoiceEntry>;
export const VOICE_IDS = Object.keys(VOICE_WINDOWS) as VoiceId[];

export const voiceStart = (id: VoiceId) => VOICE_WINDOWS[id][0];
export const voiceEnd = (id: VoiceId) => voiceStart(id) + Math.ceil(VOICE[id].duracion * FPS);
/** Frame en que empieza a sonar cada palabra de la frase. */
export const wordFrames = (id: VoiceId) => VOICE[id].palabras.map((w) => voiceStart(id) + Math.round(w.s * FPS));
/** Índice de la primera palabra que empieza con `texto` (sin signos), para colgar eventos de la voz. */
export const wordFrame = (id: VoiceId, texto: string) => {
  const norm = (t: string) => t.toLowerCase().replace(/[^a-záéíóúñü]/g, "");
  const k = VOICE[id].palabras.findIndex((w) => norm(w.t) === norm(texto));
  return k < 0 ? voiceStart(id) : wordFrames(id)[k];
};

/** Palabras de las frases que van como subtítulo (segundos absolutos del video). */
export const subtitleWords = (): Palabra[] =>
  VOICE_IDS.filter((id) => VOICE_DISPLAY[id] === "subtitulo").flatMap((id) =>
    VOICE[id].palabras.map((w) => ({ t: w.t, s: voiceStart(id) / FPS + w.s, e: voiceStart(id) / FPS + w.e })),
  );

/** El subtítulo de una frase solo se ve mientras suena (y 8 frames después): no queda colgado sobre la carta. */
export const subtitleVisible = (frame: number) =>
  VOICE_IDS.some((id) => VOICE_DISPLAY[id] === "subtitulo" && frame >= voiceStart(id) && frame < voiceEnd(id) + 8);

/** Ducking: con voz activa, el resto baja 8 dB (× 0,4), con ataque y relajación cortos. */
export const duckAt = (frame: number) => {
  let g = 1;
  for (const id of VOICE_IDS) {
    const a = voiceStart(id);
    const b = voiceEnd(id);
    const t = interpolate(frame, [a - CUE.duck.attack, a, b, b + CUE.duck.release], [0, 1, 1, 0], CLAMP);
    g = Math.min(g, 1 - (1 - CUE.duck.level) * t);
  }
  return g;
};
