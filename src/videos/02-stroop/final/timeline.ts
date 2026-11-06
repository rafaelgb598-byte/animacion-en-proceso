import { blockEnd, blockWords, type VoiceId } from "./voice";
import { LEVELS } from "./script";

/**
 * GiroDato · Stroop V2 — cronograma (todos los fotogramas con nombre).
 * La apertura enseña la regla con un ejemplo (jugable desde el fotograma 0), cuenta regresiva
 * y recién ahí arranca el desafío, con tiempo real para responder en voz alta.
 */

export const FPS = 30;
const F = (s: number) => Math.round(s * FPS);

/* ── voz ── */
export const VOICE_AT: Record<VoiceId, number> = { v1: 2, v2: 248, v3: 622, v4: 1012, v5: 1063 };
export type { VoiceId };
export const voiceEnd = (id: VoiceId) => VOICE_AT[id] + F(blockEnd(id));
const wordFrame = (id: VoiceId, prefix: string) => {
  const w = blockWords(id).find((x) => x.t.toLowerCase().replace(/[¿¡]/g, "").startsWith(prefix.toLowerCase()));
  return VOICE_AT[id] + F(w ? w.s : 0);
};

/* ── apertura: ejemplo + cuenta regresiva ── */
/** «DECÍ: AZUL ✔ · ROJO ✘» aparece cuando la voz dice «No leas la palabra» */
export const EX_HINT = wordFrame("v1", "no") - 2;
export const EX_OUT = voiceEnd("v1") + 4; // el ejemplo sale
export const COUNT = [EX_OUT + 4, EX_OUT + 16, EX_OUT + 28] as const; // 3 · 2 · 1
export const COUNT_STEP = 12;

/* ── desafío ── */
export const L_START = { 1: COUNT[2] + COUNT_STEP, 2: 300, 3: 426 } as const;
/** inicio de cada tarjeta, por nivel */
export const STARTS = LEVELS.map((lv) => lv.cards.reduce<number[]>((acc, c, i) => [...acc, i === 0 ? L_START[lv.id] : acc[i - 1] + lv.cards[i - 1].dur], []));
export const L_END = LEVELS.map((lv, i) => STARTS[i][STARTS[i].length - 1] + lv.cards[lv.cards.length - 1].dur);
/** título compacto: se achica cuando aparece la primera palabra */
export const TITLE_COMPACT = [EX_OUT, EX_OUT + 8] as const;
/** primer plano de Tomi: «Fácil. Ahora en serio.» */
export const CLOSE1 = [L_END[0], L_START[2]] as const;
/** Tomi se equivoca en la 3.ª tarjeta del nivel 3 y se tapa la cara en la última */
export const MISTAKE = STARTS[2][2];
export const FACEPALM = STARTS[2][5];
export const RISER_AT = L_START[3] - 33; // el riser (1,1 s) termina justo cuando arranca el nivel 3

/* ── congelado y reacción ── */
export const FREEZE = L_END[2];
export const CLOSE2 = [FREEZE + 6, FREEZE + 52] as const; // primer plano de la sorpresa
export const SPLIT = CLOSE2[1]; // la última tarjeta se separa en sus dos procesos

/* ── explicación (sigue a la voz) ── */
export const CITE_IN = wordFrame("v3", "casi");
export const CITE_TAG = CITE_IN + 72; // la ficha se reduce a una etiqueta
export const READ = wordFrame("v3", "leer");
export const AUTO = wordFrame("v3", "automático");
export const NAME = wordFrame("v3", "nombrar");
export const CLASH = wordFrame("v3", "chocan");
export const WINNER = wordFrame("v3", "primero");
export const EXPLAIN_OUT = VOICE_AT.v4 - 2;

/* ── sello y cierre ── */
export const HEAD_EFFECT = wordFrame("v4", "efecto");
export const STAMP_HIT = wordFrame("v4", "stroop");
export const END_HEAD = voiceEnd("v4") + 2;
/** adelanto: tarjetas que barajan rápido («más rápido») e invitan a repetir */
export const TEASER = [1079, 1122] as const;
export const TEASER_STEP = 5;
export const RETURN = [1128, 1146] as const;
export const DURATION = 1158;
export const LAST = DURATION - 1;
