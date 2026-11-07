import React from "react";
import { interpolateColors, random } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { RoughFilter, Svg, poly } from "../../../../canal/mil-anos/svg";
import { daylight, floor, leaves, puddle, walls } from "../../episodes/cocina.decay";
import { K, LAYOUT, M, MASK } from "../../theme";
import type { KitchenProps, Pt } from "./types";

const W = LAYOUT.window;

/** Borde dentado (techo caído, pared en ruinas): y base + ruido con semilla. */
const jagged = (key: string, base: (x: number) => number, amp: number): Pt[] =>
  Array.from({ length: 28 }, (_, i) => {
    const x = -20 + i * 42;
    return [x, base(x) + (random(`${key}-${i}`) - 0.5) * amp] as const;
  });

/** Altura del borde superior de la pared: techo caído (AÑO 50) y ruina progresiva (AÑO 62 → 200). */
export const wallTopAt = (year: number) => {
  const w = walls(year);
  const roof = w.roofFall > 0.12 ? 1 : 0;
  const ruinBase = (x: number) => (x < 150 ? 420 : x > 930 ? 560 : 660 + 70 * Math.sin(x / 90));
  return { roof, ruin: w.ruin, ruinBase };
};

/** Cielo (detrás de la pared): noche con luna; con el techo caído, día verdoso con lomas. */
export const Sky: React.FC<KitchenProps> = ({ year }) => {
  const day = daylight(year);
  return (
    <Svg>
      <defs>
        <linearGradient id="kc-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={M.sky} />
          <stop offset="1" stopColor={M.skyLow} />
        </linearGradient>
        <linearGradient id="kc-sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={M.daySkyHigh} />
          <stop offset="1" stopColor={M.daySky} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1300} fill="url(#kc-sky-night)" />
      <circle cx={712} cy={430} r={34} fill={M.moon} opacity={1 - day} />
      <circle cx={712} cy={430} r={70} fill={M.moon} opacity={0.08 * (1 - day)} />
      <g opacity={day}>
        <rect width={1080} height={1300} fill="url(#kc-sky-day)" />
        <path d="M -20 900 Q 200 760 420 840 T 820 800 T 1100 850 L 1100 1300 L -20 1300 Z" fill={M.hillFar} />
        <path d="M -20 1000 Q 260 880 560 960 T 1100 930 L 1100 1300 L -20 1300 Z" fill={M.hill} />
      </g>
    </Svg>
  );
};

/** Pared con azulejos: envejece, se mancha, se agrieta; el techo cae y queda en ruinas con enredadera. */
export const Wall: React.FC<KitchenProps> = ({ year }) => {
  const w = walls(year);
  const top = wallTopAt(year);
  const tile = interpolateColors(w.age, [0, 1], [K.tile, K.tileOld]);
  const grout = interpolateColors(w.age, [0, 1], [M.grout, M.groutOld]);
  const roofEdge = jagged("roof", () => 230, 120);
  const ruinEdge = jagged("ruin", (x) => lerp(top.ruin, [0, 1], [230, top.ruinBase(x)]), 150);
  const roofHole = top.roof ? poly([[-40, -40], [1120, -40], [1120, 230], ...roofEdge.slice().reverse()]) : null;
  const ruinHole = top.roof && top.ruin > 0 ? poly([[-40, -40], [1120, -40], [1120, ruinEdge[ruinEdge.length - 1][1]], ...ruinEdge.slice().reverse()]) : null;
  const windowGone = lerp(top.ruin, [0.35, 0.6], [0, 1]);
  const stains: [number, number, number][] = [
    [120, 170, 90],
    [480, 230, 120],
    [960, 640, 110],
    [430, 720, 60],
    [880, 120, 70],
    [320, 1180, 80],
  ];
  return (
    <Svg>
      <defs>
        <pattern id="kc-tiles" width={72} height={72} patternUnits="userSpaceOnUse">
          <rect width={72} height={72} fill={tile} />
          <rect width={72} height={3} fill={grout} />
          <rect width={3} height={72} fill={grout} />
          <rect x={6} y={6} width={30} height={4} fill={M.specular} opacity={0.12 * (1 - w.age)} />
        </pattern>
        <RoughFilter id="kc-wall-rough" seed={11} scale={34} freq={0.03} />
        <mask id="kc-wall-mask">
          <rect x={-40} y={-40} width={1160} height={1400} fill={MASK.show} />
          <rect x={W.x0} y={W.y0} width={W.x1 - W.x0} height={W.y1 - W.y0} fill={MASK.hide} />
          {windowGone > 0 ? <rect x={W.x0 - 60} y={W.y0 - 60} width={W.x1 - W.x0 + 120} height={(W.y1 - W.y0 + 60) * windowGone} fill={MASK.hide} /> : null}
          {roofHole ? <path d={roofHole} fill={MASK.hide} /> : null}
          {ruinHole ? <path d={ruinHole} fill={MASK.hide} /> : null}
        </mask>
      </defs>
      <g mask="url(#kc-wall-mask)">
        <rect x={-40} y={0} width={1160} height={LAYOUT.floorTop + 20} fill="url(#kc-tiles)" />
        {/* techo (la cámara alta casi no lo ve) */}
        <rect x={-40} y={0} width={1160} height={LAYOUT.ceilingY} fill={M.ceiling} />
        <rect x={-40} y={LAYOUT.ceilingY} width={1160} height={8} fill={M.plasterDark} />
        {/* manchas de humedad */}
        <g filter="url(#kc-wall-rough)">
          {stains.map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={r * (0.15 + 0.6 * w.stain)} ry={r * 0.75 * (0.15 + 0.6 * w.stain)} fill={M.wallStain} opacity={0.32 * w.stain} />
          ))}
        </g>
        {/* grietas */}
        <g stroke={M.wallCrack} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
          <path d="M 60 70 L 110 180 L 96 260 L 150 360 L 132 430" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - w.crack} />
          <path d="M 1000 70 L 960 160 L 990 250 L 940 330" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - w.crack} />
          <path d="M 520 72 L 500 150 L 530 240 L 510 320" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lerp(w.crack, [0.3, 1], [0, 1])} />
        </g>
        {/* ladrillo a la vista en el borde roto */}
        {top.roof ? <path d={`M ${roofEdge.map(([x, y]) => `${x} ${y}`).join(" L ")}`} stroke={M.brick} strokeWidth={14} fill="none" opacity={1 - top.ruin} /> : null}
      </g>
      {ruinHole ? <path d={`M ${ruinEdge.map(([x, y]) => `${x} ${y}`).join(" L ")}`} stroke={M.brick} strokeWidth={12} fill="none" /> : null}
    </Svg>
  );
};

/** Piso en perspectiva (cámara alta): polvo → hojas → musgo → tierra; charco mientras llueve adentro. */
export const Floor: React.FC<KitchenProps> = ({ year }) => {
  const f = floor(year);
  const top = LAYOUT.floorTop;
  const vp = { x: 540, y: -600 };
  const rows = [0, 34, 76, 128, 192, 270, 364, 480, 620];
  const cols = Array.from({ length: 17 }, (_, i) => -560 + i * 140);
  const pd = puddle(year);
  const lv = leaves(year);
  const P = LAYOUT.puddle;
  return (
    <Svg>
      <defs>
        <RoughFilter id="kc-floor-rough" seed={23} scale={30} freq={0.035} />
      </defs>
      <rect x={-40} y={top} width={1160} height={1920 - top + 40} fill={M.floor} />
      <g stroke={M.floorLine} strokeWidth={3}>
        {rows.map((r) => (
          <line key={r} x1={-40} y1={top + r} x2={1120} y2={top + r} />
        ))}
        {cols.map((x) => {
          const t = (1920 - vp.y) / (top - vp.y);
          return <line key={x} x1={x} y1={top} x2={vp.x + (x - vp.x) * t} y2={1920} />;
        })}
      </g>
      <rect x={-40} y={top} width={1160} height={700} fill={M.dust} opacity={0.18 * f.dust} />
      {pd > 0.01 ? (
        <g opacity={pd}>
          <ellipse cx={P.cx} cy={P.cy} rx={P.rx} ry={P.ry} fill={M.puddle} filter="url(#kc-floor-rough)" />
          <ellipse cx={P.cx + 60} cy={P.cy - 8} rx={70} ry={6} fill={K.moonLight} opacity={0.5} />
        </g>
      ) : null}
      {/* musgo en manchas */}
      {f.moss > 0.01 ? (
        <g filter="url(#kc-floor-rough)">
          {Array.from({ length: 14 }, (_, i) => {
            const x = random(`fm-x-${i}`) * 1080;
            const y = top + 40 + random(`fm-y-${i}`) * 560;
            const r = (40 + random(`fm-r-${i}`) * 70) * f.moss;
            return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.4} fill={i % 3 === 0 ? M.mossLight : M.moss} opacity={0.9} />;
          })}
        </g>
      ) : null}
      {/* hojas que entraron por la ventana */}
      {Array.from({ length: 26 }, (_, i) => {
        if (random(`lf-on-${i}`) > lv) return null;
        const x = 200 + random(`lf-x-${i}`) * 820;
        const y = top + 30 + random(`lf-y-${i}`) * 420;
        const rot = random(`lf-r-${i}`) * 360;
        return <ellipse key={i} cx={x} cy={y} rx={14} ry={6} fill={i % 2 ? M.leaf : M.leafDry} transform={`rotate(${rot} ${x} ${y})`} opacity={1 - f.soil} />;
      })}
      <rect x={-40} y={top} width={1160} height={720} fill={M.soil} opacity={0.92 * f.soil} />
    </Svg>
  );
};
