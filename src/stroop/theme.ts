/**
 * Tema del Short Stroop — solo lo nuevo. El personaje, los subtítulos, las curvas de animación
 * y la paleta del canal se importan (Tomi V2, CaptionsLayer, motion2, COLORS_V2).
 */
export { COLORS_V2 as CHANNEL } from "../character/v2/style";

/** Tintas de la prueba (solo para las palabras de las tarjetas). Contraste contra #0A0B0D ≥ 5:1. Sin verde. */
export const INK = {
  red: "#F0443A",
  blue: "#3D8BFF",
  yellow: "#F5D547",
  white: "#F3EFE6",
} as const;
export type Ink = keyof typeof INK;

/** "Mesa de evidencia": mesa oscura, tarjetas de papel oscuro, foco cálido. */
export const STROOP = {
  bg: "#0A0B0D",
  table: "#121214",
  tableLip: "#1A1714",
  card: "#15161A",
  cardEdge: "#24262C",
  cardRadius: 28,
  spot: "#FFC58A",
  /** naranja de acento del canal: NO aparece durante las rondas (se parece al rojo); solo en el sello */
  accent: "#FF5B2E",
  text: "#F3EFE6",
  textDim: "#9EA3AD",
  line: "#1F1A24",
} as const;

/** Las tres familias del canal en este proyecto (sin instalar fuentes). */
export const FONTS = {
  display: "'Segoe UI Black', 'Arial Black', 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "Consolas, 'Cascadia Mono', 'Courier New', monospace",
} as const;
