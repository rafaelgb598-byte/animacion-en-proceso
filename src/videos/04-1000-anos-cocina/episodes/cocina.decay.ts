// 1000 años · Cocina · Datos y curvas de deterioro (sección 7 del prompt).
// Fuente de verdad de las ÚNICAS cuatro etiquetas con cifra. Todo lo demás son curvas de PROCESO, ilustrativas.
import { DAY, MONTH, WEEK } from "../../../canal/mil-anos/clock";
import { lerp, lramp, ramp } from "../../../canal/mil-anos/anim";
import { CUE, eventYears } from "./cocina.timeline";

/**
 * Regla de la serie (nueva desde este episodio):
 * «Último en pie» = el ÚLTIMO OBJETO QUE TODAVÍA SE RECONOCE como lo que era, no el material con la cifra más alta.
 * Por eso gana la cerámica (el plato entero, con su borde azul) aunque el vidrio dure más: el vidrio de la ventana
 * termina en astillas que ya no son «una ventana».
 */
export const nota =
  "Último en pie = último objeto reconocible. La cerámica no tiene cifra publicada de descomposición; por eso la carta no lleva número.";

export type Figure = { label: string; figure: string; source: string };

/** Las cuatro cifras con fuente. Ninguna otra etiqueta del video lleva número. */
export const FIGURES = {
  banana: {
    label: "banana · 2 a 6 semanas",
    figure: "2–6 semanas (cáscara de banana)",
    source: "NOAA Marine Debris Program, «Marine Debris Match Up»",
  },
  carton: {
    label: "cartón de leche · ~3 meses",
    figure: "~3 meses",
    source: "NOAA Marine Debris Program, «Marine Debris Match Up»",
  },
  lata: {
    label: "lata de conserva · ~50 años",
    figure: "~50 años (lata de hojalata)",
    source: "NOAA Marine Debris Program, «Marine Debris Match Up»",
  },
  pet: {
    label: "botella PET · ~450 años, en pedazos",
    figure: "~450 años; se fragmenta, no desaparece",
    source: "NOAA Marine Debris Program; Milton Keynes Council (la misma cifra que usa el episodio del celular)",
  },
} as const satisfies Record<string, Figure>;

// ---------------------------------------------------------------------------------------------
// Curvas de PROCESO (ilustrativas, sin cifra publicada): 0 = nuevo, 1 = proceso completo.
// Rigor: mientras la cocina está cerrada (AÑO 0 a ~AÑO 1) solo hay putrefacción de comida, polvo y manchas.
// Desde que se rompe la ventana (AÑO 1) entran el agua y las hojas y se aplican las tasas de intemperie.
// ---------------------------------------------------------------------------------------------

/** Progreso 0 → 1 de un evento anclado a frames del timeline, expresado en años. */
const eventT = (year: number, e: { y0: number; y1: number }) => (year <= e.y0 ? 0 : year >= e.y1 ? 1 : (year - e.y0) / (e.y1 - e.y0));

export const EV = {
  window: eventYears(CUE.windowBreak, CUE.windowBreakLen),
  cupboard: eventYears(CUE.cupboardFall, CUE.cupboardFallLen),
  recipe: eventYears(CUE.recipeFall, CUE.recipeFallLen),
  roof: eventYears(CUE.roofFall, CUE.roofFallLen),
  fridgeDoor: eventYears(CUE.fridgeDoorFall, CUE.fridgeDoorFallLen),
  cabinetDoor: eventYears(CUE.cabinetDoorFall, CUE.cabinetDoorFallLen),
  rainEnd: eventYears(CUE.rainEnd, 1).y0,
};

/** Polvo general (cocina cerrada: se asienta en semanas, cubre en años). */
export const dust = (y: number) => lramp(y, WEEK, 10);

// Banana: manchas DÍA 1–3 → negra en SEMANA 1 → se encoge → desaparece hacia SEMANA 6.
export const banana = (y: number) => ({
  spots: lramp(y, DAY, 3 * DAY),
  black: lramp(y, 3 * DAY, WEEK),
  shrink: lramp(y, WEEK, 6 * WEEK),
  gone: lramp(y, 5 * WEEK, 6.2 * WEEK),
});

// Tupper: moho en manchas desde SEMANA 1; la comida se hunde; plástico opaco y fragmentado en AÑO 200+.
export const tupper = (y: number) => ({
  mold: lramp(y, WEEK, 2 * MONTH),
  sink: lramp(y, WEEK, 3 * MONTH),
  dried: lramp(y, 3 * MONTH, 2),
  opaque: lramp(y, 1, 100),
  fragment: lramp(y, 200, 450),
});

// Cartón de leche: se hincha en SEMANA 1 → se ablanda → se deshace hacia MES 3.
export const carton = (y: number) => ({
  swell: lramp(y, 3 * DAY, 2 * WEEK),
  soft: lramp(y, 2 * WEEK, 2 * MONTH),
  gone: lramp(y, 2 * MONTH, 3 * MONTH),
});

/** Moscas (puntos de 3 px): aparecen con la comida podrida y se van cuando ya no queda nada blando. */
export const flies = (y: number) => lramp(y, 3 * DAY, WEEK) * (1 - lramp(y, 2 * MONTH, 4 * MONTH));

// Receta: amarillea → se mancha con la humedad (AÑO 1) → se despega y cae (AÑO 10) → desaparece (AÑO 15–20).
export const recipe = (y: number) => ({
  yellow: lramp(y, MONTH, 1.6),
  stain: ramp(y, EV.window.y1, 1.5),
  fall: eventT(y, EV.recipe),
  soak: ramp(y, EV.recipe.y1, 13),
  gone: lramp(y, 15, 20),
});

// Ventana: se rompe en AÑO 1 (entran la lluvia y las hojas); el marco se pudre; con el techo cae todo.
export const kitchenWindow = (y: number) => ({
  crack: eventT(y, EV.window),
  broken: y >= EV.window.y0 ? 1 : 0,
  frameRot: lramp(y, 2, 60),
});

/** Lluvia: desde la rotura de la ventana hasta el fin del tramo de la alacena. */
export const rain = (y: number) => (y >= EV.window.y0 && y < EV.rainEnd ? lerp(y, [EV.window.y0, EV.window.y1], [0, 1]) : 0);
/** Hojas que entran por la ventana rota y se juntan en el piso. */
export const leaves = (y: number) => lramp(y, EV.window.y0, 12);

// Alacena: se hincha (aglomerado) → cae en AÑO 10 → los 8 platos blancos se rompen en el piso.
export const cupboard = (y: number) => ({
  swell: lramp(y, 1.05, 10),
  fall: eventT(y, EV.cupboard),
  rot: lramp(y, 12, 120),
});

// Platos rotos: fragmentos que se ensucian, se cubren de musgo y quedan enterrados.
export const shards = (y: number) => ({
  scatter: eventT(y, { y0: EV.cupboard.y1, y1: EV.cupboard.y1 + (EV.cupboard.y1 - EV.cupboard.y0) * 0.9 }),
  dirt: lramp(y, 11, 200),
  bury: lramp(y, 150, 900),
});

// Plato de la pileta: polvo → manchas → musgo encima desde AÑO 50 → semienterrado en AÑO 1.000, ENTERO.
export const plate = (y: number) => ({
  dust: lramp(y, WEEK, 10),
  sauceDry: lramp(y, DAY, MONTH),
  sauceGone: lramp(y, 2, 60),
  stain: lramp(y, 1, 50),
  moss: lramp(y, 50, 450),
  bury: lramp(y, 200, 1000),
});

// Lata de conserva: óxido naranja desde AÑO 2 → perforada hacia AÑO 50 → desaparece después.
export const tin = (y: number) => ({
  rust: lramp(y, 2, 50),
  label: lramp(y, 1, 20),
  holes: lramp(y, 40, 56),
  gone: lramp(y, 60, 160),
});

// Botella PET: opaca → quebradiza → fragmentada en AÑO 200–450 (no desaparece: queda en pedazos).
export const pet = (y: number) => ({
  opaque: lramp(y, 1, 100),
  brittle: lramp(y, 50, 200),
  fragment: lramp(y, 200, 450),
  bury: lramp(y, 460, 1000),
});

// Heladera: óxido en bisagras (AÑO 5) → caja oxidada sin puerta (AÑO 50) → restos cubiertos de tierra (AÑO 1.000).
export const fridge = (y: number) => ({
  hinge: lramp(y, 3, 10),
  rust: lramp(y, 10, 60),
  doorFall: eventT(y, EV.fridgeDoor),
  collapse: lramp(y, 150, 450),
  bury: lramp(y, 300, 1000),
});

// Bacha de acero: opaca → óxido superficial → semienterrada; sigue «protegiendo» el plato.
export const sink = (y: number) => ({
  dull: lramp(y, MONTH, 10),
  rust: lramp(y, 10, 300),
  bury: lramp(y, 200, 1000),
});

// Techo y paredes: manchas → grietas → cae el techo en AÑO 50 → AÑO 200: restos de pared con enredadera.
export const walls = (y: number) => ({
  age: lramp(y, MONTH, 50),
  stain: lramp(y, 1, 30),
  crack: lramp(y, 10, 52),
  roofFall: eventT(y, EV.roof),
  ruin: lramp(y, 62, 200),
  vine: lramp(y, 56, 400),
});

// Bajo mesada (madera): se hincha con el agua → se pudre y se desarma (la mesada de piedra queda).
export const cabinets = (y: number) => ({
  swell: lramp(y, 1.05, 12),
  rot: lramp(y, 30, 400),
  doorFall: eventT(y, EV.cabinetDoor),
  countertopCrack: lramp(y, 120, 600),
  moss: lramp(y, 55, 300),
});

// Piso: polvo → hojas → musgo (AÑO 20+) → tierra y pasto (AÑO 100+).
export const floor = (y: number) => ({
  dust: lramp(y, WEEK, 1),
  moss: lramp(y, 20, 120),
  soil: lramp(y, 100, 1000),
  grass: lramp(y, 150, 700),
});

/** Agua en el piso (charco frente a la heladera) mientras llueve adentro; se seca cuando entra la tierra. */
export const puddle = (y: number) => lramp(y, EV.window.y1, 3) * (1 - lramp(y, 40, 100));

/** Luz de día que entra por el techo caído (verdosa). */
export const daylight = (y: number) => eventT(y, { y0: EV.roof.y0, y1: EV.roof.y1 + 2 });
