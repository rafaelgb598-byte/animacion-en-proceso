// Serie «1000 años» («Último en pie») · Tema de interfaz común a todos los episodios.
// Mismos valores que el celular v4 (src/videos/03-1000-anos/v4/theme.ts), que no se toca.
// Regla: los episodios extienden este tema en su propio theme.ts; ningún color ni fuente se escribe fuera de ellos.
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadBarlowCondensed } from "@remotion/google-fonts/BarlowCondensed";

const plexMono = loadPlexMono("normal", { weights: ["500", "700"], subsets: ["latin"] });
const barlow = loadBarlowCondensed("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const SERIES_FONTS = {
  mono: plexMono.fontFamily,
  display: barlow.fontFamily,
} as const;

/** Interfaz de la serie. El ámbar es el tiempo: solo el contador, el punto de la barra y «ÚLTIMO». */
export const SERIES_UI = {
  bone: "#F2EEE6",
  amber: "#E0A33B",
  ash: "#B8B4AA",
  ink: "#0B0C0E",
  inkAlpha: 0.78,
  black: "#000000",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.75)",
  veil: "rgba(8,9,11,0.55)",
  veilStrong: "rgba(11,12,14,0.8)",
  safeZone: "rgba(255,80,80,0.9)",
  debug: "rgba(0,0,0,0.6)",
} as const;

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

/** Zona segura de textos y límites del canal (CLAUDE.md: nada clave bajo y = 1536 ni a la derecha de x = 900). */
export const SAFE = { left: 80, right: 940, top: 240, bottom: 1420, channelRight: 900, channelBottom: 1536 } as const;

/** Posiciones fijas de la interfaz de la serie (iguales al celular v4). */
export const SERIES_LAYOUT = {
  counter: { x: 100, y: 330 },
  bar: { y: 372, x0: 100, x1: 900 },
  card: { cx: 540, cy: 1150, w: 820, h: 420, radius: 18, padX: 40 },
} as const;

export const SERIES_TYPE = {
  counter: 88,
  bar: 20,
  cardKicker: 28,
  cardFigure: 34,
  cardFoot: 24,
} as const;
