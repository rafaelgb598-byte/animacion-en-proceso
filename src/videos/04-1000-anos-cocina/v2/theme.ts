// 1000 años · Episodio 2 «¿Qué queda de tu cocina en 1000 años?» · Paleta, tipografías y layout.
// Extiende el tema de la serie (src/canal/mil-anos/theme.ts) sin cambiar sus tokens de interfaz.
// Regla: ningún color ni fuente se escribe fuera de este archivo y del tema de la serie.
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { SAFE, SERIES_FONTS, SERIES_LAYOUT, SERIES_UI, VIDEO } from "../../../canal/mil-anos/theme";

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
 * Coordenadas de MUNDO (v2). La cámara base escala la escena ×1,30 (ver `CAM`): pantalla = 1,3 · (mundo − (130, −30)).
 * Así la mesada queda en y ≈ 1040–1210, el piso arranca en y ≈ 1460 (≤ 25 % de piso vacío) y la heladera queda cortada a la izquierda.
 * Los objetos se ubicaron fuera del carril de subtítulos del canal (y 1300–1500, x 180–900): ahí solo hay muebles y piso.
 */
export const LAYOUT = {
  ceilingY: 64,
  floorTop: 1090,
  fridge: {
    x0: 30,
    x1: 350,
    top: 300,
    bottom: 1100,
    freezerBottom: 560,
    inner: { x0: 64, x1: 318, y0: 582, y1: 1074 },
    shelves: [744, 904, 1050],
  },
  /** Comida (mundo): banana arriba; tupper y cartón en el estante del medio. */
  food: { banana: { x0: 110, x1: 300 }, carton: { x0: 236, x1: 306 }, tupper: { x0: 82, x1: 222 } },
  recipe: { cx: 240, top: 322, w: 214, h: 222, rot: -3 },
  magnet: { cx: 242, cy: 330, r: 15 },
  counter: { x0: 350, x1: 1080, backY: 770, frontY: 900, lipY: 922, bottom: 1080 },
  sink: { x0: 505, x1: 785, y0: 780, y1: 892 },
  plate: { cx: 645, cy: 838, rx: 122, ry: 44 },
  faucet: { x: 645, baseY: 774 },
  window: { x0: 520, x1: 690, y0: 340, y1: 680 },
  cupboard: { x0: 700, x1: 980, y0: 170, y1: 520 },
  tin: { cx: 395, bottom: 888, w: 64, h: 90 },
  pet: { cx: 463, bottom: 888, w: 54, h: 200 },
  /** Charco y receta caída: a la izquierda del carril de subtítulos. */
  puddle: { cx: 120, cy: 1118, rx: 150, ry: 22 },
  recipeFloor: { cx: 112, cy: 1108, rot: 9 },
  /** Fragmentos de los platos: mesada a la derecha de la bacha y piso a la derecha del carril. */
  shards: { counter: { x0: 790, x1: 1000, y0: 796, y1: 896 }, floor: { x0: 850, x1: 1080, y0: 1100, y1: 1190 }, origin: { x: 860, y: 780 } },
  /** La alacena cae acostada a la derecha, fuera del carril de subtítulos (pantalla x > 912). */
  cupboardLanded: { x: 1075, y: 1020, rot: -84, scale: 1.0 },
  /** Haz de luna: de la ventana a la mesada y el piso, sin cruzar la heladera (x ≥ 360). */
  moonBeam: [
    [520, 344],
    [690, 344],
    [960, 1220],
    [360, 1220],
  ] as const,
  beamClipX: 360,
  fridgePool: { x: 190, y: 830, r: 900 },
  /** Hundimiento de mesada y bacha entre AÑO 200 y AÑO 1.000 (mundo). */
  sinkDrop: 120,
  /** Borde de la tierra en AÑO 1.000 (mundo): cubre muebles y piso; deja la mesada hundida a la vista. */
  moundTop: [
    [-40, 960],
    [120, 965],
    [260, 975],
    [350, 1010],
    [450, 1028],
    [700, 1030],
    [900, 1026],
    [1120, 1020],
  ] as const,
  vines: [
    [[110, 470], [98, 560], [120, 650], [96, 740], [118, 840], [92, 930]],
    [[960, 520], [980, 600], [950, 680], [976, 770], [940, 850]],
    [[400, 700], [440, 690], [480, 700], [510, 730]],
  ] as const,
  /** Puntos de mundo que enfocan los acercamientos. */
  fridgeFocus: { x: 200, y: 800 },
} as const;

/** Cámara: pantalla = s · mundo + t. Base ×1,30; acercamientos a la heladera (×1,22) y al plato (×1,65). */
export const CAM = {
  base: { s: 1.3, tx: -130 * 1.3, ty: 30 * 1.3 },
  fridgeZoom: 1.22,
  fridgeOnScreen: { x: 400, y: 860 },
  revealZoom: 1.65,
  plateOnScreen: { x: 540, y: 820 },
  hookPush: 1.04,
  hookPushOrigin: { x: 540, y: 960 },
} as const;

/** Interfaz (coordenadas de pantalla). */
export const UI_LAYOUT = {
  /** Gancho y apuesta sobre los muebles (debajo de la bacha y el plato, que no se tapan). */
  hookY: 1330,
  betY: 1320,
  remateY: 1120,
  questionBase: 1420,
  /** Etiquetas con cifra: debajo de la barra de tiempo, apiladas hacia abajo. */
  labels: { x: 100, y: 476, step: 58 },
} as const;

export const TYPE = {
  label: 40,
  hook: 84,
  bet: 72,
  betNumbers: 56,
  marker: 44,
  markerSize: 84,
  markerBorder: 4,
  cardWinner: 80,
  remate: 72,
  question: 60,
  recipeTitle: 30,
  recipeLine: 24,
  ghost: 60,
} as const;
