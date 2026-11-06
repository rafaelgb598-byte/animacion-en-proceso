import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../character/Character";
import { arm, FACES, leg, standing } from "../character/presets";
import { computeRig, type Pose, type Rig } from "../character/rig";
import { CharacterV2, rigV2 } from "../character/v2/CharacterV2";
import { FACE, statePose } from "../character/v2/acting";
import { HEAD_SCALE } from "../character/v2/style";

/**
 * PROPUESTA — Tomi actual vs Tomi V2.
 * Tres vistas por versión: frontal neutral, tres cuartos con sonrisa irónica y cuerpo completo.
 * Misma escala en ambas filas para que se lea la diferencia de proporciones.
 */

export const SHEET_W = 2160;
export const SHEET_H = 2120;

const FONT = "'Segoe UI', 'Arial', sans-serif";
const INK = "#1F1A24";
const ROW_Y = [210, 1190];
const ROW_H = 900;
const COL_X = [60, 760, 1460];
const COL_W = 640;

type Variant = "v1" | "v2";
const rigOf = (v: Variant, p: Pose): Rig => (v === "v1" ? computeRig(p) : rigV2(p));
const Draw: React.FC<{ v: Variant; p: Pose; uid: string }> = ({ v, p, uid }) =>
  v === "v1" ? <Character pose={p} uid={uid} /> : <CharacterV2 pose={p} uid={uid} />;

/* ------------------------------ poses de la hoja ------------------------------ */

const frontal = (v: Variant): Pose => {
  const p = standing(0, 0, 1);
  return {
    ...p,
    bodyTurn: 0,
    headTurn: 0,
    headTilt: 0,
    armFront: arm({ shoulder: -6, elbow: 6 }),
    armBack: arm({ shoulder: -6, elbow: 6 }),
    face: v === "v1" ? { ...FACES.neutral } : { ...FACE.neutral, mouthSkew: 0.1 },
  };
};

const threeQuarter = (v: Variant): Pose => {
  const p = standing(0, 0, 1);
  return {
    ...p,
    bodyTurn: 1,
    headTurn: 0.85,
    headTilt: -5,
    face: v === "v1" ? { ...FACES.ironic, lookX: -0.3 } : { ...FACE.ironico, lookX: -0.35, lookY: 0.05 },
  };
};

const fullBody = (v: Variant): Pose =>
  v === "v1"
    ? {
        ...standing(0, 0, 1),
        lean: -2,
        headTilt: -6,
        headTurn: 0.75,
        armBack: arm({ hand: "fist", ik: { x: 56, y: -44, space: "hip", weight: 1, bend: -1 } }),
        legFront: leg({ hip: -8, knee: 2 }),
        legBack: leg({ hip: 9, knee: 10 }),
        face: { ...FACES.ironic, lookX: -0.35 },
      }
    : statePose("ironico", 0, 0, 1);

/* ------------------------------ celdas ------------------------------ */

/** recorte de busto: centrado en la cabeza, misma escala para V1 y V2 (anclado al cuello) */
const Bust: React.FC<{ v: Variant; pose: Pose; x: number; y: number; uid: string }> = ({ v, pose, x, y, uid }) => {
  const rig = rigOf(v, pose);
  const cx = rig.neck.x;
  const cy = rig.neck.y - 70;
  const w = 330;
  const h = (w * ROW_H) / COL_W;
  return (
    <svg x={x} y={y} width={COL_W} height={ROW_H} viewBox={`${cx - w / 2} ${cy - h * 0.45} ${w} ${h}`}>
      <Draw v={v} p={pose} uid={uid} />
    </svg>
  );
};

const Full: React.FC<{ v: Variant; pose: Pose; x: number; y: number; uid: string }> = ({ v, pose, x, y, uid }) => {
  const rig = rigOf(v, pose);
  // altura total en unidades locales (piso = 0): cabeza arriba del todo
  const headR = v === "v1" ? 84 : 84 * HEAD_SCALE;
  const top = rig.headCenter.y - headR - 40;
  const s = 1.32;
  const floorY = y + ROW_H - 40;
  const headH = headR * 2 * s;
  const totalH = -top * s - 40 * s;
  return (
    <g>
      <ellipse cx={x + COL_W / 2} cy={floorY + 4} rx={110} ry={16} fill="#000" opacity={0.1} />
      <g transform={`translate(${x + COL_W / 2},${floorY}) scale(${s})`}>
        <Draw v={v} p={pose} uid={uid} />
      </g>
      {/* guía de "cabezas": proporción cabeza / altura total */}
      <g opacity={0.55}>
        {Array.from({ length: Math.ceil(totalH / headH) + 1 }, (_, i) => (
          <line key={i} x1={x + 30} x2={x + 70} y1={floorY - i * headH} y2={floorY - i * headH} stroke={INK} strokeWidth={3} />
        ))}
        <line x1={x + 50} x2={x + 50} y1={floorY} y2={floorY - totalH} stroke={INK} strokeWidth={2} strokeDasharray="6 6" />
      </g>
      <text x={x + 30} y={floorY + 40} fontFamily={FONT} fontSize={26} fill={INK} opacity={0.75}>
        {`${(totalH / headH).toFixed(1)} cabezas de alto`}
      </text>
    </g>
  );
};

const Label: React.FC<{ x: number; y: number; children: string; size?: number; color?: string; weight?: number }> = ({
  x,
  y,
  children,
  size = 34,
  color = INK,
  weight = 700,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={size} fontWeight={weight} fill={color}>
    {children}
  </text>
);

export const PropuestaPersonaje: React.FC = () => {
  const rows: { v: Variant; title: string; color: string }[] = [
    { v: "v1", title: "ACTUAL", color: "#8A7F74" },
    { v: "v2", title: "V2 · PROPUESTA", color: "#1E9C8E" },
  ];
  const cols = ["Frontal · neutral", "Tres cuartos · sonrisa irónica", "Cuerpo completo"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EBDA" }}>
      <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}>
        <Label x={60} y={84} size={54} weight={900}>
          Tomi — evolución del diseño
        </Label>
        <Label x={980} y={84} size={30} weight={400} color="#5A5048">
          misma escala en ambas filas · mismo rig y mismas poses
        </Label>
        {rows.map((r, ri) => (
          <g key={r.v}>
            <rect x={40} y={ROW_Y[ri] - 10} width={SHEET_W - 80} height={ROW_H + 40} rx={28} fill={ri === 1 ? "#FFF8EE" : "#EFE3D1"} stroke={r.color} strokeWidth={4} />
            <rect x={40} y={ROW_Y[ri] - 72} width={330} height={52} rx={18} fill={r.color} />
            <Label x={64} y={ROW_Y[ri] - 34} size={30} color="#FFFFFF" weight={900}>
              {r.title}
            </Label>
            <Bust v={r.v} pose={frontal(r.v)} x={COL_X[0]} y={ROW_Y[ri] + 30} uid={`pf${r.v}`} />
            <Bust v={r.v} pose={threeQuarter(r.v)} x={COL_X[1]} y={ROW_Y[ri] + 30} uid={`pt${r.v}`} />
            <Full v={r.v} pose={fullBody(r.v)} x={COL_X[2]} y={ROW_Y[ri]} uid={`pb${r.v}`} />
            <Label x={COL_X[2] + 300} y={ROW_Y[ri] + 30} size={26} weight={600} color="#5A5048">
              {cols[2]}
            </Label>
            {[0, 1].map((ci) => (
              <Label key={ci} x={COL_X[ci] + 20} y={ROW_Y[ri] + 30} size={26} weight={600} color="#5A5048">
                {cols[ci]}
              </Label>
            ))}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
