// Canal Ciberseguridad · «Expediente nocturno»: paleta, tipografías y medidas de la marca.
// Regla: ningún color ni fuente del canal se escribe fuera de este archivo (prompt 01, § 5).
import { loadVariableFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";

/** Paleta (§ 5.2). Amarillo = evidencia, rojo = daño, turquesa = defensa. */
export const COLOR = {
  bg: "#0A0D12",
  slate: "#161B23",
  slateLit: "#222A35",
  phoneBody: "#111318",
  screen: "#0F1218",
  bubbleIn: "#1F2630",
  bubbleOut: "#2B3A4D",
  text: "#EEF1F5",
  muted: "#8B95A3",
  /** SOLO marcadores y su línea guía */
  evidence: "#FFC21A",
  /** canto del marcador */
  evidenceEdge: "#C99600",
  /** SOLO el momento de la pérdida */
  danger: "#FF4D4D",
  /** SOLO la defensa */
  safe: "#3FD0C9",
  black: "#000000",
  /** número del marcador */
  ink: "#0A0A0A",
} as const;

/** Transparencias derivadas de la paleta (sombras, reflejos, vidrio). */
export const ALPHA = {
  shadow: "rgba(0,0,0,0.6)",
  shadowSoft: "rgba(0,0,0,0.35)",
  specular: "rgba(255,255,255,0.10)",
  bevelLight: "rgba(255,255,255,0.10)",
  bevelDark: "rgba(0,0,0,0.55)",
  hairline: "rgba(238,241,245,0.08)",
  glass: "rgba(15,18,24,0.55)",
  glassEdge: "rgba(238,241,245,0.16)",
  screenGlow: "rgba(120,150,190,0.10)",
  dim: "rgba(10,13,18,0.62)",
  dangerWash: "rgba(255,77,77,0.10)",
  safeWash: "rgba(63,208,201,0.10)",
  evidenceWash: "rgba(255,194,26,0.16)",
  finger: "rgba(238,241,245,0.20)",
  fingerRing: "rgba(238,241,245,0.75)",
} as const;

const archivo = loadArchivo("normal", { subsets: ["latin", "latin-ext"] });
const spaceMono = loadSpaceMono("normal", { weights: ["400", "700"], subsets: ["latin", "latin-ext"] });

/** Tipografías (§ 5.3): Archivo (cabeceras 800 condensada, interfaz 400/600) y Space Mono (forense). */
export const FONT = {
  archivo: archivo.fontFamily,
  mono: spaceMono.fontFamily,
} as const;
export const FONTS_READY = (): Promise<unknown> => Promise.all([archivo.waitUntilDone(), spaceMono.waitUntilDone()]);

/** Estilos de texto listos para usar (React CSS). */
export const TYPE = {
  /** cabeceras y pregunta del gancho: Archivo 800 condensada */
  headline: { fontFamily: FONT.archivo, fontWeight: 800, fontVariationSettings: "'wdth' 75", letterSpacing: "-0.01em", textTransform: "uppercase" },
  ui: { fontFamily: FONT.archivo, fontWeight: 400 },
  uiStrong: { fontFamily: FONT.archivo, fontWeight: 600 },
  mono: { fontFamily: FONT.mono, fontWeight: 400 },
  monoBold: { fontFamily: FONT.mono, fontWeight: 700 },
} as const;

/** Medidas de la app de chat a escala 1 (§ 5.4): que a 360 px de ancho se lea. */
export const CHAT = {
  fontSize: 40,
  lineHeight: 1.22,
  bubbleRadius: 26,
  bubblePadY: 22,
  bubblePadX: 28,
  gap: 16,
  metaSize: 24,
} as const;

/** Teléfono (§ 5.5): canto de 12 px, bisel, reflejo, sombra. */
export const PHONE = {
  /** tamaño del teléfono principal a escala 1 (pantalla 548 × 868) */
  w: 580,
  h: 900,
  edge: 12,
  bezel: 16,
  radius: 64,
  shadow: `0 50px 90px ${ALPHA.shadow}`,
} as const;

/** Marcador de evidencia (§ 5.5): tent 120 × 150, número Space Mono 700 72 px, línea guía de 3 px. */
export const MARKER = { w: 120, h: 150, numberSize: 72, guide: 3 } as const;

/** Grano (§ 5.5). */
export const GRAIN = { baseFrequency: 0.9, opacity: 0.045, seeds: 30 } as const;
