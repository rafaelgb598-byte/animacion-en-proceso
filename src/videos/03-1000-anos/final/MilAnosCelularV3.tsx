// 1000 años · V3 «¿Qué quedaría de tu celular después de mil años?»
// Mundo (cuarto → pradera) con cámara por planos + planos macro del celular + revelación de la foto.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import V2VOZ from "../v2/episodes/celular.voz.json";
import { AudioLayer } from "./componentes/audio/AudioLayer";
import { CameraV3 } from "./componentes/camera/CameraV3";
import { SafeZoneOverlay } from "./componentes/debug/SafeZoneOverlay";
import { YearReadout } from "./componentes/debug/YearReadout";
import { Atmosphere } from "./componentes/fx/Atmosphere";
import { Light } from "./componentes/fx/Light";
import { Rain } from "./componentes/fx/Rain";
import { TimeFlicker } from "./componentes/fx/TimeFlicker";
import { Book } from "./componentes/props/Book";
import { Bottle } from "./componentes/props/Bottle";
import { Charger } from "./componentes/props/Charger";
import { Lamp } from "./componentes/props/Lamp";
import { Nightstand } from "./componentes/props/Nightstand";
import { Phone, phonePort } from "./componentes/props/Phone";
import { MACRO_GEO, PhoneMacro } from "./componentes/props/PhoneMacro";
import { Backdrop } from "./componentes/scene/Backdrop";
import { Floor, Mound } from "./componentes/scene/Ground";
import { Grass } from "./componentes/scene/Grass";
import { Room, Sky } from "./componentes/scene/Room";
import { Vine } from "./componentes/scene/Vine";
import { Callout, type CalloutSpec, SmallTag } from "./componentes/ui/Callout";
import { HookV3 } from "./componentes/ui/HookV3";
import { OdometerCounter } from "./componentes/ui/OdometerCounter";
import { Subtitles } from "./componentes/ui/Subtitles";
import { TimeBar } from "./componentes/ui/TimeBar";
import { lightRegime } from "./decay";
import { CLAMP } from "./lib/anim";
import { glintT, screenOn } from "./lib/power";
import { onSupport } from "./lib/support";
import { macroAt, worldHidden, worldToScreen } from "./shots";
import { LAYOUT } from "./theme";
import { CUE, VOICE_CUES, type VoiceId, yearAt } from "./timeline";
import type { LightRig, VoiceSegment } from "./types";
import V3VOZ from "./voz.json";

export const milAnosV3Schema = z.object({ showSafeZones: z.boolean(), showYear: z.boolean() });
type Props = z.infer<typeof milAnosV3Schema>;

const P = LAYOUT.phone;
const HOOK = "¿Qué quedaría de tu celular después de mil años?";

type VozEntry = { duration: number; phrases: { text: string; start: number; end: number }[] };
const NEW_IDS = ["v3hook", "v3power", "v3remains", "v3before", "v3photo", "v3close"] as const;
const vozOf = (id: VoiceId): { file: string; data: VozEntry } =>
  (NEW_IDS as readonly string[]).includes(id)
    ? { file: `videos/03-1000-anos/final/voz/${id}.wav`, data: (V3VOZ as Record<string, VozEntry>)[id] }
    : { file: `videos/03-1000-anos/v2/voz/${id}.wav`, data: (V2VOZ as Record<string, VozEntry>)[id] };

/** Cortes naturales de subtítulo (« | ») para las frases largas; el texto dicho no cambia. */
const SUB_BREAKS: Record<string, string> = {
  "En unos días, la batería se agota…": "En unos días, | la batería se agota…",
  "Pero hay algo que probablemente desapareció mucho antes.": "Pero hay algo que | probablemente desapareció | mucho antes.",
  "Sin energía, la memoria del celular puede perder sus datos en años o décadas.": "Sin energía, | la memoria del celular | puede perder sus datos | en años o décadas.",
  "Tus recuerdos, solo si tienen copia.": "Tus recuerdos, | solo si tienen copia.",
};

/** El gancho ya está escrito en pantalla: no se subtitula dos veces. */
const VOICE: readonly VoiceSegment[] = (Object.keys(VOICE_CUES) as VoiceId[]).map((id) => {
  const v = vozOf(id);
  const phrases = v.data.phrases.map((ph) => ({ ...ph, text: SUB_BREAKS[ph.text] ?? ph.text }));
  return { id, from: VOICE_CUES[id], file: v.file, duration: v.data.duration, phrases, subtitles: id !== "v3hook" };
});

const RIG: LightRig = {
  lampPool: { x: LAYOUT.lamp.x, y: LAYOUT.lamp.y - 330, r: 560 },
  window: LAYOUT.window,
  beam: [
    [LAYOUT.window.x + 10, LAYOUT.window.y + 40],
    [LAYOUT.window.x + LAYOUT.window.w, LAYOUT.window.y],
    [1020, 1480],
    [430, 1640],
  ],
  screenGlow: { x: P.x, y: P.y, r: 300 },
};

/** Posiciones de la escala macro (el macro se escala alrededor del centro del celular). */
const macroPoint = (p: { x: number; y: number }, scale: number) => ({
  x: LAYOUT.macro.cx + (p.x - LAYOUT.macro.cx) * scale,
  y: LAYOUT.macro.cy + (p.y - LAYOUT.macro.cy) * scale,
});

const callouts = (frame: number, year: number): CalloutSpec[] => {
  const macro = macroAt(frame);
  const sc = macro.length ? macro[macro.length - 1].scale : 1;
  const chip = macroPoint(MACRO_GEO.chip, sc);
  const port = worldToScreen(phonePort(P, year, frame), frame);
  const bottleBase = onSupport(year, frame, LAYOUT.bottle.h, 0);
  const bottle = worldToScreen({ x: LAYOUT.bottle.x - 200 * bottleBase.t + 150, y: LAYOUT.bottle.y + LAYOUT.bottle.h / 2 + 330 * bottleBase.t - 10 }, frame);
  const glass = macroPoint({ x: MACRO_GEO.glassCenter.x, y: MACRO_GEO.glassCenter.y - 120 }, sc);
  const metal = macroPoint(MACRO_GEO.metal, sc);
  const plastic = macroPoint(MACRO_GEO.plastic, sc);
  return [
    { from: CUE.xrayStart + 12, to: CUE.xrayEnd, text: "memoria", target: { x: chip.x - 70, y: chip.y }, label: { x: chip.x - 210, y: chip.y - 170 } },
    { from: 424, to: 480, text: "batería hinchada", target: MACRO_GEO.sideGap, label: { x: 640, y: 780 } },
    { from: 712, to: 756, text: "cobre oxidado", target: port, label: { x: port.x - 150, y: port.y + 190 } },
    { from: 758, to: 830, text: "PET: deformado, entero", target: bottle, label: { x: bottle.x - 120, y: bottle.y - 170 } },
    { from: 906, to: 931, text: "vidrio", target: glass, label: { x: glass.x + 170, y: glass.y - 200 } },
    { from: 931, to: 952, text: "metal", target: metal, label: { x: metal.x + 60, y: metal.y + 210 } },
    { from: 952, to: 992, text: "plástico", target: plastic, label: { x: plastic.x - 60, y: plastic.y - 190 } },
  ];
};

export const MilAnosCelularV3: React.FC<Props> = ({ showSafeZones, showYear }) => {
  const frame = useCurrentFrame();
  const year = yearAt(frame);
  const p = { year, frame };
  const { exterior } = lightRegime(year);
  const hidden = worldHidden(frame);
  const macros = macroAt(frame);
  const counterOp = Math.min(
    interpolate(frame, [CUE.counterIn, CUE.counterIn + 12], [0, 1], CLAMP),
    interpolate(frame, [CUE.counterOutStart, CUE.counterOutStart + 12], [1, 0], CLAMP),
  );
  const echo = frame >= 740 && frame < 836 ? 0.06 : 0;
  return (
    <AbsoluteFill>
      <Backdrop />
      {!hidden ? (
        <TimeFlicker frame={frame}>
          <CameraV3
            frame={frame}
            sky={<Sky {...p} />}
            wall={
              <AbsoluteFill>
                <Room {...p} />
                <Vine
                  {...p}
                  path={[[150, 700], [132, 780], [112, 860], [92, 950], [74, 1040], [62, 1120], [84, 1180]]}
                  branch={[[400, 720], [470, 650], [540, 610], [620, 570], [700, 548], [790, 508], [880, 478]]}
                />
              </AbsoluteFill>
            }
          >
            <Floor {...p} />
            <Nightstand {...p} />
            <Lamp {...p} {...LAYOUT.lamp} drop={320} />
            <Bottle {...p} {...LAYOUT.bottle} drop={330} />
            <Charger {...p} {...LAYOUT.charger} floorY={1440} port={phonePort(P, year, frame)} />
            <Phone {...p} spec={P} glint={null} ghost={echo} />
            <Book {...p} {...LAYOUT.book} drop={330} />
            <Mound {...p} />
            <Grass {...p} count={300} flowerCount={12} />
            <Light year={year} frame={frame} rig={RIG} />
            <Rain year={year} frame={frame} />
          </CameraV3>
        </TimeFlicker>
      ) : null}
      {macros.map(({ shot, opacity, scale }) => {
        const mYear = shot.view === "fragment" ? 1000 : shot.from >= CUE.matchStart ? 0 : yearAt(frame);
        const isFinal = shot.from >= CUE.matchStart;
        const scr = shot.view === "fragment" ? 0 : isFinal ? (frame < CUE.photoBack ? 1 : interpolate(frame, [CUE.photoBack, CUE.photoBack + CUE.photoBackLen], [0, 1], CLAMP)) : screenOn(frame);
        const xray = shot.from === 168 ? Math.min(interpolate(frame, [CUE.xrayStart, CUE.xrayStart + 12], [0, 1], CLAMP), 1) : 0;
        return (
          <PhoneMacro
            key={`${shot.view}-${shot.from}`}
            uid={`m${shot.from}`}
            view={shot.view}
            year={mYear}
            frame={frame}
            screen={scr}
            xray={xray}
            decay={isFinal && frame < CUE.photoBack ? { start: CUE.decayStart, end: CUE.decayEnd } : null}
            glint={shot.view === "fragment" ? glintT(frame) : null}
            opacity={opacity}
            scale={scale}
          />
        );
      })}
      <Atmosphere frame={frame} darken={0} focus={LAYOUT.fragment} vignette={1 - 0.45 * exterior} />
      <AbsoluteFill>
        <OdometerCounter frame={frame} year={year} opacity={counterOp} />
        <TimeBar year={year} opacity={counterOp} />
        <HookV3 frame={frame} text={HOOK} />
        {callouts(frame, year).map((c) => (
          <Callout key={`${c.from}-${c.text}`} frame={frame} spec={c} />
        ))}
        <SmallTag frame={frame} from={CUE.decayStart - 6} to={CUE.photoBack} text="representación" x={640} y={392} />
        <SmallTag frame={frame} from={CUE.simStart} to={CUE.simEnd} text="simulación" x={100} y={300} />
        <Subtitles frame={frame} voice={VOICE} />
      </AbsoluteFill>
      <AudioLayer voice={VOICE} />
      {showSafeZones ? <SafeZoneOverlay /> : null}
      {showYear ? <YearReadout frame={frame} year={year} /> : null}
    </AbsoluteFill>
  );
};
