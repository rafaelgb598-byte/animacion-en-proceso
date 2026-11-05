import React from "react";
import { Head } from "./Head";
import { Arm, Leg } from "./Limbs";
import { COLORS as C } from "./presets";
import { computeRig, type Pose, type Rig } from "./rig";

/**
 * Personaje principal ("Tomi").
 * Recibe una Pose completa por fotograma y dibuja cada parte articulada.
 * Orden de capas: brazo trasero → pierna trasera → pierna delantera → torso → cabeza → brazo delantero.
 */

const TORSO =
  "M -50 6 C -57 -48, -59 -104, -45 -138 Q -30 -158, 0 -158 Q 30 -158, 45 -138 C 59 -104, 57 -48, 50 6 Q 0 22, -50 6 Z";

export const Character: React.FC<{
  pose: Pose;
  uid: string;
  /** objeto en la mano delantera (coordenadas locales del personaje, origen en la palma) */
  frontProp?: React.ReactNode;
  rig?: Rig;
}> = ({ pose: p, uid, frontProp, rig: given }) => {
  const rig = given ?? computeRig(p);
  const fs = p.flip ? -1 : 1;
  const t = p.bodyTurn;
  const placket = 16 * t;
  const torsoTf = `translate(0,${rig.ground}) rotate(${p.lean}) scale(${rig.sx},${rig.sy})`;
  const hs = 1 + (p.squash - 1) * 0.5;
  const headTf = `translate(${rig.neck.x},${rig.neck.y}) rotate(${rig.headAngle}) translate(0,-86) scale(${1 / Math.sqrt(hs)},${hs})`;

  return (
    <g transform={`translate(${p.x},${p.y}) scale(${p.scale * fs},${p.scale})`}>
      <Arm rig={rig.back} hand={p.armBack.hand} shade side={-1} />
      <Leg rig={rig.legB} foot={p.legBack.foot} shade />
      <Leg rig={rig.legF} foot={p.legFront.foot} />

      {/* torso */}
      <g transform={torsoTf}>
        <defs>
          <clipPath id={`${uid}-torso`}>
            <path d={TORSO} />
          </clipPath>
        </defs>
        {/* cuello */}
        <rect x={-15} y={-178} width={30} height={34} rx={8} fill={C.skin} stroke={C.line} strokeWidth={5} />
        <path d={TORSO} fill={C.shirt} />
        <g clipPath={`url(#${uid}-torso)`}>
          {/* sombra lateral para dar volumen */}
          <ellipse cx={-62 + placket} cy={-60} rx={26} ry={110} fill={C.shirtShade} opacity={0.55} />
          {/* raya del suéter */}
          <rect x={-70} y={-96} width={140} height={16} fill={C.shirtDetail} />
          {/* pantalón */}
          <rect x={-70} y={-34} width={140} height={70} fill={C.pants} />
          <rect x={-70} y={-38} width={140} height={8} fill={C.line} />
          <rect x={placket - 6} y={-38} width={12} height={8} rx={2} fill="#E8C35A" />
        </g>
        {/* cuello de la remera */}
        <path
          d={`M ${placket - 20} -156 Q ${placket} -136 ${placket + 20} -156`}
          stroke={C.line}
          strokeWidth={5}
          fill={C.skin}
          strokeLinecap="round"
        />
        <path d={TORSO} fill="none" stroke={C.line} strokeWidth={5.5} strokeLinejoin="round" />
      </g>

      {/* cabeza */}
      <g transform={headTf}>
        <Head uid={uid} face={p.face} turn={p.headTurn} blink={p.blink} hairLag={p.hairLag} />
      </g>

      <Arm rig={rig.front} hand={p.armFront.hand} side={1} prop={frontProp} />
    </g>
  );
};
