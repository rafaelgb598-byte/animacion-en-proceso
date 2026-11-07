// Canal Despiece · «plano técnico vivo»: paleta, tipografías y medidas de la marca (arranque v4, § 4).
// Regla: ningún color ni fuente del canal se escribe fuera de este archivo.
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";

/** Paleta. Naranja = UN solo acento (la línea de corte y lo que ella toca). Rojo = solo el error. */
export const COLOR = {
  /** azul plano del fondo */
  bg: "#0B2545",
  /** papel: piezas y texto */
  paper: "#F4EBD9",
  /** naranja señal: la línea de corte (único acento) */
  signal: "#FF6B1A",
  /** grafito: trazos sobre papel */
  ink: "#2B2B2B",
  /** solo para la pieza que falla */
  error: "#E5484D",
} as const;

/** Transparencias derivadas de la paleta (cuadrícula, sombras, sombreados). */
export const ALPHA = {
  gridMinor: "rgba(244,235,217,0.045)",
  gridMajor: "rgba(244,235,217,0.09)",
  hatch: "rgba(43,43,43,0.28)",
  shade: "rgba(43,43,43,0.16)",
  shadeStrong: "rgba(43,43,43,0.32)",
  shadow: "rgba(3,10,22,0.45)",
  signalGlow: "rgba(255,107,26,0.35)",
  errorGlow: "rgba(229,72,77,0.35)",
  chip: "rgba(11,37,69,0.92)",
} as const;

const grotesk = loadSpaceGrotesk("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
const plex = loadPlexMono("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });

/** Dos familias: Space Grotesk (títulos y subtítulos) e IBM Plex Mono (etiquetas y cotas). */
export const FONT = { grotesk: grotesk.fontFamily, mono: plex.fontFamily } as const;
export const FONTS_READY = (): Promise<unknown> => Promise.all([grotesk.waitUntilDone(), plex.waitUntilDone()]);

/** Estilos de texto. Tamaños mínimos: títulos ≥ 64 px, etiquetas ≥ 36 px (se leen a 360 px de ancho). */
export const TYPE = {
  title: { fontFamily: FONT.grotesk, fontWeight: 700, fontSize: 84, lineHeight: 1.08, letterSpacing: "-0.02em" },
  label: { fontFamily: FONT.mono, fontWeight: 500, fontSize: 42, letterSpacing: "0.04em", textTransform: "uppercase" },
  value: { fontFamily: FONT.mono, fontWeight: 700, fontSize: 48 },
  chip: { fontFamily: FONT.mono, fontWeight: 500, fontSize: 36, letterSpacing: "0.02em" },
} as const;

/** Trazos uniformes del canal (px a escala 1). */
export const STROKE = { piece: 4, leader: 3, cut: 6, thin: 2 } as const;

/** Cuadrícula de plano técnico. */
export const GRID = { minor: 40, major: 200 } as const;
