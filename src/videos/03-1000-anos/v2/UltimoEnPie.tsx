// Plantilla «Último en pie»: Backdrop → Camera(Room + Props) → Atmosphere → UI → AudioLayer.
// No sabe qué objetos hay: recibe la lista de piezas de escena desde episodes/*.ts.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { AudioLayer } from "./componentes/audio/AudioLayer";
import { Camera, cameraAt } from "./componentes/camera/Camera";
import { SafeZoneOverlay } from "./componentes/debug/SafeZoneOverlay";
import { YearReadout } from "./componentes/debug/YearReadout";
import { Atmosphere } from "./componentes/fx/Atmosphere";
import { Light } from "./componentes/fx/Light";
import { Rain } from "./componentes/fx/Rain";
import { TimeFlicker } from "./componentes/fx/TimeFlicker";
import { Backdrop } from "./componentes/scene/Backdrop";
import { DecayLabels } from "./componentes/ui/DecayLabel";
import { HookText } from "./componentes/ui/HookText";
import { LastStandingCard } from "./componentes/ui/LastStandingCard";
import { OdometerCounter } from "./componentes/ui/OdometerCounter";
import { TimeBar } from "./componentes/ui/TimeBar";
import { Subtitles } from "./componentes/ui/Subtitles";
import { CELULAR } from "./episodes/celular";
import { lightRegime } from "./decay";
import { CLAMP } from "./lib/anim";
import { CUE, LOOP_CUT, yearAt } from "./timeline";
import type { Episode, SceneLayer } from "./types";

export const milAnosV2Schema = z.object({
  showSafeZones: z.boolean(),
  showYear: z.boolean(),
});

export type UltimoEnPieProps = z.infer<typeof milAnosV2Schema>;

export const UltimoEnPie: React.FC<UltimoEnPieProps & { episode: Episode }> = ({ episode, showSafeZones, showYear }) => {
  const frame = useCurrentFrame();
  const year = yearAt(frame);
  const p = { year, frame };
  const layer = (l: SceneLayer) =>
    episode.scene.filter((s) => s.layer === l).map((s) => <React.Fragment key={s.id}>{s.render(p)}</React.Fragment>);
  const cam = cameraAt(frame, episode.zoomTarget, episode.zoomScreen);
  const { exterior } = lightRegime(year);
  const barOpacity = frame >= LOOP_CUT ? 1 : interpolate(frame, [CUE.card, CUE.card + CUE.cardIn], [1, 0], CLAMP);
  return (
    <AbsoluteFill>
      <Backdrop />
      <TimeFlicker frame={frame}>
        <Camera frame={frame} zoomTarget={episode.zoomTarget} zoomScreen={episode.zoomScreen} sky={<AbsoluteFill>{layer("sky")}</AbsoluteFill>} wall={<AbsoluteFill>{layer("wall")}</AbsoluteFill>}>
          {layer("main")}
          {layer("front")}
          <Light year={year} frame={frame} rig={episode.light} />
          <Rain year={year} frame={frame} />
        </Camera>
      </TimeFlicker>
      <Atmosphere frame={frame} darken={0.4 * cam.zoom} focus={episode.zoomScreen} vignette={1 - 0.45 * exterior} />
      <AbsoluteFill>
        <OdometerCounter frame={frame} year={year} />
        <TimeBar year={year} opacity={barOpacity} />
        <HookText frame={frame} lines={episode.hook} />
        <DecayLabels frame={frame} texts={episode.labels} />
        <LastStandingCard frame={frame} winner={episode.winner} />
        <Subtitles frame={frame} voice={episode.voice ?? []} />
      </AbsoluteFill>
      <AudioLayer voice={episode.voice} />
      {showSafeZones ? <SafeZoneOverlay /> : null}
      {showYear ? <YearReadout frame={frame} year={year} /> : null}
    </AbsoluteFill>
  );
};

export const MilAnosCelularV2: React.FC<UltimoEnPieProps> = (props) => <UltimoEnPie {...props} episode={CELULAR} />;
