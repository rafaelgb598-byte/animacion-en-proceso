import React from "react";
import { AbsoluteFill } from "remotion";
import { debrisBuried, debrisMoss, dust, laminatePeel, mixColor, tableSwell } from "../../decay";
import { collapseT } from "../../lib/support";
import { LAYOUT, MAT } from "../../theme";
import type { SceneBaseProps } from "../../types";
import { DustLayer } from "../fx/DustLayer";
import { ContactShadow, GrainFilter, Svg } from "../svg";

const N = LAYOUT.nightstand;
const SLAB = 22;

export type NightstandStyle = { body: string; top: string; core: string; handle: string };
const DEFAULT_STYLE: NightstandStyle = { body: MAT.laminate, top: MAT.laminateLight, core: MAT.particle, handle: MAT.lampMetal };

/**
 * Mesa de luz: caja con tapa en perspectiva, cajón y tirador. Colapsa en el año ~44:
 * cada cara rota y cae (CSS 3D con spring), luego los restos se cubren de musgo y se entierran.
 */
export const Nightstand: React.FC<SceneBaseProps & { style?: NightstandStyle }> = ({ year, frame, style = DEFAULT_STYLE }) => {
  const t = collapseT(year, frame);
  const peel = laminatePeel(year);
  const swell = tableSwell(year);
  const moss = debrisMoss(year);
  const buried = debrisBuried(year);
  const d = dust(year);
  if (buried >= 0.999) return null;
  const body = mixColor(style.body, style.core, swell * 0.35);
  const topCol = mixColor(style.top, style.core, swell * 0.3);
  const topD = `M ${N.backLeft} ${N.backY} L ${N.backRight} ${N.backY} L ${N.frontRight} ${N.frontY} L ${N.frontLeft} ${N.frontY} Z`;
  const midX = (N.frontLeft + N.frontRight) / 2;
  const frontW = N.frontRight - N.frontLeft;
  const frontH = N.bottomY - N.frontY;
  const p = peel * 70;

  const mossOverlay = (dPath: string) => (moss > 0.001 ? <path d={dPath} fill={MAT.moss} opacity={moss * 0.85} /> : null);

  const face = (half: "L" | "R") => {
    const x0 = half === "L" ? N.frontLeft : midX;
    const dd = `M ${x0} ${N.frontY} h ${frontW / 2} v ${frontH} h ${-frontW / 2} Z`;
    return (
      <Svg>
        <defs>
          <clipPath id={`uep-ns-half-${half}`}>
            <path d={dd} />
          </clipPath>
        </defs>
        <g clipPath={`url(#uep-ns-half-${half})`}>
          <rect x={N.frontLeft} y={N.frontY} width={frontW} height={frontH} fill={body} filter="url(#uep-ns-grain)" />
          <rect x={N.frontLeft} y={N.frontY} width={frontW} height={SLAB} fill={style.top} />
          <rect x={N.frontLeft} y={N.frontY + SLAB} width={frontW} height={6} fill={MAT.black} opacity={0.25} />
          <rect x={N.drawer.x} y={N.drawer.y} width={N.drawer.w} height={N.drawer.h} fill="none" stroke={MAT.black} strokeOpacity={0.45} strokeWidth={5} rx={4} />
          <rect x={N.drawer.x + 4} y={N.drawer.y + 4} width={N.drawer.w - 8} height={8} fill={style.top} opacity={0.5} />
          <rect x={midX - 70} y={N.drawer.y + N.drawer.h / 2 - 8} width={140} height={16} rx={8} fill={style.handle} />
          <rect x={midX - 66} y={N.drawer.y + N.drawer.h / 2 - 6} width={132} height={4} rx={2} fill={MAT.specular} opacity={0.35} />
          <rect x={N.frontLeft} y={N.drawer.y + N.drawer.h + 30} width={frontW} height={4} fill={MAT.black} opacity={0.3} />
          <rect x={N.frontLeft} y={N.bottomY - 26} width={frontW} height={26} fill={MAT.black} opacity={0.35} />
          {/* Laminado que se levanta en las esquinas y deja ver el aglomerado */}
          {peel > 0.001 ? (
            <>
              <path d={`M ${N.frontLeft} ${N.bottomY} l ${p} 0 l ${-p} ${-p} Z`} fill={style.core} />
              <path d={`M ${N.frontRight} ${N.bottomY} l ${-p} 0 l ${p} ${-p} Z`} fill={style.core} />
              <path d={`M ${N.frontLeft + p} ${N.bottomY} l ${-p} ${-p} l ${p * 0.9} ${-p * 0.25} Z`} fill={style.top} opacity={0.9} />
              <path d={`M ${N.frontRight - p} ${N.bottomY} l ${p} ${-p} l ${-p * 0.9} ${-p * 0.25} Z`} fill={style.top} opacity={0.9} />
            </>
          ) : null}
          {mossOverlay(dd)}
        </g>
      </Svg>
    );
  };

  const hinge = `${midX}px ${N.bottomY}px`;
  return (
    <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: `${LAYOUT.cameraOrigin.x}px ${LAYOUT.cameraOrigin.y}px`, opacity: 1 - buried }}>
      <Svg>
        <defs>
          <GrainFilter id="uep-ns-grain" seed={41} freq={0.6} opacity={0.07} />
        </defs>
        <ContactShadow id="uep-ns-shadow" cx={midX} cy={N.bottomY + 4} rx={360 + 80 * t} ry={30} soft={14} opacity={0.6} />
      </Svg>
      <AbsoluteFill style={{ transformOrigin: hinge, transform: `translateX(${-40 * t}px) rotateX(${78 * t}deg) rotateZ(${-6 * t}deg) scaleY(${1 + swell * 0.04})` }}>
        {face("L")}
      </AbsoluteFill>
      <AbsoluteFill style={{ transformOrigin: hinge, transform: `translateX(${50 * t}px) rotateX(${72 * t}deg) rotateZ(${7 * t}deg) scaleY(${1 + swell * 0.04})` }}>
        {face("R")}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: `${N.frontLeft}px ${N.frontY}px`,
          transform: `translateY(${300 * t}px) rotateZ(${5 * t}deg) scaleY(${1 - 0.35 * t})`,
        }}
      >
        <Svg>
          <path d={topD} fill={topCol} filter="url(#uep-ns-grain)" />
          <path d={`M ${N.backLeft} ${N.backY} L ${N.backRight} ${N.backY} L ${N.backRight + 6} ${N.backY + 40} L ${N.backLeft - 6} ${N.backY + 40} Z`} fill={MAT.black} opacity={0.18} />
          {peel > 0.001 ? (
            <>
              <path d={`M ${N.frontLeft} ${N.frontY} l ${p * 1.2} 0 l ${-p * 0.2} ${-p * 0.8} Z`} fill={style.core} />
              <path d={`M ${N.frontRight} ${N.frontY} l ${-p * 1.2} 0 l ${p * 0.2} ${-p * 0.8} Z`} fill={style.core} />
            </>
          ) : null}
          <DustLayer id="uep-ns-dust" seed={42} d={topD} opacity={d} />
          {mossOverlay(topD)}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
