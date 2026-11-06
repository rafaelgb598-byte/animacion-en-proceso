/**
 * Mapa de tiempos del Short, derivado de la narración real (words.ts).
 * Todo se expresa en fotogramas a 30 fps. Si se regenera la voz, se actualizan estos números.
 */

export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);
/** 45,36 s de voz + una pausa final que cierra el loop */
export const DURATION = 1392;

/** palabras clave (inicio de la palabra) */
export const CUE = {
  rapido: F(1.28),
  tres: F(2.88),
  siete: F(5.04),
  mira: F(6.32),
  agrego: F(7.48),
  mediano: F(7.92),
  seis: F(8.88),
  deRepente: F(10.39),
  ganga: F(12.2),
  son: F(12.93),
  cincuenta: F(13.44),
  pero: F(15.27),
  grande2: F(16.16),
  nunca: F(17.34),
  cambio: F(18.77),
  comparas: F(19.84),
  esto: F(21.0),
  efecto: F(21.68),
  anio: F(23.28),
  huber: F(25.16),
  sumar: F(26.88),
  tercera: F(27.52),
  menos: F(28.64),
  cambiar: F(30.0),
  cafes: F(32.56),
  entradas: F(34.92),
  suscripciones: F(36.08),
  truco: F(37.12),
  medio: F(39.24),
  mejor: F(41.28),
  tapa: F(42.48),
  mediano2: F(42.96),
  seguis: F(43.92),
  grandeFin: F(44.72),
};

/** escenas: café (A), pizarrón, café (B) */
export const SCENE = {
  boardIn: 632,
  boardOut: 1112,
};

export type SfxName =
  | "pasos"
  | "vaso-apoyo"
  | "pop-aparicion"
  | "whoosh"
  | "tic-precio"
  | "sorpresa"
  | "revelacion"
  | "servilleta";

/** efectos sincronizados por fotograma (volumen relativo a la voz) */
export const SFX: { name: SfxName; at: number; volume: number; dur?: number }[] = [
  { name: "tic-precio", at: CUE.tres, volume: 0.9 },
  { name: "tic-precio", at: CUE.siete, volume: 0.9 },
  { name: "pop-aparicion", at: CUE.mediano - 6, volume: 0.2 },
  { name: "vaso-apoyo", at: CUE.mediano + 2, volume: 0.95 },
  { name: "tic-precio", at: CUE.seis, volume: 0.9 },
  { name: "whoosh", at: 302, volume: 0.32 },
  { name: "sorpresa", at: CUE.son, volume: 0.4 },
  { name: "tic-precio", at: CUE.cincuenta, volume: 0.9 },
  { name: "revelacion", at: CUE.nunca - 2, volume: 0.55 },
  { name: "whoosh", at: CUE.cambio + 2, volume: 0.22 },
  { name: "whoosh", at: SCENE.boardIn - 4, volume: 0.42 },
  { name: "tic-precio", at: CUE.huber, volume: 0.8 },
  { name: "pop-aparicion", at: CUE.tercera, volume: 0.16 },
  { name: "tic-precio", at: CUE.cambiar, volume: 0.8 },
  { name: "whoosh", at: CUE.entradas - 4, volume: 0.22 },
  { name: "whoosh", at: SCENE.boardOut - 4, volume: 0.42 },
  { name: "tic-precio", at: CUE.medio, volume: 0.85 },
  { name: "tic-precio", at: CUE.mejor, volume: 0.85 },
  { name: "pasos", at: 1232, volume: 0.45, dur: 30 },
  { name: "servilleta", at: CUE.mediano2 - 8, volume: 1 },
  { name: "whoosh", at: 1296, volume: 0.3 },
  { name: "vaso-apoyo", at: 1318, volume: 0.55 },
  { name: "pasos", at: 1302, volume: 0.4, dur: 26 },
];

/**
 * Altura del centro del bloque de subtítulos: centrado, un toque por debajo del medio,
 * salvo en los planos de detalle de precios, donde baja para no tapar los carteles.
 */
export const captionY = (f: number) => {
  if (f >= 58 && f < 156) return 1600; // detalle de precios chico/grande
  if (f >= 232 && f < 296) return 1560; // cae el mediano
  if (f >= 500 && f < 560) return 1620; // revelación US$7
  if (f >= SCENE.boardIn && f < SCENE.boardOut) return 1150; // pizarrón
  return 1060;
};
