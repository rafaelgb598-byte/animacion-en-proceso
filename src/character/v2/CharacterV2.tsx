import React from "react";
import { Hand } from "../Limbs";
import { computeRig, type ArmRig, type HandShape, type LegRig, type Pose, type Rig, type Vec } from "../rig";
import { HeadV2 } from "./HeadV2";
import { COLORS_V2 as C, DIM_V2, HEAD_SCALE, LINE } from "./style";

/**
 * Tomi V2 — mismo rig y mismas poses que la V1 (Pose), con el diseño evolucionado:
 * cabeza más chica, torso y piernas más largos, remera con calce y pliegues,
 * zapatillas crema con detalles turquesa. Las escenas existentes no cambian:
 * esta variante solo se usa donde se pide explícitamente.
 */

const LW = LINE.outer;
const IN = LINE.inner;
const OUT = LW * 2;

const poly = (pts: Vec[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** remera con calce: hombros más anchos, cintura apenas marcada */
const TORSO =
  "M -47 8 C -51 -40, -47 -84, -53 -136 Q -48 -170, 0 -172 Q 48 -170, 53 -136 C 47 -84, 51 -40, 47 8 Q 0 22, -47 8 Z";

export const rigV2 = (p: Pose) => computeRig(p, DIM_V2);

/* ------------------------------ brazo ------------------------------ */

const ArmV2: React.FC<{
  rig: ArmRig;
  hand: HandShape;
  shade?: boolean;
  side: 1 | -1;
  prop?: React.ReactNode;
  handNext?: HandShape;
  handMix?: number;
}> = ({ rig, hand, shade, side, prop, handNext, handMix = 0 }) => {
  const skin = shade ? C.skinShade : C.skin;
  const shirt = shade ? C.shirtShade : C.shirt;
  const path = poly([rig.sh, rig.el, rig.wr]);
  const sleeveEnd = lerpV(rig.sh, rig.el, 0.52);
  const sleeve = poly([rig.sh, sleeveEnd]);
  const handTf = `translate(${rig.wr.x},${rig.wr.y}) rotate(${-rig.handAng})`;
  return (
    <g>
      <path d={path} stroke={C.line} strokeWidth={20 + OUT} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={skin} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleeve} stroke={C.line} strokeWidth={31 + OUT} fill="none" strokeLinecap="round" />
      <path d={sleeve} stroke={shirt} strokeWidth={31} fill="none" strokeLinecap="round" />
      <g transform={handTf}>
        {handNext && handMix > 0.001 ? (
          <>
            <g opacity={handMix > 0.8 ? (1 - handMix) * 5 : 1}>
              <Hand shape={hand} side={side} shade={shade} layer="back" />
            </g>
            <g opacity={Math.min(1, handMix * 1.6)} transform={`scale(${0.9 + 0.1 * handMix})`}>
              <Hand shape={handNext} side={side} shade={shade} layer="back" />
            </g>
          </>
        ) : (
          <Hand shape={hand} side={side} shade={shade} layer="back" />
        )}
      </g>
      {prop ? <g transform={`translate(${rig.palm.x},${rig.palm.y})`}>{prop}</g> : null}
      {hand === "hold" ? (
        <g transform={handTf}>
          <Hand shape={hand} side={side} shade={shade} layer="front" />
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------ pierna ------------------------------ */

export const ShoeV2: React.FC<{ shade?: boolean }> = ({ shade }) => (
  <g>
    {/* capellada crema */}
    <path
      d="M -16 -8 Q -22 13 -6 19 L 46 19 Q 60 17 54 1 Q 46 -14 16 -15 Q -8 -15 -16 -8 Z"
      fill={shade ? C.shoeShade : C.shoe}
      stroke={C.line}
      strokeWidth={LW - 0.5}
      strokeLinejoin="round"
    />
    {/* franja lateral turquesa (forma simple, sin marca) */}
    <path d="M -8 4 Q 14 -4 40 6" stroke={shade ? C.shoeAccentShade : C.shoeAccent} strokeWidth={7} fill="none" strokeLinecap="round" />
    {/* talón turquesa y cordones */}
    <path d="M -16 -6 Q -21 4 -18 12" stroke={shade ? C.shoeAccentShade : C.shoeAccent} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 14 -12 L 22 -8 M 20 -14 L 28 -9" stroke={C.line} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
    {/* suela */}
    <path d="M -17 13 L 55 13" stroke={C.sole} strokeWidth={7} strokeLinecap="round" />
    <path d="M -19 20 L 51 20" stroke={C.line} strokeWidth={LW - 0.5} strokeLinecap="round" />
  </g>
);

const LegV2: React.FC<{ rig: LegRig; foot: number; shade?: boolean }> = ({ rig, foot, shade }) => {
  const path = poly([rig.hip, rig.knee, rig.ankle]);
  return (
    <g>
      <path d={path} stroke={C.line} strokeWidth={31 + OUT} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={shade ? C.pantsShade : C.pants} strokeWidth={31} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* ruedo del pantalón */}
      <path d={poly([lerpV(rig.knee, rig.ankle, 0.82), rig.ankle])} stroke={shade ? "#1C2546" : C.pantsShade} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
      <g transform={`translate(${rig.ankle.x},${rig.ankle.y + 4}) rotate(${foot})`}>
        <ShoeV2 shade={shade} />
      </g>
    </g>
  );
};

/* ------------------------------ personaje ------------------------------ */

export const CharacterV2: React.FC<{
  pose: Pose;
  uid: string;
  frontProp?: React.ReactNode;
  rig?: Rig;
}> = ({ pose: p, uid, frontProp, rig: given }) => {
  const rig = given ?? rigV2(p);
  const fs = p.flip ? -1 : 1;
  const t = p.bodyTurn;
  const placket = 16 * t;
  const torsoTf = `translate(0,${rig.ground}) rotate(${p.lean}) scale(${rig.sx},${rig.sy})`;
  const hs = 1 + (p.squash - 1) * 0.5;
  const headTf = `translate(${rig.neck.x},${rig.neck.y}) rotate(${rig.headAngle}) translate(0,${DIM_V2.headCenter}) scale(${HEAD_SCALE / Math.sqrt(hs)},${HEAD_SCALE * hs})`;

  return (
    <g transform={`translate(${p.x},${p.y}) scale(${p.scale * fs},${p.scale})`}>
      <ArmV2 rig={rig.back} hand={p.armBack.hand} handNext={p.armBack.handNext} handMix={p.armBack.handMix} shade side={-1} />
      <LegV2 rig={rig.legB} foot={p.legBack.foot} shade />
      <LegV2 rig={rig.legF} foot={p.legFront.foot} />

      <g transform={torsoTf}>
        <defs>
          <clipPath id={`${uid}-torso`}>
            <path d={TORSO} />
          </clipPath>
        </defs>
        {/* cuello: más largo y fino que la V1 */}
        <rect x={-13} y={-194} width={26} height={36} rx={8} fill={C.skin} stroke={C.line} strokeWidth={LW - 0.5} />
        <rect x={-10} y={-178} width={20} height={12} fill={C.skinShade} opacity={0.6} />
        <path d={TORSO} fill={C.shirt} />
        <g clipPath={`url(#${uid}-torso)`}>
          {/* volumen: luz en el pecho, sombra lateral y bajo el pecho */}
          <ellipse cx={18 + placket} cy={-120} rx={40} ry={34} fill={C.shirtLight} opacity={0.35} />
          <ellipse cx={-64 + placket} cy={-66} rx={26} ry={112} fill={C.shirtShade} opacity={0.6} />
          {/* franja blanca (identidad) */}
          <rect x={-70} y={-108} width={140} height={15} fill={C.shirtDetail} />
          <rect x={-70} y={-93} width={140} height={4} fill={C.shirtShade} opacity={0.35} />
          {/* pliegues simples: tirón diagonal hacia el cinturón (lado lejano) y axila en 3/4 */}
          <path d={`M ${30 + placket * 0.4} -64 Q ${36 + placket * 0.4} -50 ${32 + placket * 0.4} -38`} stroke={C.shirtFold} strokeWidth={IN - 0.5} fill="none" strokeLinecap="round" opacity={0.55} />
          <path d={`M ${-38 + placket * 0.3} -60 Q ${-34 + placket * 0.3} -48 ${-38 + placket * 0.3} -38`} stroke={C.shirtFold} strokeWidth={IN - 0.5} fill="none" strokeLinecap="round" opacity={0.45} />
          {t > 0.4 ? <path d="M 30 -134 Q 26 -122 31 -112" stroke={C.shirtFold} strokeWidth={IN - 0.5} fill="none" strokeLinecap="round" opacity={0.45 * t} /> : null}
          {/* dobladillo de la remera apenas por fuera del pantalón */}
          <path d="M -70 -30 Q 0 -22 70 -30 L 70 -36 Q 0 -28 -70 -36 Z" fill={C.shirtFold} opacity={0.55} />
          {/* pantalón */}
          <rect x={-70} y={-30} width={140} height={70} fill={C.pants} />
          <rect x={-70} y={-30} width={140} height={6} fill={C.pantsShade} />
        </g>
        {/* cuello redondo con ribete */}
        <path d={`M ${placket - 20} -170 Q ${placket} -148 ${placket + 20} -170`} stroke={C.line} strokeWidth={LW} fill={C.skin} strokeLinecap="round" />
        <path d={`M ${placket - 17} -166 Q ${placket} -150 ${placket + 17} -166`} stroke={C.shirtShade} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d={TORSO} fill="none" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
      </g>

      <g transform={headTf}>
        <HeadV2 uid={uid} face={p.face} turn={p.headTurn} blink={p.blink} hairLag={p.hairLag} />
      </g>

      <ArmV2 rig={rig.front} hand={p.armFront.hand} handNext={p.armFront.handNext} handMix={p.armFront.handMix} side={1} prop={frontProp} />
    </g>
  );
};
