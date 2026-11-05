import React from "react";
import { COLORS as C } from "./presets";
import type { FacePose } from "./rig";

/**
 * Cabeza con rostro paramétrico.
 * Coordenadas locales: centro de la cabeza en (0,0).
 * `turn` desplaza los rasgos para simular el giro (-1 izquierda, 0 frente, 1 tres cuartos derecha).
 */

const LW = 5.5; // grosor de línea

type EyeProps = {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  lookX: number;
  lookY: number;
  pupil: number;
  lid: number;
  lidAngle: number;
  lowerLid: number;
};

const Eye: React.FC<EyeProps> = ({ id, x, y, rx, ry, lookX, lookY, pupil, lid, lidAngle, lowerLid }) => {
  const px = lookX * (rx - 8.5 * pupil) * 0.85;
  const py = lookY * (ry - 8.5 * pupil) * 0.8;
  const lidY = -ry + lid * ry * 2;
  const lowY = ry - lowerLid * ry * 1.3;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <ellipse rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse rx={rx} ry={ry} fill={C.eyeWhite} />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={9 * pupil} fill={C.line} />
        <circle cx={px + 3.2} cy={py - 3.4} r={3 * pupil} fill="#fff" />
        {/* párpado superior */}
        <g transform={`rotate(${lidAngle} 0 ${lidY})`}>
          <rect x={-rx - 10} y={lidY - 60} width={rx * 2 + 20} height={60} fill={C.skin} />
          {lid > 0.04 ? (
            <line x1={-rx - 4} x2={rx + 4} y1={lidY} y2={lidY} stroke={C.line} strokeWidth={4.5} />
          ) : null}
        </g>
        {/* párpado inferior (mejillas al sonreír) */}
        {lowerLid > 0.02 ? (
          <g>
            <ellipse cx={0} cy={lowY + ry * 1.1} rx={rx * 1.6} ry={ry * 1.1} fill={C.skin} />
            <ellipse
              cx={0}
              cy={lowY + ry * 1.1}
              rx={rx * 1.6}
              ry={ry * 1.1}
              fill="none"
              stroke={C.line}
              strokeWidth={4}
            />
          </g>
        ) : null}
      </g>
      <ellipse rx={rx} ry={ry} fill="none" stroke={C.line} strokeWidth={LW} />
    </g>
  );
};

const Brow: React.FC<{ x: number; y: number; angle: number; side: 1 | -1; w: number }> = ({
  x,
  y,
  angle,
  side,
  w,
}) => (
  <path
    d={`M ${-w} 4 Q 0 -5 ${w} 4`}
    transform={`translate(${x},${y}) rotate(${-angle * side})`}
    stroke={C.hair}
    strokeWidth={8.5}
    strokeLinecap="round"
    fill="none"
  />
);

const Mouth: React.FC<{ id: string; x: number; y: number; f: FacePose }> = ({ id, x, y, f }) => {
  const w = 21 * f.mouthWidth;
  const ly = -f.smile * 9 + f.mouthSkew * 5;
  const ry = -f.smile * 9 - f.mouthSkew * 8;
  const up = f.smile * 10 - f.mouthOpen * 5;
  const lo = up + 3 + f.mouthOpen * 40;
  const mid = (ly + ry) / 2;
  const d = `M ${-w} ${ly} Q 0 ${2 * up - mid} ${w} ${ry} Q 0 ${2 * lo - mid} ${-w} ${ly} Z`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={C.mouth} />
      {f.mouthOpen > 0.12 ? (
        <g clipPath={`url(#${id})`}>
          <ellipse cx={0} cy={lo + 2} rx={w * 0.6} ry={6 + f.mouthOpen * 9} fill={C.tongue} />
          {f.smile > 0.4 ? <rect x={-w} y={up - 12} width={w * 2} height={14} fill="#fff" /> : null}
        </g>
      ) : null}
      <path d={d} fill="none" stroke={C.line} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

const Ear: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <g transform={`translate(${x},10) scale(${flip ? -1 : 1},1)`}>
    <ellipse rx={14} ry={19} fill={C.skin} stroke={C.line} strokeWidth={LW} />
    <path d="M 3 -8 Q -5 0 3 8" stroke={C.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

const HAIR =
  "M -91 -6 C -98 -64, -52 -100, 2 -100 C 56 -100, 98 -64, 91 -6 C 88 -34, 76 -54, 56 -60 C 44 -50, 22 -52, 10 -68 C -4 -56, -32 -54, -46 -66 C -64 -58, -84 -40, -91 -6 Z";
const TUFT = "M 0 4 C -6 -20, 12 -42, 30 -36 C 42 -32, 40 -16, 27 -17";

export type HeadProps = {
  uid: string;
  face: FacePose;
  turn: number;
  blink: number;
  hairLag: number;
};

export const Head: React.FC<HeadProps> = ({ uid, face: f, turn, blink, hairLag }) => {
  const fx = turn * 22;
  const spread = 31 * (1 - 0.16 * Math.abs(turn));
  const eyeRx = 16.5 * f.eyeScale;
  const eyeRy = 21.5 * f.eyeScale * blink;
  const farR = 1 - 0.22 * Math.max(0, turn);
  const farL = 1 - 0.22 * Math.max(0, -turn);
  // la oreja del lado cercano se desplaza sobre el cráneo; la lejana se esconde detrás
  const lEarX = -84 + 40 * Math.max(0, -turn) + 30 * Math.max(0, turn);
  const rEarX = 84 - 40 * Math.max(0, turn) - 30 * Math.max(0, -turn);
  const hx = turn * 8;
  const browY = -37;
  const browLift = (l: number) => browY - l * 12 - (f.eyeScale - 1) * 18;
  return (
    <g>
      {/* orejas detrás del cráneo */}
      {turn <= 0.15 ? <Ear x={lEarX} /> : null}
      {turn >= -0.15 ? <Ear x={rEarX} flip /> : null}

      {/* mechón con follow-through */}
      <g transform={`translate(${hx - 8},-90) rotate(${hairLag})`}>
        <path d={TUFT} stroke={C.line} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={TUFT} stroke={C.hair} strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>

      {/* cráneo con sombra lateral (volumen) */}
      <defs>
        <clipPath id={`${uid}-skull`}>
          <ellipse rx={88} ry={84} />
        </clipPath>
      </defs>
      <ellipse rx={88} ry={84} fill={C.skinShade} />
      <g clipPath={`url(#${uid}-skull)`}>
        <ellipse cx={12 + turn * 10} cy={-6} rx={90} ry={88} fill={C.skin} />
      </g>
      <ellipse rx={88} ry={84} fill="none" stroke={C.line} strokeWidth={LW} />

      {/* oreja cercana sobre el cráneo cuando la cabeza gira */}
      {turn > 0.15 ? <Ear x={lEarX} /> : null}
      {turn < -0.15 ? <Ear x={rEarX} flip /> : null}

      {/* pelo */}
      <path transform={`translate(${hx},0)`} d={HAIR} fill={C.hair} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />

      {/* mejillas */}
      <ellipse cx={fx - spread - 16} cy={30} rx={14 * farL} ry={8} fill={C.cheek} opacity={f.blush * 0.7} />
      <ellipse cx={fx + spread + 16} cy={30} rx={14 * farR} ry={8} fill={C.cheek} opacity={f.blush * 0.7} />

      {/* ojos */}
      <Eye
        id={`${uid}-eyeL`}
        x={fx - spread}
        y={-2}
        rx={eyeRx * farL}
        ry={eyeRy}
        lookX={f.lookX}
        lookY={f.lookY}
        pupil={f.pupil}
        lid={f.lidL}
        lidAngle={f.lidAngle}
        lowerLid={f.lowerLid}
      />
      <Eye
        id={`${uid}-eyeR`}
        x={fx + spread}
        y={-2}
        rx={eyeRx * farR}
        ry={eyeRy}
        lookX={f.lookX}
        lookY={f.lookY}
        pupil={f.pupil}
        lid={f.lidR}
        lidAngle={-f.lidAngle}
        lowerLid={f.lowerLid}
      />

      {/* cejas (por encima del flequillo, como en el cartoon clásico) */}
      <Brow x={fx - spread} y={browLift(f.browLiftL)} angle={f.browAngleL} side={1} w={15 * farL} />
      <Brow x={fx + spread} y={browLift(f.browLiftR)} angle={f.browAngleR} side={-1} w={15 * farR} />

      {/* nariz */}
      <path
        d={`M ${fx + turn * 14 - 6} 16 Q ${fx + turn * 14 + 6 + turn * 6} 22 ${fx + turn * 14 - 4} 30`}
        stroke={C.line}
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />

      <Mouth id={`${uid}-mouth`} x={fx + turn * 10} y={48} f={f} />
    </g>
  );
};
