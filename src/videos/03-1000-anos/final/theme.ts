// V3 · 1000 años · Paleta, tipografías, layout y zona segura (extiende el tema de la V2).
// Regla: ningún color ni fuente se escribe fuera de este archivo.
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadBarlowCondensed } from "@remotion/google-fonts/BarlowCondensed";

const plexMono = loadPlexMono("normal", { weights: ["500", "700"], subsets: ["latin"] });
const barlow = loadBarlowCondensed("normal", { weights: ["600"], subsets: ["latin"] });

export const FONTS = {
  mono: plexMono.fontFamily,
  display: barlow.fontFamily,
} as const;

/** Materiales (compartidos con el lenguaje de los Shorts del canal). */
export const MAT = {
  bg: "#0A0B0D",
  bgLit: "#1A1C20",
  black: "#000000",
  wallTop: "#2A2620",
  wallBottom: "#3A352C",
  wallStain: "#1F1B15",
  wallCrack: "#14110D",
  laminate: "#8C6E4E",
  laminateLight: "#A2825E",
  particle: "#6B5A45",
  phoneBody: "#1C1D21",
  aluminum: "#9AA0A8",
  aluminumDull: "#6E727A",
  glass: "#0E1116",
  specular: "#FFFFFF",
  cableWhite: "#E8E4DA",
  cableOld: "#BDB6A6",
  copper: "#B87333",
  verdigris: "#4E8F7A",
  lampMetal: "#7C7F86",
  rust: "#8A4B2A",
  fabric: "#E9DFC9",
  paper: "#F3EFE6",
  paperOld: "#D9C49A",
  bookCover: "#5B3A2E",
  pet: "rgba(200,225,235,.35)",
  petEdge: "rgba(225,240,245,.55)",
  petCap: "#3E6E8E",
  water: "rgba(120,170,200,.45)",
  moss: "#4F6B3A",
  grass: "#5E7F3F",
  grassLight: "#7FA05A",
  soil: "#3B2F24",
  vine: "#3F6A3A",
  // Agregados (no estaban en la tabla del prompt; se documentan como desvío):
  floor: "#2B231C",
  floorLine: "#211A14",
  windowNight: "#121A26",
  windowDay: "#AEB8C0",
  sky: "#B9C9CF",
  skyHigh: "#8FA8B4",
  hill: "#56704A",
  flower: "#E8E2C8",
  flowerCenter: "#C9B36A",
  dust: "#CFCBC2",
  dogFur: "#D9A35B",
  dogFurDark: "#B07A38",
  dogNose: "#2A1E16",
  dogBg: "#7FA7C4",
  dogBgLow: "#C9DCE6",
  outlet: "#D8D3C8",
  // V3: interior del celular, restos y suelo en primer plano
  board: "#1F3A2C",
  boardTrace: "#3E6B52",
  chip: "#1B1D21",
  chipEdge: "#3A3D44",
  pouch: "#C8CBD0",
  pouchShade: "#9EA2A8",
  pixelDead: "#08090B",
  pixelGlitch: "#3A3F46",
  soilDark: "#2E241B",
  pebble: "#5A4C3E",
  scratch: "#C9D2D8",
  haze: "#D7DCD2",
  plasticShard: "#2A2C31",
} as const;

/** Interfaz de la serie. El ámbar es el tiempo: no aparece en ningún objeto. */
export const UI = {
  bone: "#F2EEE6",
  amber: "#E0A33B",
  ash: "#B8B4AA",
  ink: "#0B0C0E",
  inkAlpha: 0.78,
  shadow: "rgba(0,0,0,0.75)",
  veil: "rgba(8,9,11,0.55)",
  veilStrong: "rgba(11,12,14,0.8)",
  safeZone: "rgba(255,80,80,0.9)",
  debug: "rgba(0,0,0,0.6)",
  clear: "rgba(0,0,0,0)",
} as const;

/** Valores de máscara SVG (luminancia), no colores visibles. */
export const MASK = { show: "white", hide: "black" } as const;

/** Luz: color por régimen (sección 4.4). */
export const LIGHT = {
  lamp: "#FFC98A",
  window: "#C9CDD2",
  broken: "#B4C3CC",
  exterior: "#CFE0C2",
  screen: "#BFD8EA",
} as const;

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

/** Zona segura para textos (sección 12) y límite del canal (CLAUDE.md: nada a la derecha de x = 900). */
export const SAFE = { left: 80, right: 940, top: 240, bottom: 1420, channelRight: 900 } as const;

/** Coordenadas de mundo (1080 × 1920), sección 6.1 con ajustes documentados en el informe. */
export const LAYOUT = {
  cameraOrigin: { x: 540, y: 1020 },
  perspective: 1800,
  wallDepth: -400,
  skyDepth: -800,
  wall: { x: 0, y: 0, w: 1080, h: 1180 },
  window: { x: 120, y: 360, w: 300, h: 400, frame: 14 },
  floorTop: 1180,
  nightstand: {
    backY: 820, backLeft: 262, backRight: 818,
    frontY: 1130, frontLeft: 230, frontRight: 850,
    bottomY: 1520,
    drawer: { x: 272, y: 1172, w: 536, h: 150 },
  },
  phone: { x: 560, y: 968, w: 200, h: 410, rot: -8, radius: 32, tilt: 60, restTilt: 68, restX: 552, restY: 1175 },
  charger: { x: 900, y: 1120 },
  lamp: { x: 330, y: 980, h: 420 },
  book: { x: 760, y: 1005, w: 210, h: 60 },
  bottle: { x: 800, y: 900, w: 90, h: 300 },
  fragment: { x: 550, y: 1080 },
  /** Dónde queda el vidrio en pantalla al final del acercamiento (por encima de la carta). */
  fragmentOnScreen: { x: 545, y: 820 },
  counter: { x: 100, y: 330 },
  hookY: 1250,
  labels: { x: 100, y: 1300, step: -46 },
  card: { cx: 540, cy: 1150, w: 820, h: 420, radius: 18 },
  timeBar: { y: 1390, x0: 100, x1: 920 },
  /** Carril fijo de subtítulos (CLAUDE.md): apoya en y = 1530 y crece hacia arriba. */
  subtitles: { baseline: 1530, x0: 100, x1: 900 },
  /** Ancla de pantalla de la cámara V3: el centro del encuadre cae acá. */
  screenAnchor: { x: 540, y: 1020 },
  /** Celular en planos macro (vista cenital): ~46 % del ancho. */
  macro: { cx: 520, cy: 930, w: 500, h: 1025, radius: 78, inset: 18 },
  /** Vista lateral (perfil): largo y grosor. */
  side: { x0: 110, x1: 950, y: 1000, thick: 92 },
  hookV3: { cx: 500, cy: 250, w: 780 },
  barV3: { y: 372, x0: 100, x1: 900 },
} as const;

export const TYPE = {
  counter: 88,
  counterSub: 22,
  bar: 20,
  label: 30,
  hook: 64,
  cardKicker: 28,
  cardWinner: 88,
  cardFigure: 40,
  cardFoot: 22,
  photoNo: 52,
  subtitle: 56,
  callout: 52,
  hookV3: 72,
  small: 26,
} as const;
