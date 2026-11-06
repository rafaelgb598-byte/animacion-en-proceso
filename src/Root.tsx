import { Composition, Folder, Still } from "remotion";
import { MyComposition } from "./Composition";
import { PoseSheet } from "./scenes/PoseSheet";
import { DecoyScene, DECOY_FRAMES } from "./scenes/decoy/DecoyScene";
import { DecoyV2, DECOY_V2_FRAMES } from "./scenes/decoy-v2/DecoyV2";
import { DecoyV3, DECOY_V3_FRAMES } from "./scenes/decoy-v3/DecoyV3";
import { COMPARE_H, COMPARE_W, CompareV1V2 } from "./scenes/CompareV1V2";
import { COMPARE23_H, COMPARE23_W, CompareV2V3 } from "./scenes/CompareV2V3";
import { FrameGrid, gridDefaults, gridMetadata } from "./scenes/inspect/FrameGrid";
import { DiagFinal, DiagV2, DiagV3 } from "./scenes/inspect/DiagStills";
import { EfectoSenueloFinal, FINAL_FRAMES } from "./short-final/EfectoSenueloFinal";
import { PropuestaPersonaje, SHEET_H, SHEET_W } from "./proposal-v2/PropuestaPersonaje";
import { ACT_H, ACT_W, HojaActuacion } from "./proposal-v2/HojaActuacion";
import { PruebaAnimacionV2 } from "./proposal-v2/clip/PruebaAnimacionV2";
import { CLIP_FRAMES } from "./proposal-v2/clip/timeline";
import { QA_H, QA_W, QASubtitulos } from "./proposal-v2/clip/QA";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Still id="PosesPersonaje" component={PoseSheet} width={1920} height={1080} />
      <Composition
        id="EfectoSenuelo"
        component={DecoyScene}
        durationInFrames={DECOY_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EfectoSenueloV2"
        component={DecoyV2}
        durationInFrames={DECOY_V2_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EfectoSenueloPersonajeV3"
        component={DecoyV3}
        durationInFrames={DECOY_V3_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EfectoSenueloFinal"
        component={EfectoSenueloFinal}
        durationInFrames={FINAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Still id="ComparacionV1V2" component={CompareV1V2} width={COMPARE_W} height={Math.round(COMPARE_H)} />
      <Still id="ComparacionV2V3" component={CompareV2V3} width={COMPARE23_W} height={Math.round(COMPARE23_H)} />
      <Folder name="Propuesta-V2">
        <Still id="PropuestaPersonajeV2" component={PropuestaPersonaje} width={SHEET_W} height={SHEET_H} />
        <Still id="ActuacionV2" component={HojaActuacion} width={ACT_W} height={ACT_H} />
        <Composition
          id="PruebaAnimacionV2"
          component={PruebaAnimacionV2}
          durationInFrames={CLIP_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ debug: false }}
        />
        <Still id="QASubtitulosV2" component={QASubtitulos} width={QA_W} height={QA_H} />
      </Folder>
      <Folder name="Revision">
        <Still
          id="InspeccionFotogramas"
          component={FrameGrid}
          defaultProps={gridDefaults}
          calculateMetadata={gridMetadata}
          width={1080}
          height={1920}
        />
        <Still id="DiagnosticoV2" component={DiagV2} width={1400} height={900} />
        <Still id="DiagnosticoV3" component={DiagV3} width={1400} height={900} />
        <Still id="DiagnosticoFinal" component={DiagFinal} width={1400} height={900} />
      </Folder>
    </>
  );
};
