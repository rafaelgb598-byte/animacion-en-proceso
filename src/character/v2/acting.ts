import type { ArmPose, FacePose, LegPose, Pose } from "../rig";
import { arm, leg, standing } from "../presets";

/**
 * Actuación V2: expresiones y poses corporales para los estados nuevos.
 * Cada estado es una pose completa (cuerpo + cara) sobre la que la animación interpola.
 * Rostro V2: sonrisas más contenidas y a menudo asimétricas, rubor bajo.
 */

const base: FacePose = {
  lookX: 0,
  lookY: 0,
  eyeScale: 1,
  pupil: 1,
  lidL: 0.12,
  lidR: 0.12,
  lidAngle: 0,
  lowerLid: 0,
  browLiftL: 0,
  browLiftR: 0,
  browAngleL: 0,
  browAngleR: 0,
  smile: 0.18,
  mouthOpen: 0,
  mouthWidth: 0.9,
  mouthSkew: 0.15,
  blush: 0.25,
};
const face = (o: Partial<FacePose>): FacePose => ({ ...base, ...o });

export const FACE = {
  neutral: face({}),
  /** sonrisa irónica e inteligente: una comisura arriba, una ceja arriba, párpados relajados */
  ironico: face({
    browLiftL: -0.1, browLiftR: 0.7, browAngleL: -4, browAngleR: -4,
    lidL: 0.4, lidR: 0.32, lidAngle: -4, lowerLid: 0.1,
    smile: 0.55, mouthWidth: 0.85, mouthSkew: 1, blush: 0.3,
  }),
  pensando: face({
    browLiftL: 0.55, browLiftR: -0.15, browAngleL: 6, browAngleR: -8,
    lidL: 0.14, lidR: 0.28, smile: -0.2, mouthWidth: 0.55, mouthSkew: 0.8,
  }),
  duda: face({
    browLiftL: 0.6, browLiftR: 0.45, browAngleL: 12, browAngleR: 10,
    lidL: 0.1, lidR: 0.12, smile: -0.35, mouthWidth: 0.7, mouthSkew: -0.4, mouthOpen: 0.05,
  }),
  firme: face({
    browLiftL: -0.3, browLiftR: -0.2, browAngleL: -12, browAngleR: -12,
    lidL: 0.3, lidR: 0.3, smile: 0.5, mouthWidth: 0.95, mouthSkew: 0.5, blush: 0.3,
  }),
  sorpresa: face({
    browLiftL: 1.2, browLiftR: 1.2, browAngleL: 6, browAngleR: 6,
    eyeScale: 1.24, pupil: 0.7, lidL: 0, lidR: 0,
    smile: -0.05, mouthOpen: 0.85, mouthWidth: 0.6, mouthSkew: 0, blush: 0.4,
  }),
  sospecha: face({
    browLiftL: -0.45, browLiftR: 0.55, browAngleL: -14, browAngleR: -6,
    lidL: 0.55, lidR: 0.42, lidAngle: -5, smile: 0.12, mouthWidth: 0.6, mouthSkew: -0.8,
  }),
  incredulidad: face({
    browLiftL: 0.95, browLiftR: -0.35, browAngleL: 4, browAngleR: -14,
    eyeScale: 1.08, lidL: 0, lidR: 0.4, smile: -0.25, mouthOpen: 0.3, mouthWidth: 0.55, mouthSkew: 0.6,
  }),
  eureka: face({
    browLiftL: 1, browLiftR: 0.9, browAngleL: 2, browAngleR: 2,
    eyeScale: 1.1, pupil: 1.1, lidL: 0, lidR: 0,
    smile: 0.75, mouthOpen: 0.45, mouthWidth: 0.95, mouthSkew: 0.35, blush: 0.4,
  }),
  celebracion: face({
    browLiftL: 0.8, browLiftR: 0.8, lidL: 0, lidR: 0, lowerLid: 0.55,
    smile: 1, mouthOpen: 0.6, mouthWidth: 1.2, mouthSkew: 0.2, blush: 0.55,
  }),
};

export type ActState = keyof typeof FACE;

/** Pose corporal por estado (relativa al personaje: espacio "hip" / "chin"). */
type ArmV2 = ArmPose & { aimUp?: number };
type Body = {
  lean: number;
  headTilt: number;
  headTurn: number;
  bodyTurn: number;
  shrug: number;
  squash: number;
  hop: number;
  armFront: ArmV2;
  armBack: ArmV2;
  legFront: LegPose;
  legBack: LegPose;
  look: [number, number];
};

const arm2 = (o: Partial<ArmV2>): ArmV2 => ({ ...arm(), ...o });
const B = (o: Partial<Body>): Body => ({
  lean: 0,
  headTilt: 2,
  headTurn: 0.85,
  bodyTurn: 1,
  shrug: 0.05,
  squash: 1,
  hop: 0,
  armFront: arm({ shoulder: 4, elbow: 14 }),
  armBack: arm({ shoulder: -4, elbow: 14 }),
  legFront: leg({ hip: -4 }),
  legBack: leg({ hip: 5 }),
  look: [0.4, 0.1],
  ...o,
});

export const BODY: Record<ActState, Body> = {
  neutral: B({}),
  ironico: B({
    lean: -2, headTilt: -6, headTurn: 0.75,
    // mano en la cadera: actitud segura
    armBack: arm2({ hand: "fist", ik: { x: 50, y: -46, space: "hip", weight: 1, bend: -1 } }),
    legFront: leg({ hip: -8, knee: 2 }), legBack: leg({ hip: 9, knee: 10 }),
    look: [-0.35, 0.05],
  }),
  pensando: B({
    lean: -2, headTilt: -9, headTurn: 0.55, shrug: 0.2,
    armFront: arm2({ hand: "chin", ik: { x: -2, y: 14, space: "chin", weight: 1, bend: 1 } }),
    armBack: arm2({ hand: "fist", ik: { x: 52, y: -44, space: "hip", weight: 1, bend: -1 } }),
    look: [-0.5, -0.8],
  }),
  duda: B({
    lean: -1, headTilt: 10, headTurn: 0.6, shrug: 0.75,
    armFront: arm2({ hand: "open", aimUp: -1, ik: { x: -86, y: -74, space: "hip", weight: 1, bend: -1 } }),
    armBack: arm2({ hand: "open", aimUp: 1, ik: { x: 104, y: -80, space: "hip", weight: 1, bend: 1 } }),
    look: [0.7, 0.15],
  }),
  firme: B({
    lean: 5, headTilt: 5, headTurn: 0.9, squash: 1.02,
    armFront: arm2({ hand: "fist", ik: { x: 46, y: -112, space: "hip", weight: 1, bend: 1 } }),
    armBack: arm({ shoulder: -10, elbow: 30, hand: "fist" }),
    legFront: leg({ hip: 6, knee: 4 }), legBack: leg({ hip: -8, knee: 4 }),
    look: [0.7, 0.25],
  }),
  sorpresa: B({
    lean: -9, headTilt: -10, headTurn: 0.9, shrug: 0.9, squash: 1.05, hop: 10,
    armFront: arm2({ hand: "open", aimUp: -1, ik: { x: -96, y: -176, space: "hip", weight: 1, bend: -1 } }),
    armBack: arm2({ hand: "open", aimUp: 1, ik: { x: 118, y: -170, space: "hip", weight: 1, bend: 1 } }),
    legFront: leg({ hip: -12, knee: 6 }), legBack: leg({ hip: 14, knee: 12, foot: 8 }),
    look: [0.9, 0.2],
  }),
  sospecha: B({
    lean: -4, headTilt: 7, headTurn: 0.95,
    armFront: arm2({ hand: "fist", ik: { x: -46, y: -40, space: "hip", weight: 1, bend: 1 } }),
    armBack: arm2({ hand: "fist", ik: { x: 52, y: -44, space: "hip", weight: 1, bend: -1 } }),
    legFront: leg({ hip: -10, knee: 2 }), legBack: leg({ hip: 10, knee: 4 }),
    look: [-0.85, 0.1],
  }),
  incredulidad: B({
    lean: 9, headTilt: 12, headTurn: 1,
    armFront: arm2({ hand: "open", wrist: 50, ik: { x: 112, y: -96, space: "hip", weight: 1, bend: 1 } }),
    armBack: arm({ shoulder: -6, elbow: 20 }),
    legFront: leg({ hip: 8, knee: 8 }), legBack: leg({ hip: -6, knee: 4 }),
    look: [0.95, 0.3],
  }),
  eureka: B({
    lean: -3, headTilt: -4, headTurn: 0.9, squash: 1.03,
    armFront: arm2({ hand: "point", aimUp: 0.3, ik: { x: 84, y: -238, space: "hip", weight: 1, bend: 1 } }),
    armBack: arm2({ hand: "fist", ik: { x: 52, y: -44, space: "hip", weight: 1, bend: -1 } }),
    look: [0.2, -0.55],
  }),
  celebracion: B({
    lean: -4, headTilt: -8, headTurn: 0.8, squash: 1.06, hop: 22, shrug: 0.4,
    armFront: arm2({ hand: "fist", aimUp: -0.4, ik: { x: -78, y: -284, space: "hip", weight: 1, bend: -1 } }),
    armBack: arm2({ hand: "fist", aimUp: 0.4, ik: { x: 112, y: -276, space: "hip", weight: 1, bend: 1 } }),
    legFront: leg({ hip: -14, knee: 30, foot: 10 }), legBack: leg({ hip: 12, knee: 40, foot: 14 }),
    look: [0, -0.2],
  }),
};

/** convierte aimUp en un objetivo de orientación lejano (la mano apunta hacia arriba) */
export const resolveArm = (a: ArmV2, x: number, y: number, scale: number): ArmPose => {
  const { aimUp, ...rest } = a;
  if (aimUp === undefined) return rest;
  return { ...rest, aim: { x: x + aimUp * 4000 * scale, y: y - 8000 * scale, weight: 1 } };
};

/** Pose estática completa de un estado (para hojas de diseño y como clave de animación). */
export const statePose = (s: ActState, x: number, y: number, scale: number, extra: Partial<Pose> = {}): Pose => {
  const b = BODY[s];
  const p = standing(x, y, scale);
  return {
    ...p,
    lean: b.lean,
    headTilt: b.headTilt,
    headTurn: b.headTurn,
    bodyTurn: b.bodyTurn,
    shrug: b.shrug,
    squash: b.squash,
    hop: b.hop,
    armFront: resolveArm(b.armFront, x, y, scale),
    armBack: resolveArm(b.armBack, x, y, scale),
    legFront: b.legFront,
    legBack: b.legBack,
    face: { ...FACE[s], lookX: b.look[0], lookY: b.look[1] },
    ...extra,
  };
};
