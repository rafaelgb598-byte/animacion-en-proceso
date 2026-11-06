import { DIM, type Dims } from "../rig";
import { COLORS } from "../presets";

/**
 * Tomi V2 — evolución del diseño (joven adulto, 20–25).
 * Misma identidad: pelo marrón con mechón levantado, remera turquesa con franja blanca,
 * ojos grandes, contorno oscuro. Cambian proporciones, rasgos y zapatillas.
 */

/** Cabeza ~9 % más chica respecto del cuerpo (0,92 × y cuerpo/piernas más largos). */
export const HEAD_SCALE = 0.92;

export const DIM_V2: Dims = {
  ...DIM,
  thigh: 98,
  shin: 95,
  upperArm: 80,
  foreArm: 74,
  neckY: -164,
  shoulderY: -136,
  headCenter: -74,
  shoulderX: 44,
  hipX: 23,
  chinY: 70,
};

export const COLORS_V2 = {
  ...COLORS,
  // misma piel, sombra un poco más fría para que el volumen se lea más "pintado"
  skinShade: "#E2A07C",
  cheek: "#EE8F84",
  hairLight: "#5A4032",
  shirtLight: "#3CC4B3",
  shirtFold: "#1E8A7A",
  // zapatillas crema con detalles turquesa (sin marcas)
  shoe: "#F4EEE2",
  shoeShade: "#DCD3C2",
  shoeAccent: "#2BB3A3",
  shoeAccentShade: "#21907F",
  sole: "#FFFFFF",
};

/** Grosor de línea único: contorno exterior y detalles interiores. */
export const LINE = { outer: 5.5, inner: 4 };
