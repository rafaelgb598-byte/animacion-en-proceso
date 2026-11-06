import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { CLAMP } from "../../lib/anim";
import { CUE, DUCK, EVENTS, FPS, JUMP_ENDS, JUMP_STARTS, LOOP_CUT } from "../../timeline";
import type { VoiceSegment } from "../../types";

const SFX = (name: string) => staticFile(`videos/03-1000-anos/v2/sfx/${name}.wav`);

type Cue = { key: string; file: string; from: number; dur: number; volume: number | ((f: number) => number) };

/** Fundido de entrada/salida (frames locales) para capas de ambiente. */
const bed = (dur: number, v: number, fadeIn = 10, fadeOut = 10) => (f: number) =>
  v * interpolate(f, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], CLAMP);

/** Efectos sintetizados (scripts/gen-sfx-ultimo.mjs). Volúmenes de la sección 9. */
export const audioCues = (): Cue[] => {
  const windDur = LOOP_CUT - CUE.windStart;
  const rise = EVENTS.year200 - CUE.windStart;
  return [
    ...CUE.ticks.map((f) => ({ key: `tick-${f}`, file: "tick", from: f, dur: 10, volume: 0.4 })),
    {
      key: "hum",
      file: "charger-hum",
      from: 0,
      dur: CUE.chargerHumEnd + 3,
      volume: (f: number) => 0.06 * interpolate(f, [CUE.chargerHumEnd, CUE.chargerHumEnd + 3], [1, 0], CLAMP),
    },
    { key: "buzz", file: "buzz", from: CUE.buzz, dur: 10, volume: 0.3 },
    { key: "power-off", file: "power-off", from: CUE.powerOff, dur: 8, volume: 0.25 },
    ...JUMP_STARTS.map((f) => ({ key: `warp-${f}`, file: "timewarp", from: f, dur: 32, volume: 0.22 })),
    ...JUMP_ENDS.map((f) => ({ key: `odo-${f}`, file: "odometer", from: f, dur: 6, volume: 0.35 })),
    { key: "glass", file: "glass-break", from: EVENTS.glassBreak, dur: 40, volume: 0.3 },
    { key: "lamp-fall", file: "lamp-fall", from: EVENTS.lampFall, dur: 12, volume: 0.35 },
    { key: "room", file: "room", from: CUE.roomStart, dur: CUE.roomEnd - CUE.roomStart, volume: bed(CUE.roomEnd - CUE.roomStart, 0.04) },
    {
      key: "wind",
      file: "wind",
      from: CUE.windStart,
      dur: windDur,
      volume: (f: number) => bed(windDur, 1, 20, 4)(f) * interpolate(f, [rise - 20, rise + 10], [0.05, 0.1], CLAMP),
    },
    { key: "rain", file: "rain", from: EVENTS.rainStart, dur: EVENTS.rainEnd - EVENTS.rainStart, volume: bed(EVENTS.rainEnd - EVENTS.rainStart, 0.08, 15, 20) },
    { key: "insects", file: "insects", from: CUE.insectsStart, dur: CUE.insectsEnd - CUE.insectsStart, volume: bed(CUE.insectsEnd - CUE.insectsStart, 0.04, 20, 20) },
    { key: "glint", file: "glint", from: CUE.glint, dur: 10, volume: 0.15 },
    { key: "reveal", file: "reveal", from: CUE.card, dur: 62, volume: 0.4 },
  ];
};

/** 1 sin voz, DUCK.level mientras habla (con ataque y liberación). Frame global. */
export const duckAt = (frame: number, voice: readonly VoiceSegment[]): number => {
  let g = 1;
  for (const v of voice) {
    if (!v.phrases.length) continue;
    const a = v.from + v.phrases[0].start * FPS;
    const b = v.from + v.phrases[v.phrases.length - 1].end * FPS;
    const t = interpolate(frame, [a - DUCK.attack, a, b, b + DUCK.release], [0, 1, 1, 0], CLAMP);
    g = Math.min(g, 1 - (1 - DUCK.level) * t);
  }
  return g;
};

export const AudioLayer: React.FC<{ voice?: readonly VoiceSegment[] }> = ({ voice = [] }) => (
  <>
    {audioCues().map((c) => (
      <Sequence key={c.key} from={c.from} durationInFrames={c.dur} layout="none">
        <Audio
          src={SFX(c.file)}
          volume={(f: number) => (typeof c.volume === "number" ? c.volume : c.volume(f)) * duckAt(c.from + f, voice)}
        />
      </Sequence>
    ))}
    {voice.map((v) => (
      <Sequence key={`voz-${v.id}`} from={v.from} durationInFrames={Math.ceil(v.duration * FPS) + 2} layout="none">
        <Audio src={staticFile(v.file)} volume={1} />
      </Sequence>
    ))}
  </>
);
