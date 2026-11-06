import { clamp, ease, lerp, smooth } from "./anim";
import { DIM, rotP, type Dims, type Vec } from "./rig";

/**
 * Pies plantados reutilizables (extraído y generalizado de la V3).
 *
 * Cada pie queda fijo en el piso mientras soporta peso. Al despegar rueda sobre la punta,
 * viaja en arco y apoya primero el talón. La altura de la cadera sale del alcance real
 * de ambas piernas, así el cuerpo sube y baja solo y los pies no patinan.
 */

export type Foot = "F" | "B";
export type Step = { foot: Foot; lift: number; land: number; from: number; to: number; height: number };
export type FootPlan = { steps: Step[]; start: Record<Foot, number> };

const TOE: Vec = { x: 50, y: 24 };
const HEEL: Vec = { x: -18, y: 22 };
const TOE_OFF = 24;
const STRIKE = -12;

/** posición del tobillo (escena) y ángulo del pie para el fotograma f */
export const footState = (plan: FootPlan, foot: Foot, f: number, floor: number, scale: number, dims: Dims = DIM) => {
  const ankleY = floor - dims.sole * scale;
  const flat = (x: number): Vec => ({ x, y: ankleY });
  const toePivot = (x: number, ang: number): Vec => {
    const toe = { x: x + TOE.x * scale, y: ankleY + TOE.y * scale };
    const r = rotP({ x: TOE.x, y: TOE.y - 4 }, ang);
    return { x: toe.x - r.x * scale, y: toe.y - (r.y + 4) * scale };
  };
  const heelPivot = (x: number, ang: number): Vec => {
    const heel = { x: x + HEEL.x * scale, y: ankleY + HEEL.y * scale };
    const r = rotP({ x: HEEL.x, y: HEEL.y - 4 }, ang);
    return { x: heel.x - r.x * scale, y: heel.y - (r.y + 4) * scale };
  };
  let planted = plan.start[foot];
  for (const s of plan.steps) {
    if (s.foot !== foot) continue;
    if (f < s.lift - 4) return { pos: flat(planted), angle: 0 };
    if (f < s.lift) {
      const a = TOE_OFF * smooth((f - (s.lift - 4)) / 4);
      return { pos: toePivot(planted, a), angle: a };
    }
    if (f <= s.land) {
      const t = (f - s.lift) / Math.max(1, s.land - s.lift);
      const e = ease.inOut(t);
      const a0 = toePivot(s.from, TOE_OFF);
      const a1 = heelPivot(s.to, STRIKE);
      const h = s.height * scale * Math.pow(Math.sin(Math.PI * t), 0.9);
      const angle = lerp(TOE_OFF, STRIKE, ease.inOut(clamp(t * 1.15, 0, 1)));
      return { pos: { x: lerp(a0.x, a1.x, e), y: lerp(a0.y, a1.y, e) - h }, angle };
    }
    if (f < s.land + 3) {
      const a = STRIKE * (1 - smooth((f - s.land) / 3));
      return { pos: heelPivot(s.to, a), angle: a };
    }
    planted = s.to;
  }
  return { pos: flat(planted), angle: 0 };
};

/**
 * Altura de cadera (unidades locales) que permiten ambas piernas.
 * `hips` = posición x en escena de cada articulación de cadera.
 */
export const hipHeightFor = (
  ankles: Record<Foot, Vec>,
  hips: Record<Foot, number>,
  floor: number,
  scale: number,
  reach = 0.99,
  dims: Dims = DIM,
) => {
  const LEG = dims.thigh + dims.shin;
  let h = LEG * 0.996 + dims.sole;
  for (const foot of ["F", "B"] as Foot[]) {
    const a = ankles[foot];
    const dx = (a.x - hips[foot]) / scale;
    const r = Math.sqrt(Math.max(0, (LEG * reach) ** 2 - dx * dx));
    h = Math.min(h, r + (floor - a.y) / scale);
  }
  return h;
};

/** suavizado que nunca supera el límite de alcance */
export const smoothUnder = (xs: number[]) =>
  xs.map((h, f) => Math.min(h, (xs[Math.max(0, f - 1)] + h + xs[Math.min(xs.length - 1, f + 1)]) / 3));
