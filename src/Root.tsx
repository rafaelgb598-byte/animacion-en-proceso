import { Composition, Still } from "remotion";
import { MyComposition } from "./Composition";
import { PoseSheet } from "./scenes/PoseSheet";
import { DecoyScene, DECOY_FRAMES } from "./scenes/decoy/DecoyScene";

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
    </>
  );
};
