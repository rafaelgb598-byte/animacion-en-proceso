import { lerp } from "./anim";
import { walkCycle, type Pose } from "./rig";

/** Mezcla el ciclo de caminar sobre una pose base (weight 0..1). */
export const withWalk = (p: Pose, phase: number, weight: number): Pose => {
  if (weight <= 0.0001) return p;
  const w = walkCycle(phase);
  const k = weight;
  return {
    ...p,
    lean: p.lean + w.lean * k,
    squash: lerp(p.squash, w.squash, k),
    headTilt: p.headTilt + w.headTilt * k,
    legFront: {
      hip: lerp(p.legFront.hip, w.legFront.hip, k),
      knee: lerp(p.legFront.knee, w.legFront.knee, k),
      foot: lerp(p.legFront.foot, w.legFront.foot, k),
    },
    legBack: {
      hip: lerp(p.legBack.hip, w.legBack.hip, k),
      knee: lerp(p.legBack.knee, w.legBack.knee, k),
      foot: lerp(p.legBack.foot, w.legBack.foot, k),
    },
    armFront: {
      ...p.armFront,
      shoulder: p.armFront.shoulder + w.armFront.shoulder * k,
      elbow: lerp(p.armFront.elbow, w.armFront.elbow, k),
    },
    armBack: {
      ...p.armBack,
      shoulder: p.armBack.shoulder + w.armBack.shoulder * k,
      elbow: lerp(p.armBack.elbow, w.armBack.elbow, k),
    },
  };
};
