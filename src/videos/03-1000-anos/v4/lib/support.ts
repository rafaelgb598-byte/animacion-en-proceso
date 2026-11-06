// Colapso del soporte (la mesa de luz): los objetos que estaban encima bajan con ella.
import { EVENT_YEARS, EVENTS } from "../timeline";
import { fall } from "./anim";

/** 0 → 1 cuando la mesa colapsa (spring de caída). */
export const collapseT = (year: number, frame: number): number =>
  fall(frame, EVENTS.collapse, year >= EVENT_YEARS.collapse);

/** Desplazamiento de un objeto apoyado: baja `drop` px y gira `rot` grados con el colapso. */
export const onSupport = (year: number, frame: number, drop: number, rot: number) => {
  const t = collapseT(year, frame);
  return { dy: drop * t, rot: rot * t, t };
};
