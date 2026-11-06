import React from "react";
import { spring } from "remotion";
import { CARD, wordSize } from "./WordCard";
import { FONTS, STROOP } from "../../escenarios/mesa/theme";

/**
 * Explicación: la última tarjeta se separa en dos capas — la PALABRA (leer: automático) y la
 * TINTA (nombrar el color: esfuerzo). Las dos flechas chocan en el centro y gana la lectura.
 */

export type DiagramTimes = { split: number; read: number; name: number; clash: number; winner: number; out: number };

export const LAYER_A = { x: 300, y: 580 }; // capa palabra
export const LAYER_B = { x: 690, y: 940 }; // capa tinta
const A = LAYER_A;
const B = LAYER_B;
const C = { x: CARD.cx, y: CARD.cy }; // choque
export const LAYER = { w: 340, h: 160 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

const Arrow: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; t: number; color: string; width: number }> = ({ from, to, t, color, width }) => {
  if (t <= 0) return null;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const a = Math.atan2(to.y - from.y, to.x - from.x);
  const h = 26;
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      <line x1={from.x} y1={from.y} x2={x} y2={y} />
      <path d={`M ${x - h * Math.cos(a - 0.5)} ${y - h * Math.sin(a - 0.5)} L ${x} ${y} L ${x - h * Math.cos(a + 0.5)} ${y - h * Math.sin(a + 0.5)}`} strokeLinejoin="round" />
    </g>
  );
};

const Burst: React.FC<{ t: number }> = ({ t }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g opacity={Math.sin(Math.PI * t)}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r0 = 30 + 60 * t;
        const r1 = r0 + 40 + (i % 2) * 24;
        return <line key={i} x1={C.x + Math.cos(a) * r0} y1={C.y + Math.sin(a) * r0} x2={C.x + Math.cos(a) * r1} y2={C.y + Math.sin(a) * r1} stroke="#FFD84A" strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const InterferenceDiagram: React.FC<{ f: number; word: string; ink: string; times: DiagramTimes; fps?: number }> = ({ f, word, ink, times, fps = 30 }) => {
  if (f < times.split || f >= times.out + 10) return null;
  const sp = spring({ frame: f - times.split, fps, config: { damping: 15, stiffness: 140, mass: 0.7 } });
  const leave = ramp(f, times.out, times.out + 10);
  const op = 1 - leave;
  const pa = { x: C.x + (A.x - C.x) * sp, y: C.y + (A.y - C.y) * sp };
  const pb = { x: C.x + (B.x - C.x) * sp, y: C.y + (B.y - C.y) * sp };
  const cardOp = 1 - ramp(f, times.split, times.split + 8);
  const tRead = ramp(f, times.read + 4, times.read + 12); // rápida: automática
  const tName = ramp(f, times.name + 4, times.name + 30); // lenta: esfuerzo
  const clashT = ramp(f, times.clash - 8, times.clash);
  const burst = (f - times.clash) / 14;
  const win = ramp(f, times.winner, times.winner + 8);
  const fromA = { x: pa.x + LAYER.w / 2 - 20, y: pa.y + 30 };
  const fromB = { x: pb.x - LAYER.w / 2 + 20, y: pb.y - 30 };
  // las flechas avanzan hasta su etiqueta; al chocar llegan al centro
  const tipA = { x: fromA.x + (C.x - 24 - fromA.x) * Math.max(tRead * 0.7, clashT), y: fromA.y + (C.y - 18 - fromA.y) * Math.max(tRead * 0.7, clashT) };
  const tipB = { x: fromB.x + (C.x + 24 - fromB.x) * Math.max(tName * 0.6, clashT), y: fromB.y + (C.y + 18 - fromB.y) * Math.max(tName * 0.6, clashT) };
  const size = wordSize(word) * 0.62;
  return (
    <g opacity={op}>
      {/* la tarjeta original se disuelve mientras se separan las capas */}
      {cardOp > 0 ? (
        <g opacity={cardOp} transform={`translate(${C.x},${C.y})`}>
          <rect x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={CARD.h} rx={STROOP.cardRadius} fill={STROOP.card} stroke={STROOP.cardEdge} strokeWidth={3} />
        </g>
      ) : null}

      {/* capa PALABRA */}
      <g transform={`translate(${pa.x},${pa.y})`}>
        <rect x={-LAYER.w / 2} y={-LAYER.h / 2} width={LAYER.w} height={LAYER.h} rx={22} fill={STROOP.card} stroke={win > 0 ? "#FFD84A" : STROOP.cardEdge} strokeWidth={3 + 3 * win} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={size} letterSpacing={-2} fill="none" stroke={STROOP.text} strokeWidth={4}>
          {word}
        </text>
        <text x={0} y={LAYER.h / 2 + 48} textAnchor="middle" fontFamily={FONTS.mono} fontSize={30} fill={STROOP.text} opacity={ramp(f, times.read - 2, times.read + 6)}>
          leer: automático
        </text>
      </g>

      {/* capa TINTA */}
      <g transform={`translate(${pb.x},${pb.y})`} opacity={1 - 0.45 * win}>
        <rect x={-LAYER.w / 2} y={-LAYER.h / 2} width={LAYER.w} height={LAYER.h} rx={22} fill={STROOP.card} stroke={STROOP.cardEdge} strokeWidth={3} />
        <path transform="scale(0.88)" d="M -110 -20 C -90 -60, 40 -70, 100 -36 C 140 -10, 120 40, 60 50 C -10 62, -120 52, -126 14 C -128 -4, -120 -12, -110 -20 Z" fill={ink} />
        <text x={0} y={LAYER.h / 2 + 46} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={STROOP.text} opacity={ramp(f, times.name - 2, times.name + 6)}>
          nombrar el color: esfuerzo
        </text>
      </g>

      <Arrow from={fromA} to={tipA} t={Math.max(tRead, clashT) > 0 ? 1 : 0} color={win > 0 ? "#FFD84A" : STROOP.text} width={7 + 3 * win} />
      <Arrow from={fromB} to={tipB} t={Math.max(tName, clashT) > 0 ? 1 : 0} color={STROOP.textDim} width={7} />
      <Burst t={burst} />
    </g>
  );
};

