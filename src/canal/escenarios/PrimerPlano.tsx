import React from "react";
import { CARRIL } from "../zonaSegura";

/**
 * Mostrador / mesa en PRIMER PLANO (capa escenario, fija en pantalla): tapa la parte de abajo del cuadro para que el
 * carril de subtítulos quede sobre madera o mesa y no sobre el cuerpo de Tomi. No mueve a Tomi ni la cámara.
 * Borde superior por defecto en y = 1288 (= parte de arriba del carril, 1300, menos el margen de 12 px del QA).
 */
export const BORDE_PRIMER_PLANO = 1288;

export type EstiloPrimerPlano = {
  tapa: string;
  brilloTapa: number;
  frente: string;
  panel: string;
  lineaPanel: string;
  base: string;
  linea: string;
  /** paneles del frente (madera) o frente liso (mesa) */
  paneles: boolean;
};

export const PRIMER_PLANO_CAFE: EstiloPrimerPlano = {
  tapa: "#E9E6E0",
  brilloTapa: 0.5,
  frente: "#4E3224",
  panel: "#5A3B2B",
  lineaPanel: "#3A261B",
  base: "#2A1B13",
  linea: "#2A2024",
  paneles: true,
};
export const PRIMER_PLANO_MESA: EstiloPrimerPlano = {
  tapa: "#2A2520",
  brilloTapa: 0.08,
  frente: "#1A1714",
  panel: "#1A1714",
  lineaPanel: "#1A1714",
  base: "#0B0A09",
  linea: "#3A322B",
  paneles: false,
};

export const PrimerPlano: React.FC<{ estilo: EstiloPrimerPlano; borde?: number; w?: number; h?: number; uid: string }> = ({
  estilo: E,
  borde = BORDE_PRIMER_PLANO,
  w = 1080,
  h = 1920,
  uid,
}) => {
  if (borde > CARRIL.bottom - 212) throw new Error(`PrimerPlano: el borde (${borde}) tiene que quedar en y ≤ 1288`);
  const tapa = 30;
  return (
    <g>
      <defs>
        <linearGradient id={`pp${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={E.frente} />
          <stop offset="1" stopColor={E.base} />
        </linearGradient>
      </defs>
      {/* sombra que proyecta sobre lo que está detrás */}
      <rect x={-20} y={borde - 18} width={w + 40} height={18} fill="#000" opacity={0.18} />
      {/* tapa */}
      <rect x={-20} y={borde} width={w + 40} height={tapa} rx={8} fill={E.tapa} stroke={E.linea} strokeWidth={7} />
      <rect x={-20} y={borde + 8} width={w + 40} height={7} fill="#fff" opacity={E.brilloTapa} />
      {/* frente */}
      <rect x={-20} y={borde + tapa - 4} width={w + 40} height={h - borde} fill={`url(#pp${uid})`} stroke={E.linea} strokeWidth={7} />
      <rect x={-20} y={borde + tapa - 4} width={w + 40} height={22} fill="#000" opacity={0.25} />
      {E.paneles
        ? Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={-60 + i * 220} y={borde + tapa + 40} width={180} height={h} rx={10} fill={E.panel} stroke={E.lineaPanel} strokeWidth={6} />
          ))
        : null}
    </g>
  );
};
