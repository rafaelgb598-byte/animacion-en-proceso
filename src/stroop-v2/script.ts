import type { CardSpec } from "../stroop/script";

/**
 * GiroDato · Stroop V2 — datos del desafío (tres niveles).
 * Nivel 1: coinciden · Nivel 2: no coinciden, ritmo cómodo · Nivel 3: no coinciden, más rápido.
 * Regla: en los niveles 2 y 3 ninguna tinta coincide con su palabra y ninguna tinta se repite seguida.
 */

export type Level = { id: 1 | 2 | 3; label: string; cards: CardSpec[] };

export const LEVELS: Level[] = [
  {
    id: 1,
    label: "NIVEL 1 · FÁCIL",
    cards: [
      { word: "AZUL", ink: "blue", dur: 22 },
      { word: "ROJO", ink: "red", dur: 22 },
      { word: "AMARILLO", ink: "yellow", dur: 22 },
      { word: "BLANCO", ink: "white", dur: 22 },
    ],
  },
  {
    id: 2,
    label: "NIVEL 2",
    cards: [
      { word: "AZUL", ink: "yellow", dur: 36 },
      { word: "ROJO", ink: "blue", dur: 36 },
      { word: "BLANCO", ink: "red", dur: 36 },
    ],
  },
  {
    id: 3,
    label: "NIVEL 3 · RÁPIDO",
    cards: [
      { word: "AMARILLO", ink: "white", dur: 30 },
      { word: "ROJO", ink: "yellow", dur: 28 },
      { word: "BLANCO", ink: "blue", dur: 26 },
      { word: "AZUL", ink: "red", dur: 26 },
      { word: "BLANCO", ink: "yellow", dur: 24 },
      { word: "ROJO", ink: "blue", dur: 24 },
    ],
  },
];

/** la última tarjeta (la que se congela y se explica) */
export const LAST_CARD = LEVELS[2].cards[LEVELS[2].cards.length - 1];
