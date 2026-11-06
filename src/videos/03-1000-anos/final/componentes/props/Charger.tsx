import React from "react";
import { cableCracks, cableFragment, cableGone, cableSplit, cableYellow, copperGreen, mixColor, wallRemains } from "../../decay";
import { fall } from "../../lib/anim";
import { MAT } from "../../theme";
import { EVENT_YEARS, EVENTS } from "../../timeline";
import type { SceneBaseProps } from "../../types";
import { ContactShadow, Svg } from "../svg";

/** Cargador enchufado en la pared + cable en curva Bézier hasta el puerto del celular. */
export const Charger: React.FC<SceneBaseProps & { x: number; y: number; floorY: number; port: { x: number; y: number } }> = ({
  year,
  frame,
  x,
  y,
  floorY,
  port,
}) => {
  const gone = cableGone(year);
  if (gone >= 0.999) return null;
  const drop = fall(frame, EVENTS.chargerDrop, year >= EVENT_YEARS.chargerDrop);
  const by = y + (floorY - y) * drop;
  const tilt = 80 * drop;
  const jacket = mixColor(MAT.cableWhite, MAT.cableOld, cableYellow(year));
  const split = cableSplit(year);
  const frag = cableFragment(year);
  const copper = mixColor(MAT.copper, MAT.verdigris, copperGreen(year));
  const p0 = { x: x + 8 * drop, y: by + 44 };
  const d = `M ${p0.x} ${p0.y} C ${p0.x - 10} ${p0.y + 150}, ${port.x + 200} ${port.y + 70}, ${port.x} ${port.y}`;
  const fragDash = frag > 0.001 ? `${9 - 6 * frag} ${6 * frag}` : undefined;
  return (
    <Svg style={{ opacity: 1 - gone }}>
      {/* placa del tomacorriente (cae con el muro) */}
      <g opacity={wallRemains(year) * (1 - drop)}>
        <rect x={x - 34} y={y - 52} width={68} height={104} rx={8} fill={MAT.outlet} />
        <rect x={x - 34} y={y - 52} width={68} height={104} rx={8} fill={MAT.black} opacity={0.12 + 0.3 * cableYellow(year)} />
      </g>
      <g strokeDasharray={fragDash} >
        {/* cobre (asoma cuando el forro se parte) */}
        {split > 0.001 ? <path d={d} pathLength={100} fill="none" stroke={copper} strokeWidth={5} strokeLinecap="round" strokeDasharray={fragDash} /> : null}
        {/* forro */}
        <path
          d={d}
          pathLength={100}
          fill="none"
          stroke={jacket}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={split > 0.001 ? `${10 - 5 * split} ${5 * split}` : fragDash}
          strokeDashoffset={3}
        />
        {/* grietas */}
        <path d={d} pathLength={100} fill="none" stroke={MAT.black} strokeOpacity={0.55 * cableCracks(year)} strokeWidth={10} strokeDasharray="0.4 3.1" />
      </g>
      {/* cargador */}
      <ContactShadow id="uep-charger-shadow" cx={x} cy={by + 62} rx={40} ry={8} soft={6} opacity={0.4 * drop} />
      <g transform={`rotate(${tilt} ${x} ${by})`}>
        <rect x={x - 30} y={by - 40} width={60} height={84} rx={12} fill={jacket} />
        <rect x={x - 30} y={by - 40} width={60} height={14} rx={7} fill={MAT.specular} opacity={0.35} />
        <rect x={x - 30} y={by + 30} width={60} height={14} rx={7} fill={MAT.black} opacity={0.18} />
        <rect x={x - 7} y={by + 40} width={14} height={10} rx={3} fill={jacket} />
      </g>
    </Svg>
  );
};
