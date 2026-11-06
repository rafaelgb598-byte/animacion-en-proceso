import React from "react";
import { random } from "remotion";
import { dust, fabricGone, fabricStains, fabricTorn, lampGone, lampRust, mixColor } from "../../decay";
import { fall } from "../../lib/anim";
import { lampOn } from "../../lib/power";
import { onSupport } from "../../lib/support";
import { LIGHT, MAT } from "../../theme";
import { EVENT_YEARS, EVENTS } from "../../timeline";
import type { SceneBaseProps } from "../../types";
import { ContactShadow, DustFilter, RoughFilter, Svg } from "../svg";

/** Velador: base metálica, vástago y pantalla de tela trapezoidal. */
export const Lamp: React.FC<SceneBaseProps & { x: number; y: number; h: number; drop: number }> = ({ year, frame, x, y, h, drop }) => {
  const gone = lampGone(year);
  if (gone >= 0.999) return null;
  const on = lampOn(frame);
  const tip = fall(frame, EVENTS.lampFall, year >= EVENT_YEARS.lampFall);
  const sup = onSupport(year, frame, drop, 0);
  const rust = lampRust(year);
  const metal = mixColor(MAT.lampMetal, MAT.rust, rust);
  const stains = fabricStains(year);
  const torn = fabricTorn(year);
  const fabricOp = 1 - fabricGone(year);
  const d = Math.max(0, dust(year));
  const shadeTop = y - h;
  const shadeBot = y - h + 200;
  const shade = `M ${x - 75} ${shadeTop} L ${x + 75} ${shadeTop} L ${x + 125} ${shadeBot} L ${x - 125} ${shadeBot} Z`;
  const fabric = mixColor(MAT.fabric, MAT.paperOld, stains * 0.5);
  return (
    <Svg style={{ opacity: 1 - gone }}>
      <defs>
        <RoughFilter id="uep-lamp-stain" seed={61} scale={20} freq={0.06} />
        <DustFilter id="uep-lamp-dust" seed={62} />
        <radialGradient id="uep-lamp-glow" cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor={LIGHT.lamp} stopOpacity={1} />
          <stop offset="1" stopColor={LIGHT.lamp} stopOpacity={0} />
        </radialGradient>
        <clipPath id="uep-shade-clip">
          <path d={shade} />
        </clipPath>
      </defs>
      <ContactShadow id="uep-lamp-shadow" cx={x + 6} cy={y + 6 + sup.dy} rx={90 + 60 * tip} ry={16} soft={8} opacity={0.5} />
      <g transform={`translate(0 ${sup.dy}) rotate(${-64 * tip} ${x} ${y})`}>
        {/* base */}
        <ellipse cx={x} cy={y - 4} rx={70} ry={18} fill={metal} />
        <ellipse cx={x} cy={y - 10} rx={64} ry={13} fill={MAT.specular} opacity={0.18 * (1 - rust)} />
        {/* vástago */}
        <rect x={x - 6} y={shadeBot - 10} width={12} height={y - shadeBot} fill={metal} />
        <rect x={x - 2} y={shadeBot - 10} width={3} height={y - shadeBot} fill={MAT.specular} opacity={0.25 * (1 - rust)} />
        {rust > 0.01
          ? Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={i}
                cx={x - 50 + random(`rust-x-${i}`) * 100}
                cy={y - 8 + random(`rust-y-${i}`) * 10}
                rx={4 + 14 * rust * random(`rust-r-${i}`)}
                ry={2 + 5 * rust}
                fill={MAT.rust}
                opacity={0.8}
              />
            ))
          : null}
        {/* pantalla de tela */}
        <g opacity={fabricOp}>
          <path d={shade} fill={fabric} />
          <g clipPath="url(#uep-shade-clip)">
            <rect x={x - 130} y={shadeTop} width={260} height={200} fill="url(#uep-lamp-glow)" opacity={0.85 * on} />
            <rect x={x - 130} y={shadeTop} width={260} height={10} fill={MAT.black} opacity={0.15} />
            <g filter="url(#uep-lamp-stain)" opacity={0.55 * stains}>
              <ellipse cx={x - 40} cy={shadeTop + 70} rx={22} ry={30} fill={MAT.wallStain} />
              <ellipse cx={x + 50} cy={shadeTop + 130} rx={30} ry={22} fill={MAT.wallStain} />
              <ellipse cx={x + 10} cy={shadeTop + 40} rx={14} ry={12} fill={MAT.wallStain} />
            </g>
            {d > 0.001 ? <rect x={x - 130} y={shadeTop} width={260} height={200} fill={MAT.dust} filter="url(#uep-lamp-dust)" opacity={d} /> : null}
            {torn > 0.01 ? (
              <path
                d={`M ${x - 10} ${shadeBot} L ${x - 2} ${shadeBot - 90 * torn} L ${x + 18} ${shadeBot - 50 * torn} L ${x + 30} ${shadeBot - 120 * torn} L ${x + 44} ${shadeBot} Z`}
                fill={MAT.black}
                opacity={0.7}
              />
            ) : null}
          </g>
          <path d={`M ${x - 125} ${shadeBot} L ${x + 125} ${shadeBot}`} stroke={MAT.black} strokeOpacity={0.2} strokeWidth={4} />
        </g>
      </g>
    </Svg>
  );
};
