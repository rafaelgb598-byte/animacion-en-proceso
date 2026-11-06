// 1000 años · V4 «¿Qué quedaría de tu celular después de mil años?»
// Cambios sobre la v3: gancho con movimiento desde f0, año 10 en plano general (ventana + batería),
// un solo sistema de texto por momento, carta «ÚLTIMO EN PIE», epílogo corto con remate e invitación a comentar.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import V2VOZ from "../v2/episodes/celular.voz.json";
import V3VOZ from "../final/voz.json";
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
import { Epilogue } from "./componentes/ui/Epilogue";
import { HookV3 } from "./componentes/ui/HookV3";
import { LastStandingCard } from "./componentes/ui/LastStandingCard";
import { OdometerCounter } from "./componentes/ui/OdometerCounter";
import { Subtitles } from "./componentes/ui/Subtitles";
import { TimeBar } from "./componentes/ui/TimeBar";
import { lightRegime } from "./decay";
import { CLAMP } from "./lib/anim";
import { glintT, screenOn } from "./lib/power";
import { macroAt, worldHidden } from "./shots";
import { LAYOUT } from "./theme";
import { CUE, VOICE_CUES, type VoiceId, yearAt } from "./timeline";
import type { LightRig, VoiceSegment } from "./types";
import V4VOZ from "./voz.json";

export const milAnosV4Schema = z.object({ showSafeZones: z.boolean(), showYear: z.boolean() });
type Props = z.infer<typeof milAnosV4Schema>;

const P = LAYOUT.phone;
/** Igual a la frase hablada (el prompt pide no cambiar el texto si la narración es distinta). */
const HOOK = "¿Qué quedaría de tu celular después de mil años?";
const PHOTO_NO = "La foto, no.";
const CTA = "¿Qué lugar abandonamos ahora? Comentalo.";
/** Carta sin cifra: el «millón de años» del vidrio no tiene respaldo medido (decisión del usuario). */
const WINNER = { kicker: "ÚLTIMO EN PIE", name: "el vidrio de la pantalla", figure: "sigue ahí después de 1.000 años", foot: "simulación · estimaciones" };

type VozEntry = { duration: number; phrases: { text: string; start: number; end: number }[] };
const SOURCES: Record<string, { base: string; data: Record<string, VozEntry> }> = {
  v2: { base: "videos/03-1000-anos/v2/voz", data: V2VOZ as Record<string, VozEntry> },
  final: { base: "videos/03-1000-anos/final/voz", data: V3VOZ as Record<string, VozEntry> },
  v4: { base: "videos/03-1000-anos/v4/voz", data: V4VOZ as Record<string, VozEntry> },
};
const sourceOf = (id: VoiceId) => (id === "v4memory" ? "v4" : id.startsWith("v3") ? "final" : "v2");

/** El gancho y «La foto, no.» ya están escritos en pantalla: no se subtitulan dos veces. */
const VOICE: readonly VoiceSegment[] = (Object.keys(VOICE_CUES) as VoiceId[]).map((id) => {
  const src = SOURCES[sourceOf(id)];
  const d = src.data[id];
  return { id, from: VOICE_CUES[id], file: `${src.base}/${id}.wav`, duration: d.duration, phrases: d.phrases, subtitles: id !== "v3hook" && id !== "photo" };
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

const macroPoint = (p: { x: number; y: number }, scale: number) => ({
  x: LAYOUT.macro.cx + (p.x - LAYOUT.macro.cx) * scale,
  y: LAYOUT.macro.cy + (p.y - LAYOUT.macro.cy) * scale,
});

/** Flechas solo en la revelación final (vidrio, metal, plástico): cada una con la palabra que la nombra. */
const callouts = (frame: number): CalloutSpec[] => {
  const macro = macroAt(frame);
  const sc = macro.length ? macro[macro.length - 1].scale : 1;
  const glass = macroPoint({ x: MACRO_GEO.glassCenter.x, y: MACRO_GEO.glassCenter.y - 120 }, sc);
  const metal = macroPoint(MACRO_GEO.metal, sc);
  const plastic = macroPoint(MACRO_GEO.plastic, sc);
  return [
    { from: CUE.callVidrio[0], to: CUE.callVidrio[1], text: "vidrio", target: glass, label: { x: glass.x + 170, y: glass.y - 200 } },
    { from: CUE.callMetal[0], to: CUE.callMetal[1], text: "metal", target: metal, label: { x: metal.x + 60, y: metal.y + 210 } },
    { from: CUE.callPlastico[0], to: CUE.callPlastico[1], text: "plástico", target: plastic, label: { x: plastic.x - 60, y: plastic.y - 190 } },
  ];
};

export const MilAnosCelularV4: React.FC<Props> = ({ showSafeZones, showYear }) => {
  const frame = useCurrentFrame();
  const year = yearAt(frame);
  const p = { year, frame };
  const { exterior } = lightRegime(year);
  const hidden = worldHidden(frame);
  const macros = macroAt(frame);
  // contador y barra: visibles desde f0; se ocultan durante el recuerdo y vuelven para el loop
  const counterOp =
    frame < CUE.loopReturn
      ? interpolate(frame, [CUE.matchStart, CUE.matchStart + 12], [1, 0], CLAMP)
      : interpolate(frame, [CUE.loopReturn, CUE.loopReturn + CUE.loopReturnLen - 1], [0, 1], CLAMP);
  const echo = frame >= CUE.echoFrom && frame < CUE.echoTo ? 0.06 : 0;
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
        const isFinal = shot.id === "final";
        const mYear = shot.view === "fragment" ? 1000 : isFinal ? 0 : yearAt(frame);
        const scr = shot.view === "fragment" ? 0 : isFinal ? 1 : screenOn(frame);
        const xray = shot.id === "xray" ? interpolate(frame, [CUE.xrayStart, CUE.xrayStart + 12], [0, 1], CLAMP) : 0;
        return (
          <PhoneMacro
            key={shot.id}
            uid={`m-${shot.id}`}
            view={shot.view}
            year={mYear}
            frame={frame}
            screen={scr}
            xray={xray}
            decay={isFinal && frame < CUE.loopReturn ? { start: CUE.decayStart, end: CUE.decayEnd } : null}
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
        {callouts(frame).map((c) => (
          <Callout key={`${c.from}-${c.text}`} frame={frame} spec={c} />
        ))}
        <LastStandingCard frame={frame} from={CUE.card} len={CUE.cardLen} inLen={CUE.cardIn} winner={WINNER} />
        <SmallTag frame={frame} from={CUE.decayStart - 6} to={CUE.fadeBlack} text="representación" x={600} y={392} />
        <Subtitles frame={frame} voice={VOICE} />
        <Epilogue frame={frame} photoNo={PHOTO_NO} cta={CTA} />
      </AbsoluteFill>
      <AudioLayer voice={VOICE} />
      {showSafeZones ? <SafeZoneOverlay /> : null}
      {showYear ? <YearReadout frame={frame} year={year} /> : null}
    </AbsoluteFill>
  );
};
