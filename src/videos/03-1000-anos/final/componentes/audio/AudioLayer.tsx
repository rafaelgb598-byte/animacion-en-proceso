import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { CLAMP } from "../../lib/anim";
import { CUE, DUCK, DURATION, EVENTS, FPS, JUMP_ENDS, JUMP_STARTS, LOOP_CUT } from "../../timeline";
import type { VoiceSegment } from "../../types";

/** Efectos de la V2 (reutilizados) y nuevos de la V3. */
const OLD = (name: string) => staticFile(`videos/03-1000-anos/v2/sfx/${name}.wav`);
const NEW = (name: string) => staticFile(`videos/03-1000-anos/final/sfx/${name}.wav`);

type Cue = { key: string; src: string; from: number; dur: number; volume: number | ((f: number) => number) };

/** Capa de ambiente con fundidos de entrada/salida (frames locales): permite fundidos cruzados. */
const bed = (dur: number, v: number, fadeIn = 20, fadeOut = 20) => (f: number) =>
  v * interpolate(f, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], CLAMP);

export const audioCues = (): Cue[] => {
  const windFrom = CUE.windStart - 10;
  const windDur = LOOP_CUT - windFrom;
  const rise = EVENTS.year200 - windFrom;
  return [
    { key: "hum", src: OLD("charger-hum"), from: 0, dur: CUE.chargerHumEnd + 3, volume: (f) => 0.06 * interpolate(f, [CUE.chargerHumEnd, CUE.chargerHumEnd + 3], [1, 0], CLAMP) },
    { key: "buzz", src: OLD("buzz"), from: CUE.buzz, dur: 10, volume: 0.3 },
    { key: "lamp-off", src: OLD("power-off"), from: CUE.lampDips[0], dur: 8, volume: 0.25 },
    { key: "screen-off", src: OLD("tick"), from: CUE.screenOff, dur: 4, volume: 0.3 },
    { key: "motif-xray", src: NEW("photo-motif"), from: CUE.xrayStart, dur: 27, volume: 0.32 },
    ...JUMP_STARTS.map((f) => ({ key: `warp-${f}`, src: OLD("timewarp"), from: f, dur: 30, volume: 0.2 })),
    ...JUMP_ENDS.map((f) => ({ key: `odo-${f}`, src: OLD("odometer"), from: f, dur: 4, volume: 0.3 })),
    { key: "glass", src: OLD("glass-break"), from: EVENTS.glassBreak, dur: 36, volume: 0.3 },
    { key: "glass-tick", src: NEW("glass-tick"), from: 432, dur: 2, volume: 0.28 },
    { key: "lamp-fall", src: OLD("lamp-fall"), from: EVENTS.lampFall, dur: 12, volume: 0.32 },
    ...EVENTS.wallPanels.map((f, i) => ({ key: `panel-${i}`, src: NEW("panel-thud"), from: f, dur: 9, volume: 0.26 })),
    { key: "creak", src: NEW("wood-creak"), from: EVENTS.collapse - 6, dur: 18, volume: 0.32 },
    { key: "room", src: OLD("room"), from: CUE.roomStart, dur: CUE.roomEnd - CUE.roomStart, volume: bed(CUE.roomEnd - CUE.roomStart, 0.04) },
    {
      key: "wind",
      src: OLD("wind"),
      from: windFrom,
      dur: windDur,
      volume: (f: number) => bed(windDur, 1, 30, 25)(f) * interpolate(f, [rise - 20, rise + 10], [0.05, 0.1], CLAMP),
    },
    { key: "rain", src: OLD("rain"), from: EVENTS.rainStart, dur: Math.min(240, EVENTS.rainEnd - EVENTS.rainStart), volume: bed(Math.min(240, EVENTS.rainEnd - EVENTS.rainStart), 0.08, 15, 25) },
    { key: "insects", src: OLD("insects"), from: CUE.insectsStart, dur: CUE.insectsEnd - CUE.insectsStart, volume: bed(CUE.insectsEnd - CUE.insectsStart, 0.04) },
    { key: "soil", src: NEW("soil"), from: 712, dur: 30, volume: 0.18 },
    { key: "glint", src: OLD("glint"), from: CUE.glint, dur: 10, volume: 0.15 },
    { key: "reveal", src: OLD("reveal"), from: CUE.matchStart, dur: 62, volume: 0.18 },
    { key: "motif-back", src: NEW("photo-motif"), from: CUE.matchStart + 10, dur: 27, volume: 0.32 },
    { key: "data-loss", src: NEW("data-loss"), from: CUE.decayStart, dur: 60, volume: 0.3 },
    { key: "motif-return", src: NEW("photo-motif"), from: CUE.photoBack, dur: 27, volume: 0.26 },
    { key: "room-end", src: OLD("room"), from: LOOP_CUT, dur: DURATION - LOOP_CUT, volume: bed(DURATION - LOOP_CUT, 0.03, 25, 2) },
    { key: "hum-end", src: OLD("charger-hum"), from: CUE.photoBack, dur: DURATION - CUE.photoBack, volume: bed(DURATION - CUE.photoBack, 0.06, 20, 1) },
  ];
};

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

export const AudioLayer: React.FC<{ voice: readonly VoiceSegment[] }> = ({ voice }) => (
  <>
    {audioCues().map((c) => (
      <Sequence key={c.key} from={c.from} durationInFrames={c.dur} layout="none">
        <Audio src={c.src} volume={(f: number) => (typeof c.volume === "number" ? c.volume : c.volume(f)) * duckAt(c.from + f, voice)} />
      </Sequence>
    ))}
    {voice.map((v) => (
      <Sequence key={`voz-${v.id}`} from={v.from} durationInFrames={Math.ceil(v.duration * FPS) + 2} layout="none">
        <Audio src={staticFile(v.file)} volume={1} />
      </Sequence>
    ))}
  </>
);
