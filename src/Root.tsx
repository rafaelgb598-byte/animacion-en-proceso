import { Composition, Folder, Still } from "remotion";
import { MyComposition } from "./Composition";
import { PoseSheet } from "./laboratorio/revision/PoseSheet";
import { DecoyScene, DECOY_FRAMES } from "./videos/01-efecto-senuelo/historial/v1/DecoyScene";
import { DecoyV2, DECOY_V2_FRAMES } from "./videos/01-efecto-senuelo/historial/v2/DecoyV2";
import { DecoyV3, DECOY_V3_FRAMES } from "./videos/01-efecto-senuelo/historial/v3/DecoyV3";
import { COMPARE_H, COMPARE_W, CompareV1V2 } from "./laboratorio/revision/CompareV1V2";
import { COMPARE23_H, COMPARE23_W, CompareV2V3 } from "./laboratorio/revision/CompareV2V3";
import { FrameGrid, gridDefaults, gridMetadata } from "./laboratorio/revision/FrameGrid";
import { DiagFinal, DiagV2, DiagV3 } from "./laboratorio/revision/DiagStills";
import { EfectoSenueloFinal, FINAL_FRAMES } from "./videos/01-efecto-senuelo/short-final/EfectoSenueloFinal";
import { PropuestaPersonaje, SHEET_H, SHEET_W } from "./laboratorio/propuesta-tomi-v2/PropuestaPersonaje";
import { ACT_H, ACT_W, HojaActuacion } from "./laboratorio/propuesta-tomi-v2/HojaActuacion";
import { PruebaAnimacionV2 } from "./laboratorio/propuesta-tomi-v2/clip/PruebaAnimacionV2";
import { CLIP_FRAMES } from "./laboratorio/propuesta-tomi-v2/clip/timeline";
import { QA_H, QA_W, QASubtitulos } from "./laboratorio/propuesta-tomi-v2/clip/QA";
import { EfectoSenueloTomiV2, TOMI_V2_FRAMES, tomiV2Schema } from "./videos/01-efecto-senuelo/final/EfectoSenueloTomiV2";
import { QA2_H, QA2_W, QATomiV2 } from "./videos/01-efecto-senuelo/final/QA";
import { STROOP_FRAMES, StroopShort, stroopSchema } from "./videos/02-stroop/v1/StroopShort";
import { QAS_H, QAS_W, QAStroop } from "./videos/02-stroop/v1/QAStroop";
import { GIRODATO_STROOP_V2_FRAMES, GiroDatoStroopV2, giroDatoStroopV2Schema } from "./videos/02-stroop/final/GiroDatoStroopV2";
import { QAV2_H, QAV2_W, QAStroopV2 } from "./videos/02-stroop/final/QAStroopV2";
import { MilAnosCelularV2, milAnosV2Schema } from "./videos/03-1000-anos/v2/UltimoEnPie";
import { DURATION as MIL_V2_DURATION, FPS as MIL_V2_FPS } from "./videos/03-1000-anos/v2/timeline";
import { ContactSheet as MilAnosV2Sheet, UEP_SHEET_H, UEP_SHEET_W } from "./videos/03-1000-anos/v2/componentes/debug/ContactSheet";
import { MilAnosCelularV3, milAnosV3Schema } from "./videos/03-1000-anos/final/MilAnosCelularV3";
import { DURATION as MIL_V3_DURATION, FPS as MIL_V3_FPS } from "./videos/03-1000-anos/final/timeline";
import { ComparaFuentes } from "./laboratorio/subtitulos/ComparaFuentes";
import { ContactSheetV3 as MilAnosV3Sheet, contactSheetSchema as milAnosSheetSchema, sheetSize as milAnosSheetSize } from "./videos/03-1000-anos/final/componentes/debug/ContactSheetV3";

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
      <Composition
        id="EfectoSenueloTomiV2"
        component={EfectoSenueloTomiV2}
        durationInFrames={TOMI_V2_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={tomiV2Schema}
        defaultProps={{ debug: false, capa: "todo" as const }}
      />
      <Still id="QATomiV2" component={QATomiV2} width={QA2_W} height={QA2_H} />
      <Composition
        id="StroopShort"
        component={StroopShort}
        durationInFrames={STROOP_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={stroopSchema}
        defaultProps={{ showSafeZones: false, hasVoiceover: true }}
      />
      <Still id="QAStroop" component={QAStroop} width={QAS_W} height={QAS_H} />
      <Composition
        id="GiroDatoStroopV2"
        component={GiroDatoStroopV2}
        durationInFrames={GIRODATO_STROOP_V2_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={giroDatoStroopV2Schema}
        defaultProps={{ showSafeZones: false, hasVoiceover: true, capa: "todo" as const }}
      />
      <Still id="QAStroopV2" component={QAStroopV2} width={QAV2_W} height={QAV2_H} />
      <Folder name="1000-anos">
        <Composition
          id="MilAnosCelularV3"
          component={MilAnosCelularV3}
          schema={milAnosV3Schema}
          durationInFrames={MIL_V3_DURATION}
          fps={MIL_V3_FPS}
          width={1080}
          height={1920}
          defaultProps={{ showSafeZones: false, showYear: false }}
        />
        <Composition
          id="MilAnosCelularV2"
          component={MilAnosCelularV2}
          schema={milAnosV2Schema}
          durationInFrames={MIL_V2_DURATION}
          fps={MIL_V2_FPS}
          width={1080}
          height={1920}
          defaultProps={{ showSafeZones: false, showYear: false }}
        />
        <Still
          id="MilAnosV3HojaContactos"
          component={MilAnosV3Sheet}
          schema={milAnosSheetSchema}
          defaultProps={{ frames: [0], prefix: "MilAnosCelularV3" }}
          calculateMetadata={({ props }) => milAnosSheetSize(props.frames.length)}
          width={2584}
          height={690}
        />
        <Still id="MilAnosV2HojaContactos" component={MilAnosV2Sheet} width={UEP_SHEET_W} height={UEP_SHEET_H} />
      </Folder>
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
      <Folder name="Subtitulos">
        <Composition id="ComparaFuentes" component={ComparaFuentes} durationInFrames={TOMI_V2_FRAMES} fps={30} width={3240} height={1920} />
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
