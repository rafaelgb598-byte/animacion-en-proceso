import React from "react";
import type { FacePose } from "../rig";
import { COLORS_V2 as C, LINE } from "./style";

/**
 * Cabeza V2: mandíbula definida, ojos algo más chicos y altos (rostro menos infantil),
 * cejas con forma (gruesas en el inicio, finas en la punta), rubor suave y
 * sonrisa asimétrica con hoyuelo. Mismo sistema de parámetros que la V1 (FacePose).
 * Coordenadas locales: centro de la cabeza en (0,0), antes de HEAD_SCALE.
 */

const LW = LINE.outer;
const IN = LINE.inner;

/** cráneo + mandíbula; `turn` corre el mentón hacia donde mira */
const skull = (turn: number) => {
  const c = turn * 12;
  const jr = 64 - Math.max(0, turn) * 6; // mejilla lejana un poco más metida en 3/4
  const jl = 64 - Math.max(0, -turn) * 6;
  return [
    "M 0 -84",
    "C 52 -84, 88 -54, 88 -10",
    `C 88 26, ${jr + 8} 54, ${jr - 6} 72`,
    `Q ${30 + c} 98, ${c} 100`,
    `Q ${-30 + c} 98, ${-jl + 6} 72`,
    `C ${-jl - 8} 54, -88 26, -88 -10`,
    "C -88 -54, -52 -84, 0 -84 Z",
  ].join(" ");
};

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
  side: 1 | -1;
};

const Eye: React.FC<EyeProps> = ({ id, x, y, rx, ry, lookX, lookY, pupil, lid, lidAngle, lowerLid, side }) => {
  const pr = 7.2 * pupil;
  const px = lookX * (rx - pr) * 0.82;
  const py = lookY * (ry - pr) * 0.78;
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
        {/* iris marrón oscuro + pupila: mirada más "adulta" que el punto negro plano */}
        <circle cx={px} cy={py} r={pr * 1.02} fill="#3B2A24" />
        <circle cx={px} cy={py} r={pr * 0.62} fill={C.line} />
        <circle cx={px + 2.6} cy={py - 2.8} r={2.2 * pupil} fill="#fff" />
        {/* sombra del párpado sobre el ojo */}
        <ellipse cx={0} cy={-ry - 2 + lid * ry * 2} rx={rx * 1.3} ry={6} fill="#000" opacity={0.08} />
        <g transform={`rotate(${lidAngle} 0 ${lidY})`}>
          <rect x={-rx - 10} y={lidY - 60} width={rx * 2 + 20} height={60} fill={C.skin} />
          {lid > 0.04 ? <line x1={-rx - 4} x2={rx + 4} y1={lidY} y2={lidY} stroke={C.line} strokeWidth={IN + 1.5} /> : null}
        </g>
        {lowerLid > 0.02 ? (
          <g>
            <ellipse cx={0} cy={lowY + ry * 1.1} rx={rx * 1.6} ry={ry * 1.1} fill={C.skin} />
            <ellipse cx={0} cy={lowY + ry * 1.1} rx={rx * 1.6} ry={ry * 1.1} fill="none" stroke={C.line} strokeWidth={IN} />
          </g>
        ) : null}
      </g>
      <ellipse rx={rx} ry={ry} fill="none" stroke={C.line} strokeWidth={IN + 0.5} />
      {/* línea de pestañas: más gruesa arriba y con un pequeño remate hacia afuera */}
      <path
        d={`M ${-rx * 0.98} ${-ry * 0.12} Q ${-rx * 0.7} ${-ry * 1.08} 0 ${-ry * 1.0} Q ${rx * 0.8} ${-ry * 1.04} ${rx * 1.04} ${-ry * 0.18}`}
        transform={`scale(${side},1)`}
        stroke={C.line}
        strokeWidth={LW}
        fill="none"
        strokeLinecap="round"
        opacity={blinkFade(ry)}
      />
    </g>
  );
};
const blinkFade = (ry: number) => Math.min(1, Math.max(0, (ry - 4) / 6));

/** ceja con forma: inicio grueso (interno) y punta fina; `side` 1 = izquierda de pantalla */
const Brow: React.FC<{ x: number; y: number; angle: number; side: 1 | -1; w: number }> = ({ x, y, angle, side, w }) => (
  <path
    d={`M ${w} 1 Q ${w * 0.1} -9 ${-w * 1.05} 1 Q ${-w * 1.12} 4 ${-w} 5 Q 0 0 ${w * 0.95} 9 Q ${w * 1.12} 6 ${w} 1 Z`}
    transform={`translate(${x},${y}) scale(${side},1) rotate(${-angle})`}
    fill={C.hair}
    stroke={C.hair}
    strokeWidth={2}
    strokeLinejoin="round"
  />
);

const Mouth: React.FC<{ id: string; x: number; y: number; f: FacePose }> = ({ id, x, y, f }) => {
  const w = 19 * f.mouthWidth;
  const ly = -f.smile * 8 + f.mouthSkew * 6;
  const ry = -f.smile * 8 - f.mouthSkew * 9;
  const up = f.smile * 8 - f.mouthOpen * 5;
  const lo = up + 2.5 + f.mouthOpen * 38;
  const mid = (ly + ry) / 2;
  const d = `M ${-w} ${ly} Q 0 ${2 * up - mid} ${w} ${ry} Q 0 ${2 * lo - mid} ${-w} ${ly} Z`;
  const closed = f.mouthOpen < 0.12;
  // hoyuelo en la comisura que sube (sonrisa de costado / irónica)
  const dimple = Math.max(0, f.smile - 0.2) * Math.min(1, Math.abs(f.mouthSkew) * 1.5 + 0.25);
  const ds = f.mouthSkew >= 0 ? 1 : -1;
  const cx = ds * w;
  const cy = ds > 0 ? ry : ly;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      {closed ? (
        <path
          d={`M ${-w} ${ly} Q 0 ${2 * up - mid + 1.5} ${w} ${ry}`}
          stroke={C.line}
          strokeWidth={IN + 1}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d={d} fill={C.mouth} />
          <g clipPath={`url(#${id})`}>
            <ellipse cx={0} cy={lo + 2} rx={w * 0.6} ry={6 + f.mouthOpen * 9} fill={C.tongue} />
            {f.smile > 0.35 ? <rect x={-w} y={up - 12} width={w * 2} height={13} fill="#fff" /> : null}
          </g>
          <path d={d} fill="none" stroke={C.line} strokeWidth={IN + 0.5} strokeLinejoin="round" strokeLinecap="round" />
        </>
      )}
      {dimple > 0.05 ? (
        <path
          d={`M ${cx + ds * 1} ${cy - 5} Q ${cx + ds * 6} ${cy} ${cx + ds * 2} ${cy + 6}`}
          stroke={C.line}
          strokeWidth={IN - 0.5}
          fill="none"
          strokeLinecap="round"
          opacity={Math.min(1, dimple * 2)}
        />
      ) : null}
    </g>
  );
};

const Ear: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <g transform={`translate(${x},4) scale(${flip ? -1 : 1},1)`}>
    <ellipse rx={12} ry={17} fill={C.skin} stroke={C.line} strokeWidth={LW} />
    <path d="M 3 -7 Q -4 0 3 7" stroke={C.skinShade} strokeWidth={IN} fill="none" strokeLinecap="round" />
  </g>
);

/** pelo: casco con flequillo barrido hacia adelante (+x), patillas y brillo */
const HAIR =
  "M -92 0 C -100 -66, -52 -104, 4 -104 C 60 -104, 100 -70, 92 -2 C 90 -28, 84 -44, 72 -54 C 68 -40, 56 -34, 42 -36 C 46 -46, 44 -54, 38 -60 C 30 -46, 12 -42, -6 -46 C 0 -52, 0 -60, -4 -64 C -18 -50, -40 -46, -58 -50 C -70 -40, -80 -24, -82 -2 L -84 18 Q -90 14 -92 0 Z";
const HAIR_SHINE = "M -52 -82 Q -10 -98 34 -88";
/** jopo: mechón levantado y peinado hacia atrás (identidad, sin rulito infantil) */
const TUFT = "M -26 10 C -30 -12, -10 -36, 22 -40 C 12 -30, 10 -20, 14 -8 C 4 -2, -12 4, -26 10 Z";

export type HeadV2Props = { uid: string; face: FacePose; turn: number; blink: number; hairLag: number };

export const HeadV2: React.FC<HeadV2Props> = ({ uid, face: f, turn, blink, hairLag }) => {
  const fx = turn * 22;
  const spread = 29 * (1 - 0.16 * Math.abs(turn));
  const eyeRx = 13 * f.eyeScale;
  const eyeRy = 14.5 * f.eyeScale * blink;
  const farR = 1 - 0.24 * Math.max(0, turn);
  const farL = 1 - 0.24 * Math.max(0, -turn);
  const lEarX = -84 + 40 * Math.max(0, -turn) + 30 * Math.max(0, turn);
  const rEarX = 84 - 40 * Math.max(0, turn) - 30 * Math.max(0, -turn);
  const hx = turn * 8;
  const eyeY = -10;
  const browY = -33;
  const browLift = (l: number) => browY - l * 13 - (f.eyeScale - 1) * 14;
  const sk = skull(turn);
  return (
    <g>
      {turn <= 0.15 ? <Ear x={lEarX} /> : null}
      {turn >= -0.15 ? <Ear x={rEarX} flip /> : null}

      {/* mechón levantado (identidad), con follow-through */}
      <g transform={`translate(${hx + 4},-90) rotate(${hairLag * 0.7})`}>
        <path d={TUFT} fill={C.hair} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M -14 0 C -14 -14, -2 -28, 14 -33" stroke={C.hairLight} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      </g>

      <defs>
        <clipPath id={`${uid}-skull`}>
          <path d={sk} />
        </clipPath>
      </defs>
      <path d={sk} fill={C.skinShade} />
      <g clipPath={`url(#${uid}-skull)`}>
        <ellipse cx={12 + turn * 12} cy={-10} rx={90} ry={92} fill={C.skin} />
        {/* sombra suave bajo el pelo y en la mandíbula */}
        <ellipse cx={hx} cy={-58} rx={96} ry={22} fill={C.skinShade} opacity={0.35} />
      </g>
      <path d={sk} fill="none" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />

      {turn > 0.15 ? <Ear x={lEarX} /> : null}
      {turn < -0.15 ? <Ear x={rEarX} flip /> : null}

      <g transform={`translate(${hx},0)`}>
        <path d={HAIR} fill={C.hair} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        <path d={HAIR_SHINE} stroke={C.hairLight} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
      </g>

      {/* rubor suave (mucho menos que la V1) */}
      <ellipse cx={fx - spread - 12} cy={28} rx={10 * farL} ry={5} fill={C.cheek} opacity={f.blush * 0.25} />
      <ellipse cx={fx + spread + 12} cy={28} rx={10 * farR} ry={5} fill={C.cheek} opacity={f.blush * 0.25} />

      <Eye id={`${uid}-eyeL`} x={fx - spread} y={eyeY} rx={eyeRx * farL} ry={eyeRy} lookX={f.lookX} lookY={f.lookY} pupil={f.pupil} lid={f.lidL} lidAngle={f.lidAngle} lowerLid={f.lowerLid} side={-1} />
      <Eye id={`${uid}-eyeR`} x={fx + spread} y={eyeY} rx={eyeRx * farR} ry={eyeRy} lookX={f.lookX} lookY={f.lookY} pupil={f.pupil} lid={f.lidR} lidAngle={-f.lidAngle} lowerLid={f.lowerLid} side={1} />

      <Brow x={fx - spread} y={browLift(f.browLiftL)} angle={f.browAngleL} side={1} w={17 * farL} />
      <Brow x={fx + spread} y={browLift(f.browLiftR)} angle={f.browAngleR} side={-1} w={17 * farR} />

      {/* nariz: puente corto + punta, más definida */}
      <path
        d={`M ${fx + turn * 16 - 2} 6 Q ${fx + turn * 17 + 10 + turn * 6} 28 ${fx + turn * 16 - 3} 35 Q ${fx + turn * 16 - 9} 35 ${fx + turn * 16 - 10} 31`}
        stroke={C.line}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Mouth id={`${uid}-mouth`} x={fx + turn * 10} y={60} f={f} />
    </g>
  );
};
