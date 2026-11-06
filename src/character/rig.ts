import { lerp } from "./anim";

/**
 * Esqueleto del personaje: tipos de pose, cinemática directa (FK),
 * cinemática inversa de 2 huesos (IK) y ciclo de caminar procedural.
 *
 * Convenciones (espacio local, mirando a la derecha, cadera en el origen):
 *  - y crece hacia abajo (como SVG).
 *  - Ángulos de extremidades en grados, 0 = colgando hacia abajo,
 *    positivo = hacia adelante (+x).
 *  - `lean` y `headTilt` usan el sentido de rotación de SVG
 *    (positivo = el torso / la cabeza se inclinan hacia adelante).
 */

export const DIM = {
  thigh: 92,
  shin: 88,
  upperArm: 76,
  foreArm: 70,
  neckY: -150,
  shoulderY: -124,
  headCenter: -86, // desde el cuello
  headRx: 88,
  headRy: 84,
  sole: 25, // del tobillo al piso
  palm: 14,
};

export type Vec = { x: number; y: number };

export type HandShape = "relaxed" | "open" | "fist" | "point" | "chin" | "hold" | "reach" | "none";

export type IKTarget = {
  x: number;
  y: number;
  /** scene = coordenadas de la escena · chin = relativo al mentón · hip = relativo a la cadera */
  space: "scene" | "chin" | "hip";
  weight: number;
  bend?: 1 | -1;
};

export type ArmPose = {
  shoulder: number;
  elbow: number;
  wrist: number;
  hand: HandShape;
  ik?: IKTarget;
  /** V2: orienta la mano (p. ej. el índice) hacia un punto de la escena. */
  aim?: { x: number; y: number; weight: number };
  /** V2: arrastre de la muñeca agregado después de la IK (follow-through). */
  wristDrag?: number;
  /** V3: forma de mano siguiente y mezcla 0..1 (transición suave entre gestos). */
  handNext?: HandShape;
  handMix?: number;
};

export type LegPose = {
  hip: number;
  knee: number;
  foot: number;
  /** V3: tobillo plantado en coordenadas de escena (IK de pierna: el pie no patina). */
  ik?: { x: number; y: number };
};

export type FacePose = {
  lookX: number; // -1..1
  lookY: number; // -1..1
  eyeScale: number; // 1 normal, >1 sorpresa
  pupil: number; // tamaño de pupila
  lidL: number; // párpado superior 0..1
  lidR: number;
  lidAngle: number; // inclinación del párpado (picardía / enojo)
  lowerLid: number; // ojos "felices" (mejillas que suben)
  browLiftL: number; // -1..1
  browLiftR: number;
  browAngleL: number; // grados, positivo = extremo interno arriba (preocupación)
  browAngleR: number;
  smile: number; // -1..1
  mouthOpen: number; // 0..1
  mouthWidth: number; // ~0.5..1.4
  mouthSkew: number; // -1..1 (sonrisa de costado)
  blush: number;
};

export type Pose = {
  x: number; // posición en escena (bajo la cadera)
  y: number; // nivel del piso en la escena
  scale: number;
  flip?: boolean;
  hop: number; // despegue del piso (unidades locales)
  /** V3: altura de la cadera sobre el piso (unidades locales). Si existe, reemplaza el apoyo automático. */
  hipHeight?: number;
  lean: number;
  squash: number; // 1 neutro, <1 aplastado, >1 estirado
  bodyTurn: number; // 0 de frente, 1 tres cuartos
  headTilt: number;
  headTurn: number; // -1..1
  shrug: number;
  armFront: ArmPose;
  armBack: ArmPose;
  legFront: LegPose;
  legBack: LegPose;
  face: FacePose;
  blink: number;
  hairLag: number; // ángulo del mechón (movimiento secundario)
};

export type ArmRig = { sh: Vec; el: Vec; wr: Vec; palm: Vec; handAng: number };
export type LegRig = { hip: Vec; knee: Vec; ankle: Vec };

export type Rig = {
  ground: number;
  sx: number;
  sy: number;
  neck: Vec;
  headAngle: number;
  headCenter: Vec;
  chin: Vec;
  front: ArmRig;
  back: ArmRig;
  legF: LegRig;
  legB: LegRig;
};

const R = Math.PI / 180;
export const dir = (deg: number): Vec => ({ x: Math.sin(deg * R), y: Math.cos(deg * R) });
export const add = (a: Vec, b: Vec, k = 1): Vec => ({ x: a.x + b.x * k, y: a.y + b.y * k });
/** Rotación con el sentido de SVG. */
export const rotP = (p: Vec, deg: number): Vec => {
  const a = deg * R;
  return {
    x: p.x * Math.cos(a) - p.y * Math.sin(a),
    y: p.x * Math.sin(a) + p.y * Math.cos(a),
  };
};

const angDiff = (a: number, b: number) => {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

/** IK analítica de dos huesos. Devuelve ángulos absolutos (convención de extremidades). */
export const solveIK = (S: Vec, T: Vec, L1: number, L2: number, bend: number) => {
  const dx = T.x - S.x;
  const dy = T.y - S.y;
  const raw = Math.hypot(dx, dy);
  const d = Math.min(Math.max(raw, Math.abs(L1 - L2) + 0.5), L1 + L2 - 0.5);
  const phi = Math.atan2(dx, dy);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const tu = phi - bend * a;
  const E = add(S, dir(tu / R), L1);
  const tf = Math.atan2(T.x - E.x, T.y - E.y);
  return { tu: tu / R, tf: tf / R };
};

/** Convierte un punto de la escena al espacio local del personaje (ya apoyado en el piso). */
export const sceneToLocal = (p: Pose, v: Vec): Vec => {
  const fs = p.flip ? -1 : 1;
  return { x: (v.x - p.x) / (p.scale * fs), y: (v.y - p.y) / p.scale };
};
export const localToScene = (p: Pose, v: Vec): Vec => {
  const fs = p.flip ? -1 : 1;
  return { x: p.x + v.x * p.scale * fs, y: p.y + v.y * p.scale };
};

export const computeRig = (p: Pose): Rig => {
  const t = p.bodyTurn;

  // --- Piernas (antes de apoyar en el piso)
  const leg = (h: Vec, lp: LegPose): LegRig => {
    const knee = add(h, dir(lp.hip), DIM.thigh);
    const ankle = add(knee, dir(lp.hip - lp.knee), DIM.shin);
    return { hip: h, knee, ankle };
  };
  const lf0 = leg({ x: lerp(-24, -10, t), y: 0 }, p.legFront);
  const lb0 = leg({ x: lerp(24, 14, t), y: 0 }, p.legBack);

  // El pie más bajo toca el piso: agacharse baja el cuerpo automáticamente
  // y al caminar el rebote vertical aparece solo.
  // V3: con hipHeight la altura de la cadera es explícita y los pies se resuelven con IK.
  const ground =
    p.hipHeight !== undefined ? -p.hipHeight - p.hop : -(Math.max(lf0.ankle.y, lb0.ankle.y) + DIM.sole) - p.hop;
  const G = (v: Vec): Vec => ({ x: v.x, y: v.y + ground });
  const legIK = (l0: LegRig, lp: LegPose): LegRig => {
    const hip = G(l0.hip);
    if (!lp.ik) return { hip, knee: G(l0.knee), ankle: G(l0.ankle) };
    const target = sceneToLocal(p, lp.ik);
    const sol = solveIK(hip, target, DIM.thigh, DIM.shin, -1);
    const knee = add(hip, dir(sol.tu), DIM.thigh);
    const ankle = add(knee, dir(sol.tf), DIM.shin);
    return { hip, knee, ankle };
  };
  const legF = legIK(lf0, p.legFront);
  const legB = legIK(lb0, p.legBack);

  // --- Torso con squash & stretch que conserva el volumen
  const sy = p.squash;
  const sx = 1 / Math.sqrt(p.squash);
  const T = (lx: number, ly: number) => G(rotP({ x: lx * sx, y: ly * sy }, p.lean));

  const neck = T(0, DIM.neckY);
  const shrugY = -p.shrug * 12;
  const shF = T(lerp(-40, -22, t), DIM.shoulderY + shrugY);
  const shB = T(lerp(40, 24, t), DIM.shoulderY + shrugY);

  const headAngle = p.lean + p.headTilt;
  const headCenter = add(neck, rotP({ x: 0, y: DIM.headCenter }, headAngle));
  const chin = add(headCenter, rotP({ x: p.headTurn * 26, y: 72 }, headAngle));

  const arm = (sh: Vec, ap: ArmPose): ArmRig => {
    let tu = ap.shoulder - p.lean;
    let te = tu + ap.elbow;
    const ik = ap.ik;
    if (ik && ik.weight > 0.0001) {
      let target: Vec;
      if (ik.space === "scene") target = sceneToLocal(p, ik);
      else if (ik.space === "chin") target = add(chin, rotP({ x: ik.x, y: ik.y }, headAngle));
      else target = T(ik.x, ik.y);
      const sol = solveIK(sh, target, DIM.upperArm, DIM.foreArm, ik.bend ?? 1);
      tu = tu + angDiff(tu, sol.tu) * ik.weight;
      te = te + angDiff(te, sol.tf) * ik.weight;
    }
    const el = add(sh, dir(tu), DIM.upperArm);
    const wr = add(el, dir(te), DIM.foreArm);
    let handAng = te + ap.wrist + (ap.wristDrag ?? 0);
    if (ap.aim && ap.aim.weight > 0.0001) {
      const a = sceneToLocal(p, ap.aim);
      const want = (Math.atan2(a.x - wr.x, a.y - wr.y) / R);
      handAng = handAng + angDiff(handAng, want) * ap.aim.weight;
    }
    const palm = add(wr, dir(handAng), DIM.palm);
    return { sh, el, wr, palm, handAng };
  };

  return {
    ground,
    sx,
    sy,
    neck,
    headAngle,
    headCenter,
    chin,
    front: arm(shF, p.armFront),
    back: arm(shB, p.armBack),
    legF,
    legB,
  };
};

/**
 * Ciclo de caminar procedural.
 * `phase` avanza 1 por cada ciclo completo (dos pasos). Si se calcula a partir de
 * la distancia recorrida, los pies no patinan aunque el personaje acelere o frene.
 */
export const STRIDE = 300; // unidades locales recorridas por ciclo

export const walkCycle = (phase: number) => {
  const legAt = (ph: number): LegPose => {
    const s = Math.sin(2 * Math.PI * ph);
    const c = Math.cos(2 * Math.PI * ph);
    return {
      hip: 25 * s,
      // la rodilla se dobla en la fase de balanceo (pierna yendo hacia adelante)
      knee: 6 + 55 * Math.pow(Math.max(0, c), 1.4),
      // talón al apoyar (punta arriba), despegue con la punta
      foot: 38 * Math.max(0, -s) * Math.max(0, c) - 12 * Math.max(0, s),
    };
  };
  const front = legAt(phase);
  const back = legAt(phase + 0.5);
  // brazos opuestos a la pierna del mismo lado
  const aF = 22 * Math.sin(2 * Math.PI * (phase + 0.5));
  const aB = 22 * Math.sin(2 * Math.PI * phase);
  const bob = Math.cos(4 * Math.PI * phase);
  return {
    legFront: front,
    legBack: back,
    armFront: { shoulder: aF, elbow: 12 + 0.9 * Math.max(0, aF) },
    armBack: { shoulder: aB, elbow: 12 + 0.9 * Math.max(0, aB) },
    lean: 5,
    squash: 1 + 0.02 * bob,
    headTilt: -2 * bob,
  };
};
