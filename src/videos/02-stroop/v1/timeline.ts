import { blockEnd, blockWords, ROUND1, ROUND2 } from "./script";

/**
 * Cronograma del Short Stroop (fuente de verdad de todos los fotogramas).
 * Base: sección 4 del prompt, ajustada a la voz real (+58 fotogramas, dentro de ±60).
 * Las duraciones de las tarjetas son exactamente las del guion.
 */

export const FPS = 30;
const F = (s: number) => Math.round(s * FPS);

/* ── voz ── */
export const V1_AT = 2;
export const V2_AT = 226;
export const V3_AT = 538;
export const V4_AT = 884;
export const V5_AT = 940;
export const VOICE_AT = { v1: V1_AT, v2: V2_AT, v3: V3_AT, v4: V4_AT, v5: V5_AT } as const;

/** fotograma global de la n-ésima palabra de un bloque que empieza con `prefix` */
const wordFrame = (id: keyof typeof VOICE_AT, prefix: string, nth = 0) => {
  const ws = blockWords(id).filter((w) => w.t.toLowerCase().startsWith(prefix.toLowerCase()));
  const w = ws[nth] ?? ws[0];
  return VOICE_AT[id] + F(w ? w.s : 0);
};

/* ── 1 · cabecera de apertura ── */
export const HEAD1_OUT = 84; // «DECÍ EL COLOR. / NO LA PALABRA.» sale 84–92
export const SETTLE_END = 60; // Tomi termina de acomodarse

/* ── 2 · ronda 1 ── */
export const R1_LABEL = 88; // «RONDA 1» + tic
export const R1_LABEL_END = 103;
export const R1_START = 103;
export const R1_STARTS = ROUND1.reduce<number[]>((acc, c, i) => [...acc, i === 0 ? R1_START : acc[i - 1] + ROUND1[i - 1].dur], []);
export const R1_END = R1_START + ROUND1.reduce((a, c) => a + c.dur, 0); // 223

/* ── 3 · «AHORA EN SERIO.» ── */
export const HEAD2_IN = R1_END;
export const HEAD2_OUT = 276;

/* ── 4 · ronda 2 ── */
export const R2_START = 281;
export const R2_STARTS = ROUND2.reduce<number[]>((acc, c, i) => [...acc, i === 0 ? R2_START : acc[i - 1] + ROUND2[i - 1].dur], []);
export const R2_END = R2_START + ROUND2.reduce((a, c) => a + c.dur, 0); // 521
/** Tomi se equivoca en la 4.ª tarjeta y se tapa la cara en la última */
export const R2_MISTAKE = R2_STARTS[3];
export const R2_FACEPALM = R2_STARTS[7];

/* ── 5 · congelado ── */
export const FREEZE = R2_END; // golpe sordo
export const FREEZE_ZOOM_END = FREEZE + 24; // la cámara se acerca un 6 %
export const FREEZE_END = 553;
export const ZOOM = 1.06;

/* ── 6 · explicación (sigue a la voz) ── */
export const SPLIT = FREEZE_END; // la última tarjeta se separa en dos capas
export const CITE_IN = wordFrame("v3", "casi"); // ficha de cita
export const LABEL_READ = wordFrame("v3", "automático"); // «leer: automático»
export const LABEL_NAME = wordFrame("v3", "nombrar"); // «nombrar el color: esfuerzo»
export const CLASH = wordFrame("v3", "chocan"); // las flechas chocan
export const WINNER = wordFrame("v3", "primero"); // gana la que llega primero
export const V3_END = V3_AT + F(blockEnd("v3"));

/* ── 7 · sello ── */
export const STAMP_IN = 882;
export const HEAD_EFFECT = wordFrame("v4", "efecto");
export const STAMP_HIT = wordFrame("v4", "stroop");
export const ZOOM_BACK = [882, 906] as const; // la cámara vuelve a 1

/* ── 8 · cierre y loop ── */
export const END_IN = 937;
export const COMMENT = [946, 992] as const; // «Comentá: ¿en qué tarjeta te trabaste?»
export const RETURN = [992, 1012] as const; // vuelve todo al estado del fotograma 0
export const DURATION = 1018;
export const LAST = DURATION - 1;

/* ── subtítulos: solo durante la explicación y el sello ── */
export const CAPTIONS_ON = V3_AT;
export const CAPTIONS_OFF = END_IN;
