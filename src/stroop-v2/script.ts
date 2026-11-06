import type { CardSpec } from "../stroop/script";

/**
 * GiroDato · Stroop V2 — datos del desafío (tres niveles).
 * Nivel 1: coinciden · Nivel 2: no coinciden, ritmo cómodo · Nivel 3: no coinciden, más rápido.
 * Regla: en los niveles 2 y 3 ninguna tinta coincide con su palabra y ninguna tinta se repite seguida.
 */

export type Level = { id: 1 | 2 | 3; label: string; cards: CardSpec[] };

/**
 * Tiempos pensados para decir el color en voz alta (decir «amarillo» lleva ~0,6 s):
 * nivel 1 · 1,2 s · nivel 2 · 1,4 s (la primera contradicción necesita tiempo) · nivel 3 · 1,13 → 0,87 s.
 */
export const LEVELS: Level[] = [
  {
    id: 1,
    label: "NIVEL 1 · FÁCIL",
    cards: [
      { word: "AMARILLO", ink: "yellow", dur: 36 },
      { word: "AZUL", ink: "blue", dur: 36 },
      { word: "ROJO", ink: "red", dur: 36 },
    ],
  },
  {
    id: 2,
    label: "NIVEL 2",
    cards: [
      { word: "AZUL", ink: "yellow", dur: 42 },
      { word: "ROJO", ink: "blue", dur: 42 },
      { word: "BLANCO", ink: "red", dur: 42 },
    ],
  },
  {
    id: 3,
    label: "NIVEL 3 · RÁPIDO",
    cards: [
      { word: "AMARILLO", ink: "white", dur: 34 },
      { word: "ROJO", ink: "yellow", dur: 32 },
      { word: "BLANCO", ink: "blue", dur: 30 },
      { word: "AZUL", ink: "red", dur: 28 },
      { word: "BLANCO", ink: "yellow", dur: 26 },
      { word: "ROJO", ink: "blue", dur: 26 },
    ],
  },
];

/** tarjeta de ejemplo de la apertura (enseña la regla; es la misma que se explica al final) */
export const EXAMPLE = { word: "ROJO", ink: "blue", answer: "AZUL" } as const;

/** la última tarjeta (la que se congela y se explica) */
export const LAST_CARD = LEVELS[2].cards[LEVELS[2].cards.length - 1];
