import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, Sequence } from "remotion";
import { CLAMP } from "../anim";

/** Un efecto: archivo, frame de entrada, duración (frames) y volumen fijo o por frame local. */
export type SfxCue = { key: string; src: string; from: number; dur: number; volume: number | ((f: number) => number); loop?: boolean };

/** Capa de ambiente con fundidos (frames locales): permite fundidos cruzados. */
export const bed = (dur: number, v: number, fadeIn = 20, fadeOut = 20) => (f: number) => v * interpolate(f, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], CLAMP);

/** Reproduce la lista de efectos del episodio (sin voz: la serie suena con efectos sintetizados). */
export const SfxLayer: React.FC<{ cues: readonly SfxCue[] }> = ({ cues }) => (
  <>
    {cues.map((c) => (
      <Sequence key={c.key} from={c.from} durationInFrames={Math.max(1, c.dur)} layout="none">
        <Audio src={c.src} loop={c.loop ?? false} volume={(f: number) => (typeof c.volume === "number" ? c.volume : c.volume(f))} />
      </Sequence>
    ))}
  </>
);
