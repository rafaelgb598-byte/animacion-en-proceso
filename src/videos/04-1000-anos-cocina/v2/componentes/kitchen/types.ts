/** Toda pieza de la cocina recibe el año continuo (su estado) y el frame (solo para micro-movimiento: moscas, lluvia, pasto). */
export type KitchenProps = { year: number; frame: number };

export type Pt = readonly [number, number];
