import React from "react";
import { CHALK } from "./Cafe";

const L = "#2A2024";

/**
 * Vaso de café de papel. Origen = centro de la base.
 * sx/sy permiten squash & stretch también en los objetos.
 */
export const Cup: React.FC<{
  h: number;
  letter: string;
  sx?: number;
  sy?: number;
  rot?: number;
  sleeve?: string;
  dim?: number; // 0..1 lo "apaga" (desplazado visualmente)
  steam?: number; // fotograma para animar el vapor; undefined = sin vapor
}> = ({ h, letter, sx = 1, sy = 1, rot = 0, sleeve = "#B5835A", dim = 0, steam }) => {
  const top = h * 0.36;
  const bot = h * 0.26;
  const bodyH = h * 0.86;
  const at = (t: number) => bot + (top - bot) * t; // semiancho a la altura t
  const s1 = 0.24;
  const s2 = 0.6;
  return (
    <g
      transform={`rotate(${rot}) scale(${sx},${sy})`}
      style={{ filter: dim > 0 ? `grayscale(${dim}) brightness(${1 - dim * 0.12})` : undefined }}
      opacity={1 - dim * 0.35}
    >
      {steam !== undefined ? <Steam f={steam} y={-h - 18} w={top} /> : null}
      <path
        d={`M ${-bot} 0 L ${-top} ${-bodyH} L ${top} ${-bodyH} L ${bot} 0 Z`}
        fill="#FBF7F0"
        stroke={L}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* sombra del costado */}
      <path d={`M ${bot * 0.55} -3 L ${top * 0.55} ${-bodyH + 3} L ${top - 4} ${-bodyH + 3} L ${bot - 3} -3 Z`} fill="#E6DCCB" />
      {/* faja de cartón */}
      <path
        d={`M ${-at(s1)} ${-bodyH * s1} L ${-at(s2)} ${-bodyH * s2} L ${at(s2)} ${-bodyH * s2} L ${at(s1)} ${-bodyH * s1} Z`}
        fill={sleeve}
        stroke={L}
        strokeWidth={5.5}
        strokeLinejoin="round"
      />
      <text
        x={0}
        y={-bodyH * ((s1 + s2) / 2) + h * 0.075}
        textAnchor="middle"
        fontFamily={CHALK}
        fontWeight={700}
        fontSize={h * 0.2}
        fill="#FBF7F0"
      >
        {letter}
      </text>
      {/* tapa */}
      <rect x={-top - 7} y={-bodyH - 16} width={top * 2 + 14} height={18} rx={8} fill="#F1ECE4" stroke={L} strokeWidth={5.5} />
      <path
        d={`M ${-top + 2} ${-bodyH - 16} Q ${-top + 6} ${-h - 4} 0 ${-h - 4} Q ${top - 6} ${-h - 4} ${top - 2} ${-bodyH - 16}`}
        fill="#F1ECE4"
        stroke={L}
        strokeWidth={5.5}
        strokeLinejoin="round"
      />
      <path d={`M ${-top * 0.6} ${-bodyH + 26} L ${-top * 0.66} ${-bodyH * 0.7}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
    </g>
  );
};

/** Vapor: tres hilos que suben ondulando. */
export const Steam: React.FC<{ f: number; y: number; w: number }> = ({ f, y, w }) => (
  <g opacity={0.55}>
    {[-1, 0, 1].map((i) => {
      const ph = f * 0.12 + i * 2.1;
      const rise = ((f * 1.2 + i * 17) % 40) / 40;
      const x = i * w * 0.45;
      return (
        <path
          key={i}
          d={`M ${x} ${y - rise * 20} q ${8 * Math.sin(ph)} -18 0 -34 q ${-8 * Math.sin(ph + 1)} -18 0 -34`}
          stroke="#FFFFFF"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          opacity={1 - rise * 0.8}
        />
      );
    })}
  </g>
);

/** Pizarrita de precio colgada del borde del mostrador. Origen = punto central del borde. */
export const PriceTag: React.FC<{
  price: string;
  scale?: number;
  rot?: number;
  highlight?: number; // subrayado de tiza 0..1
  dim?: number;
}> = ({ price, scale = 1, rot = 0, highlight = 0, dim = 0 }) => (
  <g
    transform={`rotate(${rot}) scale(${scale})`}
    style={{ filter: dim > 0 ? `grayscale(${dim})` : undefined }}
    opacity={1 - dim * 0.3}
  >
    <path d="M -40 -4 L -40 20 M 40 -4 L 40 20" stroke="#2A2024" strokeWidth={4} strokeLinecap="round" />
    <circle cx={-40} cy={-4} r={5} fill="#C9A15A" stroke="#2A2024" strokeWidth={3} />
    <circle cx={40} cy={-4} r={5} fill="#C9A15A" stroke="#2A2024" strokeWidth={3} />
    <rect x={-66} y={16} width={132} height={84} rx={12} fill="#7A4D33" stroke={L} strokeWidth={5} />
    <rect x={-56} y={25} width={112} height={66} rx={7} fill="#2F3B36" />
    <text x={0} y={72} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={40} fill="#F4EFE3">
      {price}
    </text>
    {highlight > 0 ? (
      <path
        d={`M -42 82 Q 0 ${86 + highlight * 2} ${-42 + 84 * highlight} 82`}
        stroke="#E9B44C"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    ) : null}
  </g>
);
