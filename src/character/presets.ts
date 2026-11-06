import type { ArmPose, FacePose, LegPose, Pose } from "./rig";

/** Paleta del personaje "Tomi". Mantenerla fija garantiza consistencia entre escenas. */
export const COLORS = {
  line: "#1F1A24",
  skin: "#F6C8A2",
  skinShade: "#E6A882",
  cheek: "#F28B82",
  hair: "#3A2A22",
  shirt: "#2BB3A3",
  shirtShade: "#21907F",
  shirtDetail: "#F7F3E8",
  pants: "#2D3A64",
  pantsShade: "#232E52",
  shoe: "#E24E5A",
  shoeShade: "#B93C48",
  sole: "#FFF7EC",
  eyeWhite: "#FFFFFF",
  mouth: "#6B2232",
  tongue: "#EA6E6E",
};

/* ------------------------------------------------------------------ */
/* Expresiones faciales                                                */
/* ------------------------------------------------------------------ */

const base: FacePose = {
  lookX: 0,
  lookY: 0,
  eyeScale: 1,
  pupil: 1,
  lidL: 0.08,
  lidR: 0.08,
  lidAngle: 0,
  lowerLid: 0,
  browLiftL: 0,
  browLiftR: 0,
  browAngleL: 0,
  browAngleR: 0,
  smile: 0.25,
  mouthOpen: 0,
  mouthWidth: 1,
  mouthSkew: 0,
  blush: 0.35,
};

const face = (o: Partial<FacePose>): FacePose => ({ ...base, ...o });

export const FACES = {
  neutral: face({}),
  curious: face({ browLiftL: 0.3, browLiftR: 0.25, smile: 0.1, mouthWidth: 0.8, lidL: 0, lidR: 0 }),
  doubt: face({
    browLiftL: 0.45,
    browLiftR: -0.25,
    browAngleL: 6,
    browAngleR: -10,
    lidL: 0.15,
    lidR: 0.3,
    smile: -0.3,
    mouthWidth: 0.62,
    mouthSkew: 0.7,
    blush: 0.2,
  }),
  alert: face({
    browLiftL: 0.75,
    browLiftR: 0.75,
    eyeScale: 1.08,
    lidL: 0,
    lidR: 0,
    smile: 0,
    mouthOpen: 0.22,
    mouthWidth: 0.5,
  }),
  oh: face({
    browLiftL: 1,
    browLiftR: 1,
    browAngleL: 4,
    browAngleR: 4,
    eyeScale: 1.12,
    pupil: 0.9,
    lidL: 0,
    lidR: 0,
    smile: 0.25,
    mouthOpen: 0.45,
    mouthWidth: 0.62,
  }),
  interested: face({
    browLiftL: 0.6,
    browLiftR: 0.55,
    lidL: 0,
    lidR: 0,
    smile: 0.4,
    mouthOpen: 0.12,
    mouthWidth: 0.9,
  }),
  scrutiny: face({
    browLiftL: -0.2,
    browLiftR: 0.35,
    browAngleL: -12,
    browAngleR: -2,
    lidL: 0.32,
    lidR: 0.22,
    smile: -0.12,
    mouthWidth: 0.6,
    mouthSkew: -0.5,
    blush: 0.2,
  }),
  anticipation: face({
    browLiftL: -0.35,
    browLiftR: -0.35,
    browAngleL: -6,
    browAngleR: -6,
    lidL: 0.45,
    lidR: 0.45,
    smile: -0.1,
    mouthWidth: 0.55,
  }),
  surprise: face({
    browLiftL: 1.15,
    browLiftR: 1.15,
    browAngleL: 6,
    browAngleR: 6,
    eyeScale: 1.28,
    pupil: 0.72,
    lidL: 0,
    lidR: 0,
    smile: 0,
    mouthOpen: 0.95,
    mouthWidth: 0.6,
    blush: 0.5,
  }),
  joy: face({
    browLiftL: 0.7,
    browLiftR: 0.7,
    eyeScale: 1.05,
    lidL: 0,
    lidR: 0,
    lowerLid: 0.35,
    smile: 1,
    mouthOpen: 0.6,
    mouthWidth: 1.25,
    blush: 0.7,
  }),
  determined: face({
    browLiftL: -0.15,
    browLiftR: -0.05,
    browAngleL: -9,
    browAngleR: -9,
    lidL: 0.2,
    lidR: 0.2,
    smile: 0.5,
    mouthWidth: 1,
    mouthSkew: 0.3,
  }),
  ironic: face({
    browLiftL: -0.15,
    browLiftR: 0.75,
    browAngleL: -6,
    browAngleR: -2,
    lidL: 0.48,
    lidR: 0.42,
    lidAngle: -6,
    lowerLid: 0.12,
    smile: 0.6,
    mouthWidth: 0.95,
    mouthSkew: 0.95,
    blush: 0.55,
  }),
};

/* ------------------------------------------------------------------ */
/* Poses corporales base                                               */
/* ------------------------------------------------------------------ */

export const arm = (o: Partial<ArmPose> = {}): ArmPose => ({
  shoulder: 4,
  elbow: 12,
  wrist: 0,
  hand: "relaxed",
  ...o,
});
export const leg = (o: Partial<LegPose> = {}): LegPose => ({ hip: 0, knee: 4, foot: 0, ...o });

export const standing = (x: number, y: number, scale: number): Pose => ({
  x,
  y,
  scale,
  hop: 0,
  lean: 0,
  squash: 1,
  bodyTurn: 1,
  headTilt: 0,
  headTurn: 1,
  shrug: 0,
  armFront: arm(),
  armBack: arm({ shoulder: -2 }),
  legFront: leg({ hip: -3 }),
  legBack: leg({ hip: 4 }),
  face: FACES.neutral,
  blink: 1,
  hairLag: 0,
});

/* ------------------------------------------------------------------ */
/* V2: expresiones intermedias para una actuación más progresiva       */
/* ------------------------------------------------------------------ */

export const FACES_V2 = {
  /** caminando relajado, de buen humor */
  stroll: face({ browLiftL: 0.12, browLiftR: 0.1, smile: 0.35, lidL: 0.1, lidR: 0.1, blush: 0.35 }),
  /** algo le llamó la atención (doble toma) */
  notice: face({ browLiftL: 0.55, browLiftR: 0.45, eyeScale: 1.06, lidL: 0, lidR: 0, smile: 0.05, mouthOpen: 0.08, mouthWidth: 0.7 }),
  /** evaluando, todavía sin opinión */
  weigh: face({ browLiftL: 0.2, browLiftR: -0.05, browAngleL: 3, browAngleR: -5, lidL: 0.12, lidR: 0.18, smile: -0.05, mouthWidth: 0.75, mouthSkew: 0.3 }),
  /** "mmm…": boca fruncida de costado */
  hmm: face({
    browLiftL: 0.55, browLiftR: -0.3, browAngleL: 8, browAngleR: -12,
    lidL: 0.18, lidR: 0.36, smile: -0.35, mouthWidth: 0.5, mouthSkew: 0.9, blush: 0.2,
  }),
  /** pequeño sobresalto por el ruido */
  startle: face({ browLiftL: 0.9, browLiftR: 0.9, eyeScale: 1.16, pupil: 0.82, lidL: 0, lidR: 0, smile: -0.1, mouthOpen: 0.18, mouthWidth: 0.45 }),
  /** "¡ah, mirá!" */
  aha: face({ browLiftL: 0.95, browLiftR: 0.85, browAngleL: 3, browAngleR: 3, eyeScale: 1.1, lidL: 0, lidR: 0, smile: 0.5, mouthOpen: 0.42, mouthWidth: 0.85, blush: 0.45 }),
  /** comparando con atención: entrecierra un ojo */
  compare: face({
    browLiftL: -0.25, browLiftR: 0.4, browAngleL: -13, browAngleR: -1,
    lidL: 0.36, lidR: 0.18, smile: -0.08, mouthWidth: 0.55, mouthSkew: -0.55, blush: 0.2,
  }),
  /** el "clic": empieza a darse cuenta */
  realize: face({ browLiftL: 0.6, browLiftR: 0.7, eyeScale: 1.12, pupil: 1.1, lidL: 0, lidR: 0, smile: 0.1, mouthOpen: 0.12, mouthWidth: 0.6 }),
  /** entusiasmo después de la sorpresa */
  delighted: face({ browLiftL: 0.75, browLiftR: 0.75, lidL: 0, lidR: 0, lowerLid: 0.4, smile: 1, mouthOpen: 0.55, mouthWidth: 1.3, blush: 0.75 }),
  /** satisfecho con su elección */
  satisfied: face({ browLiftL: 0.25, browLiftR: 0.25, lidL: 0.3, lidR: 0.3, lowerLid: 0.25, smile: 0.75, mouthWidth: 1.05, mouthSkew: 0.2, blush: 0.55 }),
  /** de reojo hacia el señuelo: "…un momento" */
  suspicious: face({
    browLiftL: -0.3, browLiftR: 0.2, browAngleL: -10, browAngleR: -6,
    lidL: 0.42, lidR: 0.38, smile: 0.15, mouthWidth: 0.7, mouthSkew: -0.4, blush: 0.4,
  }),
};
