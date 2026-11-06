import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../../canal/personaje/tomi-v1/Character";
import { withWalk } from "../../canal/personaje/motion";
import { arm, FACES, leg, standing } from "../../canal/personaje/presets";
import type { Pose } from "../../canal/personaje/rig";

/** FASE 1 — Hoja de diseño: el mismo personaje en tres poses clave. */

const FLOOR = 900;
const S = 1.25;

const walking = (): Pose => {
  const p = standing(330, FLOOR, S);
  return withWalk(
    { ...p, face: { ...FACES.curious, smile: 0.45, lookX: 0.6, lookY: 0.1 }, headTilt: -2 },
    0.25,
    1,
  );
};

const doubt = (): Pose => {
  const p = standing(960, FLOOR, S);
  return {
    ...p,
    lean: -3,
    headTurn: 0.35,
    headTilt: -10,
    legFront: leg({ hip: -6, knee: 3 }),
    legBack: leg({ hip: 8, knee: 6 }),
    armFront: arm({ hand: "chin", ik: { x: 4, y: 6, space: "chin", weight: 1, bend: 1 } }),
    armBack: arm({ hand: "fist", ik: { x: 56, y: -44, space: "hip", weight: 1, bend: -1 } }),
    face: { ...FACES.doubt, lookX: -0.55, lookY: -0.75 },
  };
};

const pointing = (): Pose => {
  const p = standing(1530, FLOOR, S);
  return {
    ...p,
    lean: 7,
    squash: 1.03,
    headTilt: 6,
    legFront: leg({ hip: 10, knee: 6 }),
    legBack: leg({ hip: -12, knee: 4, foot: 6 }),
    armFront: arm({ hand: "point", wrist: -6, ik: { x: 1950, y: 560, space: "scene", weight: 1, bend: 1 } }),
    armBack: arm({ shoulder: -28, elbow: 40, hand: "open" }),
    face: { ...FACES.oh, lookX: 1, lookY: 0.1 },
  };
};

const Label: React.FC<{ x: number; n: string; title: string }> = ({ x, n, title }) => (
  <g transform={`translate(${x},1000)`}>
    <text textAnchor="middle" fontFamily="'Segoe Print', 'Comic Sans MS', cursive" fontWeight={700} fontSize={40} fill="#3A2A22">
      {n} · {title}
    </text>
  </g>
);

export const PoseSheet: React.FC = () => {
  const poses = [walking(), doubt(), pointing()];
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6E7CF" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <rect x={0} y={FLOOR} width={1920} height={180} fill="#E9D3B2" />
        <line x1={0} x2={1920} y1={FLOOR} y2={FLOOR} stroke="#C9A97F" strokeWidth={4} />
        {poses.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={FLOOR + 4} rx={90} ry={14} fill="#000" opacity={0.12} />
        ))}
        {poses.map((p, i) => (
          <Character key={i} pose={p} uid={`sheet${i}`} />
        ))}
        <Label x={330} n="1" title="Caminar" />
        <Label x={960} n="2" title="Duda" />
        <Label x={1530} n="3" title="Sorpresa + señalar" />
        <text x={60} y={90} fontFamily="'Segoe Print', 'Comic Sans MS', cursive" fontWeight={700} fontSize={52} fill="#2BB3A3">
          Tomi — hoja de poses
        </text>
      </svg>
    </AbsoluteFill>
  );
};
