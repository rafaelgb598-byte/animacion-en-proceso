// 1000 años · Episodio 2 «¿Qué queda de tu cocina en 1000 años?» · Paleta, tipografías y layout.
// Extiende el tema de la serie (src/canal/mil-anos/theme.ts) sin cambiar sus tokens de interfaz.
// Regla: ningún color ni fuente se escribe fuera de este archivo y del tema de la serie.
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { SAFE, SERIES_FONTS, SERIES_LAYOUT, SERIES_UI, VIDEO } from "../../canal/mil-anos/theme";

/** Caveat es parte del objeto (letra de la abuela), no de la interfaz: solo la usan la receta y su fantasma. */
const caveat = loadCaveat("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const FONTS = { ...SERIES_FONTS, recipe: caveat.fontFamily } as const;
export const UI = SERIES_UI;
export { SAFE, SERIES_LAYOUT, VIDEO };

/** Tokens nuevos del prompt (sección 4). `ink` de la receta se llama `recipeInk` para no pisar el `ink` de la carta. */
export const K = {
  fridgeLight: "#CFE6F2",
  moonLight: "#8FA7C4",
  tile: "#D9D4C7",
  tileOld: "#9E978A",
  steel: "#A7ADB4",
  steelDull: "#6F757C",
  rust: "#8A4B2A",
  plateWhite: "#F1EEE8",
  plateBlue: "#3E6FA8",
  mold: "#C9D6B8",
  moldDark: "#8FA27A",
  banana: "#E8C547",
  bananaBlack: "#2B2116",
  sauce: "#8C3B24",
  recipeInk: "#2B3A55",
} as const;

/**
 * Materiales agregados (no estaban en la tabla del prompt; desvío documentado en ENTREGA).
 * Los de naturaleza, PET, agua y polvo tienen los mismos valores que el celular v4.
 */
export const M = {
  night: "#05070C",
  sky: "#0E1522",
  skyLow: "#1A2433",
  moon: "#E4ECF4",
  day: "#CFE0C2",
  daySky: "#B9C9CF",
  daySkyHigh: "#8FA8B4",
  hill: "#56704A",
  hillFar: "#7B9070",
  ceiling: "#2E2B26",
  plaster: "#8E877A",
  plasterDark: "#5F584D",
  grout: "#B7B1A3",
  groutOld: "#7D766A",
  wallStain: "#4A4236",
  wallCrack: "#1C1814",
  brick: "#6E4A38",
  windowFrame: "#D8D2C4",
  windowFrameOld: "#7A6E5C",
  glass: "rgba(160,190,215,0.18)",
  glassEdge: "rgba(220,235,245,0.55)",
  wood: "#7A5C43",
  woodLight: "#94735A",
  woodDark: "#4E3A2A",
  woodRot: "#3B3226",
  counterTop: "#4A4743",
  counterEdge: "#2F2D2A",
  counterFleck: "#6A6660",
  floor: "#5A5048",
  floorLine: "#3E3631",
  fridgeBody: "#D4D7D9",
  fridgeShade: "#A9AEB2",
  fridgeInner: "#EEF3F5",
  fridgeInnerDark: "#B9C3C8",
  gasket: "#2A2D30",
  shelf: "rgba(207,230,242,0.45)",
  shelfEdge: "rgba(235,245,250,0.8)",
  carton: "#F2EEE6",
  cartonBlue: "#5C7FA6",
  cartonWet: "#B9AE95",
  tupper: "rgba(232,238,240,0.55)",
  tupperOld: "rgba(214,206,186,0.8)",
  tupperLid: "#5F9C97",
  stew: "#9A5530",
  stewDark: "#5E3520",
  bananaSpot: "#6B4A22",
  bananaStem: "#5B5A2A",
  tinLabel: "#C9A15A",
  tinStripe: "#7C4B2C",
  tinTop: "#BFC4C9",
  magnet: "#B8473A",
  magnetHi: "#E07A6C",
  paper: "#F3EFE6",
  paperOld: "#D9C49A",
  waterStain: "#A8996F",
  fly: "#111111",
  leaf: "#7D6A36",
  leafDry: "#A07E45",
  leafGreen: "#5E7F3F",
  debris: "#5C554B",
  debrisLight: "#7E766A",
  pet: "rgba(200,225,235,0.35)",
  petEdge: "rgba(225,240,245,0.55)",
  petCap: "#3E6E8E",
  petOld: "rgba(214,206,186,0.55)",
  water: "rgba(120,170,200,0.45)",
  puddle: "rgba(110,140,160,0.5)",
  moss: "#4F6B3A",
  mossLight: "#6C8A4A",
  grass: "#5E7F3F",
  grassLight: "#7FA05A",
  soil: "#3B2F24",
  soilDark: "#2E241B",
  soilLight: "#55452F",
  pebble: "#5A4C3E",
  vine: "#3F6A3A",
  dust: "#CFCBC2",
  specular: "#FFFFFF",
  black: "#000000",
  clear: "rgba(0,0,0,0)",
} as const;

/** Valores de máscara SVG (luminancia), no colores visibles. */
export const MASK = { show: "white", hide: "black", half: "#8C8C8C" } as const;

/**
 * Coordenadas de mundo (1080 × 1920). Cámara 8–10° más alta que en el celular: se ve la mesada desde arriba
 * (la superficie ocupa 130 px de profundidad), el interior de la bacha y mucho piso.
 */
export const LAYOUT = {
  ceilingY: 64,
  floorTop: 1250,
  fridge: {
    x0: 40,
    x1: 380,
    top: 330,
    bottom: 1300,
    freezerBottom: 690,
    inner: { x0: 74, x1: 346, y0: 712, y1: 1270 },
    shelves: [884, 1034, 1172],
  },
  recipe: { cx: 212, top: 422, w: 240, h: 252, rot: -3 },
  magnet: { cx: 214, cy: 430, r: 17 },
  counter: { x0: 380, x1: 1080, backY: 770, frontY: 900, lipY: 922, bottom: 1240 },
  sink: { x0: 548, x1: 800, y0: 782, y1: 890 },
  plate: { cx: 672, cy: 843, rx: 96, ry: 36 },
  faucet: { x: 674, baseY: 776 },
  window: { x0: 540, x1: 808, y0: 330, y1: 690 },
  cupboard: { x0: 832, x1: 1092, y0: 168, y1: 560 },
  tin: { cx: 448, bottom: 886, w: 84, h: 108 },
  pet: { cx: 860, bottom: 886, w: 70, h: 236 },
  puddle: { cx: 300, cy: 1418, rx: 230, ry: 48 },
  recipeFloor: { cx: 302, cy: 1404, rot: 9 },
  shards: { x0: 430, x1: 900, y0: 1360, y1: 1520 },
  /** Haz de luna desde la ventana hacia la mesada y el piso. */
  moonBeam: [
    [540, 334],
    [808, 334],
    [700, 1640],
    [-140, 1380],
  ] as const,
  fridgePool: { x: 212, y: 990, r: 980 },
  /** Origen del acercamiento del gancho (centro) y de la revelación (el plato). */
  pushOrigin: { x: 540, y: 960 },
  hookY: 1250,
  remateY: 1010,
  questionBase: 1420,
  labels: { x: 100, y: 1300, step: -56 },
} as const;

export const TYPE = {
  label: 36,
  hook: 64,
  bet: 56,
  marker: 34,
  cardWinner: 80,
  remate: 64,
  question: 52,
  recipeTitle: 32,
  recipeLine: 26,
  ghost: 40,
} as const;
