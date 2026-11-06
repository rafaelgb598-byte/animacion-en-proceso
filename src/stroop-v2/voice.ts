import type { Word } from "../short-final/words";
import v1 from "../../public/stroop-v2/vo/v1.align.json";
import v2 from "../../public/stroop-v2/vo/v2.align.json";
import v3 from "../../public/stroop-v2/vo/v3.align.json";
import v4 from "../../public/stroop-v2/vo/v4.align.json";
import v5 from "../../public/stroop-v2/vo/v5.align.json";

/**
 * Voz de la V2: misma voz (Isaac) y mismo texto que la V1, regenerada a velocidad natural (1,0).
 * Archivos en public/stroop-v2/vo/ (la V1 conserva los suyos).
 */

export type VoiceId = "v1" | "v2" | "v3" | "v4" | "v5";
type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
export const ALIGN: Record<VoiceId, Alignment> = { v1: v1.alignment, v2: v2.alignment, v3: v3.alignment, v4: v4.alignment, v5: v5.alignment };
export const voiceSrc = (id: VoiceId) => `stroop-v2/vo/${id}.mp3`;

export const blockWords = (id: VoiceId): Word[] => {
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

export const blockEnd = (id: VoiceId) => {
  const e = ALIGN[id].character_end_times_seconds;
  return e[e.length - 1] ?? 0;
};
