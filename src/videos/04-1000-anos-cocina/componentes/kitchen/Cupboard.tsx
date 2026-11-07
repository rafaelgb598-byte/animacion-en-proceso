import React from "react";
import { interpolateColors } from "remotion";
import { ContactShadow, RoughFilter, Svg, poly } from "../../../../canal/mil-anos/svg";
import { cupboard, dust } from "../../episodes/cocina.decay";
import { K, LAYOUT, M } from "../../theme";
import type { KitchenProps } from "./types";

const C = LAYOUT.cupboard;
const MID = 962;
const STACK = { cx: 897, bottom: 546, rx: 54, ry: 8, step: 7 };

const CENTER = { x: (C.x0 + C.x1) / 2, y: (C.y0 + C.y1) / 2 };
/** Dónde queda la alacena caída: acostada en el piso, delante del bajo mesada. */
const LANDED = { x: 830, y: 1352, rot: -84, scale: 1.05 };

/** Transformación de la alacena: se combea (aglomerado hinchado) y cae hacia adelante en AÑO 10 (gravedad: t²). */
export const cupboardPose = (year: number) => {
  const c = cupboard(year);
  const g = c.fall * c.fall;
  const cx = CENTER.x + (LANDED.x - CENTER.x) * c.fall;
  const cy = CENTER.y + (LANDED.y - CENTER.y) * g;
  const rot = 3 * c.swell * (1 - g) + LANDED.rot * g;
  const scale = 1 + (LANDED.scale - 1) * g;
  return {
    g,
    fallen: c.fall >= 1,
    transform: `translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(${-CENTER.x} ${-CENTER.y})`,
  };
};

/** Pila de 8 platos blancos (vista de frente). */
const PlateStack: React.FC = () => (
  <g>
    {Array.from({ length: 8 }, (_, i) => {
      const y = STACK.bottom - i * STACK.step;
      return (
        <g key={i}>
          <ellipse cx={STACK.cx} cy={y + 2} rx={STACK.rx} ry={STACK.ry} fill={M.black} opacity={0.25} />
          <ellipse cx={STACK.cx} cy={y} rx={STACK.rx} ry={STACK.ry} fill={K.plateWhite} />
          <ellipse cx={STACK.cx} cy={y - 1.5} rx={STACK.rx * 0.62} ry={STACK.ry * 0.5} fill={M.fridgeShade} opacity={0.35} />
        </g>
      );
    })}
  </g>
);

/** Alacena superior: puerta entreabierta con 8 platos → se hincha → cae en AÑO 10 → restos que se pudren. */
export const Cupboard: React.FC<KitchenProps> = ({ year }) => {
  const c = cupboard(year);
  if (c.rot >= 0.999) return null;
  const p = cupboardPose(year);
  const wood = interpolateColors(Math.min(1, c.swell * 0.55 + c.rot * 0.45), [0, 1], [M.wood, M.woodRot]);
  const woodLight = interpolateColors(c.swell, [0, 1], [M.woodLight, M.wood]);
  const bulge = 16 * c.swell;
  const box = `M ${C.x0} ${C.y0} L ${C.x1} ${C.y0} L ${C.x1} ${C.y1} Q ${(C.x0 + C.x1) / 2} ${C.y1 + bulge} ${C.x0} ${C.y1} Z`;
  const openDoor = poly([
    [C.x0, C.y0 + 4],
    [C.x0, C.y1 - 4],
    [C.x0 - 48, C.y1 + 20],
    [C.x0 - 48, C.y0 - 20],
  ]);
  const centerX = (C.x0 + C.x1) / 2;
  return (
    <Svg style={{ opacity: 1 - c.rot }}>
      <defs>
        <RoughFilter id="kc-cup-rough" seed={31} scale={6 + 18 * c.swell} freq={0.05} />
      </defs>
      {!p.fallen ? <ContactShadow id="kc-cup-shadow" cx={centerX - 10} cy={C.y1 + 22} rx={150} ry={14} soft={10} opacity={0.35 * (1 - p.g)} /> : null}
      <g
        transform={p.transform}
        filter={c.swell > 0.02 ? "url(#kc-cup-rough)" : undefined}
      >
        <path d={box} fill={wood} />
        {/* interior (puerta izquierda abierta) */}
        <rect x={C.x0 + 10} y={C.y0 + 12} width={MID - C.x0 - 14} height={C.y1 - C.y0 - 24} fill={M.woodDark} />
        <rect x={C.x0 + 10} y={360} width={MID - C.x0 - 14} height={8} fill={woodLight} />
        {!p.fallen ? <PlateStack /> : null}
        <rect x={C.x0 + 10} y={STACK.bottom + 6} width={MID - C.x0 - 14} height={8} fill={woodLight} />
        {/* puerta derecha cerrada */}
        <rect x={MID} y={C.y0 + 8} width={C.x1 - MID - 8} height={C.y1 - C.y0 - 16} rx={4} fill={woodLight} transform={`rotate(${2 * c.swell} ${MID} ${C.y0})`} />
        <rect x={MID + 18} y={C.y1 - 70} width={8} height={44} rx={4} fill={K.steel} />
        {/* puerta izquierda abierta hacia la cámara */}
        <path d={openDoor} fill={woodLight} />
        <path d={openDoor} fill={M.black} opacity={0.18} />
        <rect x={C.x0} y={C.y0} width={C.x1 - C.x0} height={10} fill={M.black} opacity={0.2} />
        <rect x={C.x0} y={C.y0} width={C.x1 - C.x0} height={C.y1 - C.y0} fill={M.dust} opacity={0.25 * dust(year)} />
      </g>
    </Svg>
  );
};

