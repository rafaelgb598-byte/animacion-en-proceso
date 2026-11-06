import { Composition, Still } from "remotion";
import { MyComposition } from "./Composition";
import { PoseSheet } from "./scenes/PoseSheet";
import { DecoyScene, DECOY_FRAMES } from "./scenes/decoy/DecoyScene";
import { DecoyV2, DECOY_V2_FRAMES } from "./scenes/decoy-v2/DecoyV2";
import { COMPARE_H, COMPARE_W, CompareV1V2 } from "./scenes/CompareV1V2";

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
      <Still id="ComparacionV1V2" component={CompareV1V2} width={COMPARE_W} height={Math.round(COMPARE_H)} />
    </>
  );
};
