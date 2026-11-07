// 1000 años («Último en pie») · Episodio 2 «¿Qué queda de tu cocina en 1000 años?» · v2
// Cambios sobre la v1 (prompt-v2.md): encuadre ×1,30, acercamientos a la heladera y al plato, sin spoiler,
// solo las 4 etiquetas con cifra, narración de Isaac con subtítulos del canal, español neutro.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CAM_EASE, CLAMP, lerp, TAU } from "../../../canal/mil-anos/anim";
import { SfxLayer } from "../../../canal/mil-anos/audio/SfxLayer";
import { SafeZoneOverlay, YearReadout } from "../../../canal/mil-anos/debug/SafeZoneOverlay";
import { Atmosphere } from "../../../canal/mil-anos/fx/Atmosphere";
import { TimeFlicker, warpIntensity } from "../../../canal/mil-anos/fx/TimeFlicker";
import { DecayLabels } from "../../../canal/mil-anos/ui/DecayLabels";
import { GuessMarkers } from "../../../canal/mil-anos/ui/GuessMarkers";
import { type HookLine, HookText } from "../../../canal/mil-anos/ui/HookText";
import { LastStandingCard } from "../../../canal/mil-anos/ui/LastStandingCard";
import { OdometerCounter } from "../../../canal/mil-anos/ui/OdometerCounter";
import { TimeBar } from "../../../canal/mil-anos/ui/TimeBar";
import { Subtitulos } from "../../../canal/subtitulos/Subtitulos";
import { type CameraState, KitchenScene, toScreen } from "./componentes/kitchen/KitchenScene";
import { RecipeGhost } from "./componentes/kitchen/Recipe";
import { BET_NUMBERS, BET_QUESTION, LABEL_STYLE, LABELS, MARKER_ECHO, MARKERS, QUESTION_LINES, VOICE_TEXT, WINNER } from "./episodes/cocina";
import { sfxCues, voiceCues } from "./episodes/cocina.audio";
import { daylight, sinkDrop } from "./episodes/cocina.decay";
import { CLOCK, CUE, DURATION, LOOP_CUT, yearAt } from "./episodes/cocina.timeline";
import { subtitleVisible, subtitleWords, voiceEnd, wordFrame, wordFrames } from "./episodes/cocina.voz";
import { CAM, LAYOUT, M, TYPE, UI_LAYOUT } from "./theme";

export const milAnosCocinaV2Schema = z.object({
  showSafeZones: z.boolean(),
  showYear: z.boolean(),
  /** capas para el QA de subtítulos: todo · subtitulos · escena (sin subtítulos ni audio) · fondo (solo escenario) */
  capa: z.enum(["todo", "subtitulos", "escena", "fondo"]).optional(),
  qaSubs: z.boolean().optional(),
  /** stems para el QA de la mezcla: todo · voz (solo narración) · efectos (sin narración) */
  mezcla: z.enum(["todo", "voz", "efectos"]).optional(),
});
type Props = z.infer<typeof milAnosCocinaV2Schema>;

const fridgeLightAt = (f: number) => {
  if (f >= CUE.fridgeOff) return 0;
  return CUE.fridgeDips.some(([a, b]) => f >= a && f < b) ? 0.12 : 1;
};

/** Encuadre que pone el punto de mundo `w` en el punto de pantalla `p` con escala `s`. */
const frameOn = (w: { x: number; y: number }, p: { x: number; y: number }, s: number): CameraState => ({ s, tx: p.x - s * w.x, ty: p.y - s * w.y });
const mix = (a: CameraState, b: CameraState, k: number): CameraState => ({ s: a.s + (b.s - a.s) * k, tx: a.tx + (b.tx - a.tx) * k, ty: a.ty + (b.ty - a.ty) * k });
const IN_OUT = Easing.inOut(Easing.cubic);

/** Plato en AÑO 1.000 (ya hundido) en coordenadas de mundo. */
const PLATE_BURIED = { x: LAYOUT.plate.cx, y: LAYOUT.plate.cy + LAYOUT.sinkDrop * sinkDrop(1000) };

/** Cámara: base ×1,30 → acercamiento a la heladera (f125–150 / f255–280) → acercamiento al plato (f930–985) + empuje del gancho. */
const cameraAt = (f: number, micro: number): CameraState => {
  const base: CameraState = CAM.base;
  const fridge = frameOn(LAYOUT.fridgeFocus, CAM.fridgeOnScreen, CAM.base.s * CAM.fridgeZoom);
  const reveal = frameOn(PLATE_BURIED, CAM.plateOnScreen, CAM.base.s * CAM.revealZoom);
  const kF = Math.min(lerp(f, CUE.fridgeZoomIn, [0, 1], IN_OUT), lerp(f, CUE.fridgeZoomOut, [1, 0], IN_OUT));
  const kR = lerp(f, CUE.reveal, [0, 1], CAM_EASE);
  let c = mix(mix(base, fridge, kF), reveal, kR);
  const z = lerp(f, CUE.pushIn, [1, CAM.hookPush], CAM_EASE);
  const o = CAM.hookPushOrigin;
  c = { s: c.s * z, tx: o.x + z * (c.tx - o.x), ty: o.y + z * (c.ty - o.y) };
  return { s: c.s, tx: c.tx + 2 * Math.sin((TAU * micro) / 150), ty: c.ty + 1.5 * Math.sin((TAU * micro) / 240) };
};

const words = (s: string) => s.split(" ");

/** Gancho sincronizado con la frase 1 («Se corta la luz.» / «Nadie vuelve.»), 84 px. */
const HOOK: readonly HookLine[] = (() => {
  const w = words(VOICE_TEXT.v01);
  const at = wordFrames("v01");
  return [
    { words: w.slice(0, 4), from: at[0], at: at.slice(0, 4) },
    { words: w.slice(4), from: at[4], at: at.slice(4) },
  ];
})();

/** Apuesta: «¿Cuál queda en pie?» (Barlow 72) y «1 · 2 · 3» (Plex Mono 56). */
const BET: readonly HookLine[] = [
  { words: words(BET_QUESTION), from: CUE.betLines[0], size: TYPE.bet },
  { words: words(BET_NUMBERS), from: CUE.betLines[1], size: TYPE.betNumbers, mono: true },
];

/** Remate sincronizado con la frase 10, 72 px. */
const REMATE: readonly HookLine[] = [{ words: words(VOICE_TEXT.v10), from: wordFrames("v10")[0], at: wordFrames("v10") }];

/** Pregunta: la primera línea con la frase 11; «Coméntalo.» al terminar la voz. */
const QUESTION: readonly HookLine[] = [
  { words: words(QUESTION_LINES[0]), from: wordFrames("v11")[0], at: wordFrames("v11") },
  { words: words(QUESTION_LINES[1]), from: voiceEnd("v11") + 2 },
];

/** El fantasma aparece con «La receta… no» y se desvanece en 30 frames. */
const GHOST_FROM = wordFrame("v10", "La");

const SFX = sfxCues();
const VOZ_CUES = voiceCues();
const SUB_WORDS = subtitleWords();

export const MilAnosCocinaV2: React.FC<Props> = ({ showSafeZones, showYear, capa = "todo", mezcla = "todo" }) => {
  const frame = useCurrentFrame();
  const inLoop = frame >= LOOP_CUT;
  const f = inLoop ? 0 : frame;
  const micro = inLoop ? frame - (DURATION - 1) : frame;
  const year = yearAt(f);
  const light = fridgeLightAt(f);
  const cam = cameraAt(f, micro);
  const plate = toScreen({ x: LAYOUT.plate.cx, y: LAYOUT.plate.cy + LAYOUT.sinkDrop * sinkDrop(year) }, cam);
  const darken = lerp(f, CUE.reveal, [0, 0.6]);
  const glint = f >= CUE.glint && f < CUE.glint + CUE.glintLen ? (f - CUE.glint) / CUE.glintLen : null;
  const ghost = 0.3 * interpolate(f, [GHOST_FROM, GHOST_FROM + 4, GHOST_FROM + 4 + CUE.ghostLen], [0, 1, 0], CLAMP);
  const toS = (m: { x: number; y: number }) => toScreen({ x: m.x, y: m.y + (m === MARKER_ECHO[0] ? LAYOUT.sinkDrop * sinkDrop(year) : 0) }, cam);
  const conEscena = capa !== "subtitulos";
  const conTextos = capa === "todo" || capa === "escena";
  const conSubs = capa === "todo" || capa === "subtitulos";
  return (
    <AbsoluteFill style={{ background: capa === "subtitulos" ? undefined : M.night }}>
      {conEscena ? (
        <>
          <TimeFlicker frame={f} clock={CLOCK}>
            <KitchenScene year={year} frame={f} light={light} glint={glint} cam={cam} objetos={capa !== "fondo"} />
          </TimeFlicker>
          <Atmosphere grainSeed={micro} grain={0.05 + 0.03 * warpIntensity(f, CLOCK)} darken={darken} focus={plate} focusR={560} vignette={1 - 0.4 * daylight(year)} />
        </>
      ) : null}
      {conTextos ? (
        <AbsoluteFill>
          <OdometerCounter frame={f} year={year} opacity={1} clock={CLOCK} />
          <TimeBar year={year} opacity={1} />
          <HookText frame={f} lines={HOOK} end={CUE.hookEnd} centerY={UI_LAYOUT.hookY} size={TYPE.hook} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.hookOut} />
          <HookText frame={f} lines={BET} end={CUE.betEnd} centerY={UI_LAYOUT.betY} size={TYPE.bet} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.betOut} />
          <GuessMarkers frame={f} markers={MARKERS.map((m) => ({ ...m, ...toS(m) }))} inLen={CUE.markerIn} outLen={CUE.markerOut} size={TYPE.markerSize} font={TYPE.marker} border={TYPE.markerBorder} pulse />
          <DecayLabels frame={f} cues={LABELS} style={LABEL_STYLE} />
          <LastStandingCard frame={f} from={CUE.card} len={CUE.cardLen} inLen={CUE.cardIn} outLen={CUE.cardOut} winner={WINNER} />
          <GuessMarkers frame={f} markers={MARKER_ECHO.map((m) => ({ ...m, ...toS(m) }))} inLen={3} outLen={4} size={TYPE.markerSize} font={TYPE.marker} border={TYPE.markerBorder} />
          <RecipeGhost opacity={ghost} x={plate.x} y={plate.y} width={2 * LAYOUT.plate.rx * cam.s} />
          <HookText frame={f} lines={REMATE} end={CUE.remateEnd} centerY={UI_LAYOUT.remateY} size={TYPE.remate} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.remateOut} />
          <HookText frame={f} lines={QUESTION} end={CUE.questionEnd} centerY={UI_LAYOUT.remateY} size={TYPE.question} wordStep={CUE.wordStep} wordIn={CUE.wordIn} outLen={CUE.questionOut} />
        </AbsoluteFill>
      ) : null}
      {conSubs ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Subtitulos f={frame} palabras={SUB_WORDS} visible={subtitleVisible} debug={showSafeZones} />
        </svg>
      ) : null}
      {capa === "todo" ? <SfxLayer cues={[...(mezcla === "voz" ? [] : SFX), ...(mezcla === "efectos" ? [] : VOZ_CUES)]} /> : null}
      {showSafeZones && conTextos ? <SafeZoneOverlay /> : null}
      {showYear && conTextos ? <YearReadout frame={frame} year={year} /> : null}
    </AbsoluteFill>
  );
};
