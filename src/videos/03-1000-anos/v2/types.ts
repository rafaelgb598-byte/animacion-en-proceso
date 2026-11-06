import type React from "react";
import type { LabelKey } from "./timeline";

/** Toda pieza de escena recibe el año continuo y el frame (solo para micro-movimiento). */
export type SceneBaseProps = { year: number; frame: number };

export type SceneLayer = "sky" | "wall" | "main" | "front";

export type SceneItem = {
  id: string;
  layer: SceneLayer;
  render: (p: SceneBaseProps) => React.ReactNode;
};

export type LightRig = {
  /** Centro y radio del foco cálido del velador (año 0). */
  lampPool: { x: number; y: number; r: number };
  /** Ventana: origen del haz diagonal. */
  window: { x: number; y: number; w: number; h: number };
  /** Polígono del haz en el piso (puntos x,y). */
  beam: readonly (readonly [number, number])[];
  /** Brillo de la pantalla encendida. */
  screenGlow: { x: number; y: number; r: number };
};

export type SfxCue = { file: string; from: number; durationInFrames: number; volume: number | ((f: number) => number) };

export type VoicePhrase = { text: string; start: number; end: number };
export type VoiceSegment = { id: string; from: number; file: string; duration: number; phrases: readonly VoicePhrase[]; subtitles: boolean };

export type Episode = {
  /** Narración (opcional): segmentos con frame de entrada y frases con tiempos en segundos. */
  voice?: readonly VoiceSegment[];
  id: string;
  hook: readonly string[][];
  labels: Record<LabelKey, string>;
  winner: { kicker: string; name: string; figure: string; foot: string; after: string };
  zoomTarget: { x: number; y: number };
  /** Posición en pantalla del ganador al terminar el acercamiento. */
  zoomScreen: { x: number; y: number };
  scene: readonly SceneItem[];
  light: LightRig;
};
