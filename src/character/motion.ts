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

/* ------------------------------------------------------------------ */
/* V2: ciclo de caminar con rodado de pie, arrastre de brazos y peso   */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
/** Campana periódica (distancia envuelta en el ciclo). */
const bell = (p: number, mu: number, w: number) => {
  let d = (((p - mu) % 1) + 1) % 1;
  if (d > 0.5) d -= 1;
  return Math.exp(-(d / w) * (d / w));
};

/**
 * `amp` (0..1) escala la zancada: al frenar, los pasos se acortan solos.
 * Contacto del pie delantero en p = 0.25, del trasero en p = 0.75.
 */
export const walkCycleV2 = (phase: number, amp: number) => {
  const legAt = (ph: number) => {
    const s = Math.sin(TAU * ph);
    const c = Math.cos(TAU * ph);
    return {
      hip: 27 * amp * s,
      knee:
        6 +
        60 * amp * Math.pow(Math.max(0, c), 1.3) + // balanceo
        13 * amp * bell(ph, 0.33, 0.07), // absorción del peso tras el contacto
      foot:
        -20 * amp * bell(ph, 0.25, 0.06) + // talón primero
        48 * amp * bell(ph, 0.84, 0.075) - // despegue con la punta
        9 * amp * bell(ph, 0.06, 0.07), // punta arriba durante el balanceo
    };
  };
  const armAt = (ph: number) => -24 * amp * Math.sin(TAU * ph);
  const arm = (ph: number) => {
    const sh = armAt(ph);
    const late = armAt(ph - 0.08);
    const later = armAt(ph - 0.14);
    return {
      shoulder: sh,
      elbow: 16 + 0.55 * Math.max(0, sh) + (late - sh) * 0.9,
      wristDrag: (later - sh) * 0.7,
    };
  };
  const bob = Math.cos(2 * TAU * phase);
  return {
    legFront: legAt(phase),
    legBack: legAt(phase + 0.5),
    armFront: arm(phase),
    armBack: arm(phase + 0.5),
    lean: 4.5 * amp + 1.6 * amp * Math.cos(2 * TAU * (phase - 0.1)),
    squash: 1 + 0.024 * amp * bob,
    bodyTurn: 0.07 * amp * Math.sin(TAU * phase),
    headTilt: -2.2 * amp * bob,
  };
};

export const withWalkV2 = (p: Pose, phase: number, amp: number, weight: number): Pose => {
  if (weight <= 0.0001) return p;
  const w = walkCycleV2(phase, amp);
  const k = weight;
  const L = (a: Pose["legFront"], b: { hip: number; knee: number; foot: number }) => ({
    hip: lerp(a.hip, b.hip, k),
    knee: lerp(a.knee, b.knee, k),
    foot: lerp(a.foot, b.foot, k),
  });
  return {
    ...p,
    lean: p.lean + w.lean * k,
    squash: p.squash * lerp(1, w.squash, k),
    bodyTurn: p.bodyTurn + w.bodyTurn * k,
    headTilt: p.headTilt + w.headTilt * k,
    legFront: L(p.legFront, w.legFront),
    legBack: L(p.legBack, w.legBack),
    armFront: {
      ...p.armFront,
      shoulder: lerp(p.armFront.shoulder, w.armFront.shoulder + p.armFront.shoulder, k),
      elbow: lerp(p.armFront.elbow, w.armFront.elbow, k),
      wristDrag: (p.armFront.wristDrag ?? 0) + w.armFront.wristDrag * k,
    },
    armBack: {
      ...p.armBack,
      shoulder: lerp(p.armBack.shoulder, w.armBack.shoulder + p.armBack.shoulder, k),
      elbow: lerp(p.armBack.elbow, w.armBack.elbow, k),
      wristDrag: (p.armBack.wristDrag ?? 0) + w.armBack.wristDrag * k,
    },
  };
};
