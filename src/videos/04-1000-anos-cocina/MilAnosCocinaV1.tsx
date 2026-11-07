// 1000 años («Último en pie») · Episodio 2 «¿Qué queda de tu cocina en 1000 años?» · v1
// Plano único de noche: se corta la luz de la heladera y nadie vuelve. Gana el plato sin lavar de la pileta.
// Sin narración: el texto en pantalla es el único sistema de lectura. Todos los frames salen de cocina.timeline.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CAM_EASE, lerp, TAU } from "../../canal/mil-anos/anim";
import { SfxLayer } from "../../canal/mil-anos/audio/SfxLayer";
import { SafeZoneOverlay, YearReadout } from "../../canal/mil-anos/debug/SafeZoneOverlay";
import { Atmosphere } from "../../canal/mil-anos/fx/Atmosphere";
import { TimeFlicker, warpIntensity } from "../../canal/mil-anos/fx/TimeFlicker";
import { DecayLabels } from "../../canal/mil-anos/ui/DecayLabels";
import { GuessMarkers } from "../../canal/mil-anos/ui/GuessMarkers";
import { HookText } from "../../canal/mil-anos/ui/HookText";
import { LastStandingCard } from "../../canal/mil-anos/ui/LastStandingCard";
import { OdometerCounter } from "../../canal/mil-anos/ui/OdometerCounter";
import { TimeBar } from "../../canal/mil-anos/ui/TimeBar";
import { type CameraState, KitchenScene, toScreen } from "./componentes/kitchen/KitchenScene";
import { RecipeGhost } from "./componentes/kitchen/Recipe";
import { BET, HOOK, LABEL_STYLE, LABELS, MARKER_ECHO, MARKERS, QUESTION, REMATE, WINNER, ZOOM_ORIGIN } from "./episodes/cocina";
import { audioCues } from "./episodes/cocina.audio";
import { daylight } from "./episodes/cocina.decay";
import { CLOCK, CUE, DURATION, LOOP_CUT, yearAt } from "./episodes/cocina.timeline";
import { LAYOUT, M, TYPE } from "./theme";

export const milAnosCocinaSchema = z.object({ showSafeZones: z.boolean(), showYear: z.boolean() });
type Props = z.infer<typeof milAnosCocinaSchema>;

/** Luz de la heladera: encendida → 3 parpadeos irregulares (f3–f40) → se apaga de golpe en f40. */
const fridgeLightAt = (f: number) => {
  if (f >= CUE.fridgeOff) return 0;
  return CUE.fridgeDips.some(([a, b]) => f >= a && f < b) ? 0.12 : 1;
};

const CUES = audioCues();

export const MilAnosCocinaV1: React.FC<Props> = ({ showSafeZones, showYear }) => {
  const frame = useCurrentFrame();
  const inLoop = frame >= LOOP_CUT;
  /** Estado del mundo: en el tramo de loop es exactamente el del frame 0. */
  const f = inLoop ? 0 : frame;
  /** Micro-movimiento (deriva de cámara y grano): en el loop corre de modo que el frame 1199 caiga en 0. */
  const micro = inLoop ? frame - (DURATION - 1) : frame;
  const year = yearAt(f);
  const light = fridgeLightAt(f);
  const cam: CameraState = {
    push: lerp(f, CUE.pushIn, [1, 1.04], CAM_EASE),
    zoom: lerp(f, CUE.reveal, [1, 1.14], CAM_EASE),
    dx: 2 * Math.sin((TAU * micro) / 150),
    dy: 1.5 * Math.sin((TAU * micro) / 240),
  };
  const plateOnScreen = toScreen(ZOOM_ORIGIN, cam);
  const toS = (m: { x: number; y: number }) => toScreen(m, cam);
  const darken = lerp(f, CUE.reveal, [0, 0.6]);
  const glint = f >= CUE.glint && f < CUE.glint + CUE.glintLen ? (f - CUE.glint) / CUE.glintLen : null;
  const ghost = 0.12 * lerp(f, [CUE.ghost[0], CUE.ghost[0] + 4, CUE.ghost[1] - 8, CUE.ghost[1]], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <TimeFlicker frame={f} clock={CLOCK}>
        <KitchenScene year={year} frame={f} light={light} glint={glint} cam={cam} />
      </TimeFlicker>
      <Atmosphere grainSeed={micro} grain={0.05 + 0.03 * warpIntensity(f, CLOCK)} darken={darken} focus={plateOnScreen} focusR={520} vignette={1 - 0.4 * daylight(year)} />
      <AbsoluteFill>
        <OdometerCounter frame={f} year={year} opacity={1} clock={CLOCK} />
        <TimeBar year={year} opacity={1} />
        <HookText frame={f} lines={HOOK} end={CUE.hookEnd} centerY={LAYOUT.hookY} size={TYPE.hook} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.hookOut} />
        <HookText frame={f} lines={BET} end={CUE.betEnd} centerY={LAYOUT.hookY} size={TYPE.bet} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.betOut} />
        <GuessMarkers frame={f} markers={MARKERS.map((m) => ({ ...m, ...toS(m) }))} inLen={CUE.markerIn} outLen={CUE.markerOut} font={TYPE.marker} />
        <DecayLabels frame={f} cues={LABELS} style={LABEL_STYLE} />
        <LastStandingCard frame={f} from={CUE.card} len={CUE.cardLen} inLen={CUE.cardIn} outLen={CUE.cardOut} winner={WINNER} />
        <GuessMarkers frame={f} markers={MARKER_ECHO.map((m) => ({ ...m, ...toS(m) }))} inLen={3} outLen={4} font={TYPE.marker} />
        <RecipeGhost opacity={ghost} x={plateOnScreen.x} y={plateOnScreen.y + 10} />
        <HookText frame={f} lines={REMATE} end={CUE.remate[1]} centerY={LAYOUT.remateY} size={TYPE.remate} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.remateOut} />
        <HookText frame={f} lines={QUESTION} end={CUE.question[1]} centerY={LAYOUT.questionBase} anchorBottom size={TYPE.question} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.questionOut} />
      </AbsoluteFill>
      <SfxLayer cues={CUES} />
      {showSafeZones ? <SafeZoneOverlay /> : null}
      {showYear ? <YearReadout frame={frame} year={year} /> : null}
    </AbsoluteFill>
  );
};
