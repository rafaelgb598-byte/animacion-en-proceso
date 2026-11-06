// Curvas de deterioro por material: funciones puras de `year` (año continuo).
// IMPORTANTE: salvo las tres cifras con fuente de `episodes/celular.decay.ts`, todas estas curvas
// son ILUSTRATIVAS: describen el orden y el tipo de proceso (polvo, humedad, óxido, colapso), no tasas medidas.
// Mientras el cuarto está cerrado (año 0 a ~8) solo hay polvo, amarilleo y manchas; desde que se rompe
// la ventana entra el agua y el deterioro pasa a régimen de intemperie.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Rampa suave entre dos años, en escala logarítmica (el tiempo del video es logarítmico). */
export const lramp = (year: number, a: number, b: number): number => {
  if (year <= 0) return 0;
  const t = (Math.log10(year) - Math.log10(a)) / (Math.log10(b) - Math.log10(a));
  return smooth(clamp01(t));
};

/** Campana logarítmica: sube en [a,b], baja en [c,d]. */
export const lbump = (year: number, a: number, b: number, c: number, d: number): number =>
  Math.min(lramp(year, a, b), 1 - lramp(year, c, d));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Mezcla dos colores hex (#RRGGBB). */
export const mixColor = (a: string, b: string, t: number): string => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(mix(v, pb[i], clamp01(t))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

// ---------- Ambiente ----------

/** Polvo de superficie: 0 → 0,35 (año 1) → 0,5 (año 8); la lluvia lo lava hasta 0,1. */
export const dust = (year: number): number =>
  0.35 * lramp(year, 0.01, 1) + 0.15 * lramp(year, 1, 8) - 0.4 * lramp(year, 25, 60);

/** Intensidad de lluvia (años 30–60). */
export const rain = (year: number): number => lbump(year, 28, 33, 52, 62);

/** Pesos de luz por régimen (sección 4.4). La lámpara depende del frame (corte de luz), no del año. */
export const lightRegime = (year: number) => {
  const day = lramp(year, 0.003, 0.012);
  const broken = lramp(year, 7.5, 9);
  const exterior = lramp(year, 38, 55);
  return { day, broken, exterior };
};

/** Partículas en suspensión: desaparecen al aire libre. */
export const airDust = (year: number): number => lramp(year, 0.003, 0.02) * (1 - lramp(year, 40, 55));

// ---------- Cuarto ----------

export const wallStain = (year: number) => lramp(year, 0.15, 10);
export const vineGrowth = (year: number) => lramp(year, 9, 45);
export const wallCracks = (year: number) => lramp(year, 18, 36);
export const wallRemains = (year: number) => 1 - lramp(year, 50, 190);
export const floorMoss = (year: number) => lramp(year, 18, 60);
export const floorSoil = (year: number) => lramp(year, 55, 180);
export const grassGrowth = (year: number) => lramp(year, 70, 400);
export const flowers = (year: number) => lramp(year, 400, 950);
/** Montículo de tierra: cubre ~30 % del celular en el año 200 y casi todo en el 1.000. */
export const mound = (year: number) => 0.3 * lramp(year, 60, 200) + 0.7 * lramp(year, 210, 950);

// ---------- Celular ----------

export const batterySwell = (year: number) => lbump(year, 8, 11, 60, 200);
export const aluminumDull = (year: number) => lramp(year, 50, 300);
export const aluminumPits = (year: number) => lramp(year, 50, 600);
/** El cuerpo (plástico, marco) se pierde; queda el vidrio. */
export const phoneBodyLoss = (year: number) => lramp(year, 300, 950);

// ---------- Cable y cargador ----------

export const cableYellow = (year: number) => lramp(year, 0.1, 10);
export const cableCracks = (year: number) => lramp(year, 4, 12);
export const cableSplit = (year: number) => lramp(year, 25, 50);
export const copperGreen = (year: number) => lramp(year, 55, 200);
export const cableFragment = (year: number) => lramp(year, 90, 300);
export const cableGone = (year: number) => lramp(year, 300, 900);

// ---------- Velador ----------

export const fabricStains = (year: number) => lramp(year, 0.2, 1.2);
export const fabricTorn = (year: number) => lramp(year, 4, 10);
export const fabricGone = (year: number) => lramp(year, 36, 50);
export const lampRust = (year: number) => lramp(year, 50, 200);
export const lampGone = (year: number) => lramp(year, 250, 900);

// ---------- Libro ----------

export const paperYellow = (year: number) => lramp(year, 0.05, 1.2);
export const pageWave = (year: number) => lramp(year, 0.3, 11);
export const bookSwell = (year: number) => lramp(year, 7, 11);
export const bookFlake = (year: number) => lramp(year, 30, 50);

// ---------- Botella PET ----------

export const bottleFill = (year: number) => 0.5 - 0.25 * lramp(year, 0.03, 1) - 0.25 * lramp(year, 1, 10);
export const bottleFade = (year: number) => lramp(year, 15, 50);
export const bottleDeform = (year: number) => lramp(year, 60, 200);
export const bottleGone = (year: number) => lramp(year, 500, 900);

// ---------- Mesa de luz ----------

export const laminatePeel = (year: number) => lramp(year, 5, 11);
export const tableSwell = (year: number) => lramp(year, 20, 42);
export const debrisMoss = (year: number) => lramp(year, 50, 120);
export const debrisBuried = (year: number) => lramp(year, 80, 200);
