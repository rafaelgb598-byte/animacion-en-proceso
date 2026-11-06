import { springSeries } from "../anim";

/**
 * Sincronía de labios a partir de la alineación por carácter de ElevenLabs (reutilizable).
 * Cada letra tiene un "visema" simple (apertura y ancho de boca); se muestrea por fotograma
 * con submuestreo y se suaviza con un resorte para que la boca no tiemble.
 */

export type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
export type LipBlock = { align: Alignment; at: number };
export type LipSeries = { open: number[]; width: number[]; talking: number[] };

const strip = (c: string) => c.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** [apertura 0..1, ancho relativo] */
export const viseme = (ch: string): [number, number] => {
  const c = strip(ch);
  if ("a".includes(c)) return [0.85, 1.0];
  if ("e".includes(c)) return [0.55, 1.15];
  if ("i".includes(c)) return [0.3, 1.2];
  if ("o".includes(c)) return [0.65, 0.72];
  if ("u".includes(c)) return [0.35, 0.62];
  if ("mbp".includes(c)) return [0, 0.92];
  if ("fv".includes(c)) return [0.12, 1.05];
  if (/[a-zñ]/.test(c)) return [0.22, 1.0];
  return [0, 1];
};

export const lipSeries = (blocks: LipBlock[], frames: number, fps = 30): LipSeries => {
  const rawO = new Array<number>(frames).fill(0);
  const rawW = new Array<number>(frames).fill(1);
  const rawT = new Array<number>(frames).fill(0);
  for (const b of blocks) {
    const a = b.align;
    const t0 = b.at / fps;
    const end = a.character_end_times_seconds[a.character_end_times_seconds.length - 1] ?? 0;
    const f0 = Math.max(0, Math.floor(b.at));
    const f1 = Math.min(frames - 1, Math.ceil(b.at + end * fps) + 1);
    for (let f = f0; f <= f1; f++) {
      let o = 0;
      let w = 0;
      const SUB = 3;
      for (let k = 0; k < SUB; k++) {
        const t = f / fps + k / (SUB * fps) - t0;
        let i = 0;
        while (i < a.characters.length && a.character_end_times_seconds[i] <= t) i++;
        if (i < a.characters.length && a.character_start_times_seconds[i] <= t) {
          const v = viseme(a.characters[i]);
          o += v[0];
          w += v[1];
        } else {
          w += 1;
        }
      }
      rawO[f] = Math.max(rawO[f], o / SUB);
      rawW[f] = w / SUB;
      rawT[f] = t0 * fps <= f && f <= b.at + end * fps ? 1 : rawT[f];
    }
  }
  return {
    open: springSeries(rawO, 0.55, 0.42).map((v) => Math.max(0, v)),
    width: springSeries(rawW, 0.45, 0.5),
    talking: springSeries(rawT, 0.25, 0.55).map((v) => Math.min(1, Math.max(0, v))),
  };
};
