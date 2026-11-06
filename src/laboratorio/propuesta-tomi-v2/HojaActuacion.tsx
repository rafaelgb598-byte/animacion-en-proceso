import React from "react";
import { AbsoluteFill } from "remotion";
import { CharacterV2 } from "../../canal/personaje/tomi-v2/CharacterV2";
import { statePose, type ActState } from "../../canal/personaje/tomi-v2/acting";

/** PROPUESTA — estados de actuación de Tomi V2 (pose clave de cada uno). */

export const ACT_W = 2160;
export const ACT_H = 1640;
const FONT = "'Segoe UI', 'Arial', sans-serif";
const INK = "#1F1A24";

const CELLS: { s: ActState; title: string; note: string }[] = [
  { s: "pensando", title: "Pensando", note: "mano al mentón · mirada arriba" },
  { s: "duda", title: "Decidiendo 1 · duda", note: "hombros arriba · palmas abiertas" },
  { s: "firme", title: "Decidiendo 2 · gesto firme", note: "puño · se inclina hacia adelante" },
  { s: "sorpresa", title: "Sorpresa", note: "salto atrás · ojos abiertos" },
  { s: "sospecha", title: "Sospecha", note: "ceja arriba · ojos entrecerrados" },
  { s: "incredulidad", title: "Incredulidad", note: "se acerca · «¿en serio?»" },
  { s: "eureka", title: "Eureka", note: "índice arriba · cara de «¡ya está!»" },
  { s: "celebracion", title: "Celebración", note: "puños arriba · salto corto" },
];

export const HojaActuacion: React.FC = () => {
  const cw = ACT_W / 4;
  const ch = 760;
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EBDA" }}>
      <svg width={ACT_W} height={ACT_H} viewBox={`0 0 ${ACT_W} ${ACT_H}`}>
        <text x={50} y={70} fontFamily={FONT} fontSize={48} fontWeight={900} fill={INK}>
          Tomi V2 — estados de actuación
        </text>
        {CELLS.map((c, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x0 = col * cw;
          const y0 = 100 + row * ch;
          const floor = y0 + ch - 110;
          return (
            <g key={c.s}>
              <rect x={x0 + 14} y={y0 + 6} width={cw - 28} height={ch - 20} rx={24} fill="#FFF8EE" stroke="#D9C8AE" strokeWidth={3} />
              <ellipse cx={x0 + cw / 2} cy={floor + 4} rx={95} ry={14} fill="#000" opacity={0.1} />
              <CharacterV2 pose={statePose(c.s, x0 + cw / 2, floor, 0.86)} uid={`act${i}`} />
              <text x={x0 + cw / 2} y={floor + 52} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={INK}>
                {c.title}
              </text>
              <text x={x0 + cw / 2} y={floor + 88} textAnchor="middle" fontFamily={FONT} fontSize={23} fill="#6A5F55">
                {c.note}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
