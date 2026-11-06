import React from "react";
import { interpolate, random } from "remotion";
import { lightRegime, mixColor, wallCracks, wallRemains, wallStain } from "../../decay";
import { CLAMP, fall, lerp } from "../../lib/anim";
import { LAYOUT, MASK, MAT } from "../../theme";
import { EVENT_YEARS, EVENTS } from "../../timeline";
import type { SceneBaseProps } from "../../types";
import { GrainFilter, RoughFilter, Svg } from "../svg";

const W = LAYOUT.window;
const H = LAYOUT.wall.h;

/** Cielo (plano más profundo). De noche en el año 0; de día desde la primera semana. */
export const Sky: React.FC<SceneBaseProps> = ({ year }) => {
  const { day } = lightRegime(year);
  return (
    <Svg>
      <defs>
        <linearGradient id="uep-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAT.skyHigh} />
          <stop offset="1" stopColor={MAT.sky} />
        </linearGradient>
      </defs>
      <rect x={-300} y={-300} width={1680} height={H + 320} fill="url(#uep-sky)" />
      <path
        d={`M -300 ${H - 60} C 80 ${H - 130} 300 ${H - 70} 520 ${H - 110} S 900 ${H - 150} 1380 ${H - 80} L 1380 ${H + 40} L -300 ${H + 40} Z`}
        fill={MAT.hill}
        opacity={0.75}
      />
      <rect x={-300} y={-300} width={1680} height={H + 340} fill={MAT.windowNight} opacity={1 - day} />
    </Svg>
  );
};

/** Paneles en que se parte la pared (los dos de abajo a los costados quedan como muro bajo). */
const PANELS: { pts: string; falls: number | null }[] = [
  { pts: "-200,-400 410,-400 410,0 372,300 392,560 -200,590", falls: 0 },
  { pts: "410,-400 735,-400 735,0 702,250 742,530 392,560 372,300 410,0", falls: 1 },
  { pts: "735,-400 1280,-400 1280,610 1080,600 742,530 702,250 735,0", falls: 2 },
  { pts: "392,560 742,530 1080,600 1280,610 1280,780 1080,780 700,820 420,860", falls: 3 },
  { pts: "-200,590 392,560 420,860 330,1180 -200,1180", falls: null },
  { pts: "420,860 700,820 1080,780 1280,780 1280,1180 330,1180", falls: null },
];

const CRACKS = [
  "M 392 560 L 372 300 L 410 0",
  "M 742 530 L 702 250 L 735 0",
  "M 392 560 L 742 530 L 1080 600",
  "M 420 860 L 700 820 L 1080 780",
  "M 600 1180 L 640 1020 L 610 900 L 700 820",
];

/** Fragmentos del vidrio de la ventana (triángulos dentro del marco). */
const SHARDS = Array.from({ length: 14 }, (_, i) => {
  const cx = W.x + 20 + random(`shard-x-${i}`) * (W.w - 40);
  const cy = W.y + 20 + random(`shard-y-${i}`) * (W.h - 40);
  const s = 24 + random(`shard-s-${i}`) * 40;
  const a = random(`shard-a-${i}`) * Math.PI * 2;
  const pts = [0, 1, 2]
    .map((k) => {
      const ang = a + (k * Math.PI * 2) / 3 + random(`shard-j-${i}-${k}`) * 0.8;
      return `${(Math.cos(ang) * s).toFixed(1)},${(Math.sin(ang) * s).toFixed(1)}`;
    })
    .join(" ");
  return { cx, cy, pts, spin: (random(`shard-r-${i}`) - 0.5) * 240, vx: (random(`shard-v-${i}`) - 0.3) * 14 };
});

const RIM = "M 0 0 L 40 0 L 10 26 Z M 300 0 L 260 0 L 292 40 Z M 0 400 L 0 350 L 34 400 Z M 300 400 L 250 400 L 300 362 Z";

export const Room: React.FC<SceneBaseProps> = ({ year, frame }) => {
  const stain = wallStain(year);
  const cracks = wallCracks(year);
  const remains = wallRemains(year);
  const broken = year >= EVENT_YEARS.glassBreak;
  const sinceBreak = frame - EVENTS.glassBreak;

  const panelState = (i: number | null) => {
    if (i === null) return { t: 0, fade: 1 };
    const ev = EVENTS.wallPanels[i];
    const active = year >= EVENT_YEARS.wallPanels[i];
    const t = fall(frame, ev, active);
    const fade = active ? interpolate(frame - ev, [4, 22], [1, 0], CLAMP) : 1;
    return { t, fade };
  };

  return (
    <Svg>
      <defs>
        <linearGradient id="uep-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAT.wallTop} />
          <stop offset="1" stopColor={MAT.wallBottom} />
        </linearGradient>
        <GrainFilter id="uep-wall-grain" seed={11} freq={0.7} opacity={0.08} />
        <RoughFilter id="uep-stain-rough" seed={4} scale={60} freq={0.012} />
        <RoughFilter id="uep-crack-rough" seed={9} scale={10} freq={0.08} />
        <mask id="uep-window-hole">
          <rect x={-300} y={-500} width={1700} height={H + 520} fill={MASK.show} />
          <rect x={W.x} y={W.y} width={W.w} height={W.h} fill={MASK.hide} />
        </mask>
      </defs>

      {/* Pared entera (evita costuras entre paneles mientras ninguno cayó) */}
      {year < EVENT_YEARS.wallPanels[0] ? (
        <g mask="url(#uep-window-hole)">
          <rect x={-200} y={-400} width={1480} height={H + 400} fill="url(#uep-wall)" filter="url(#uep-wall-grain)" />
        </g>
      ) : null}
      {PANELS.map((p, idx) => {
        const st = panelState(p.falls);
        if (st.fade <= 0.001) return null;
        const op = (p.falls === null ? remains : 1) * st.fade;
        if (op <= 0.001) return null;
        const [cx, cy] = p.pts.split(" ")[0].split(",").map(Number);
        return (
          <g
            key={idx}
            opacity={op}
            transform={`translate(${cx} ${cy + 90 * st.t}) scale(${1 - 0.08 * st.t}) translate(${-cx} ${-cy})`}
          >
            <g mask="url(#uep-window-hole)">
              <clipPath id={`uep-panel-${idx}`}>
                <polygon points={p.pts} />
              </clipPath>
              <g clipPath={`url(#uep-panel-${idx})`}>
                <rect x={-200} y={-400} width={1480} height={H + 400} fill="url(#uep-wall)" filter="url(#uep-wall-grain)" />
                {/* Grietas (dentro de cada panel: caen con él) */}
                <g filter="url(#uep-crack-rough)">
                  {CRACKS.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke={MAT.wallCrack} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lerp(cracks, [i * 0.12, 0.5 + i * 0.1], [0, 1])} />
                  ))}
                </g>
                {/* Mancha de humedad que crece desde el techo */}
                <g filter="url(#uep-stain-rough)" opacity={0.75 * Math.min(1, stain * 1.4)}>
                  <ellipse cx={640} cy={-40} rx={150 + 380 * stain} ry={60 + 520 * stain} fill={MAT.wallStain} />
                  <ellipse cx={180} cy={-30} rx={60 + 160 * stain} ry={40 + 280 * stain} fill={MAT.wallStain} opacity={0.8} />
                </g>
                {/* Zócalo */}
                <rect x={-200} y={H - 26} width={1480} height={26} fill={MAT.wallStain} opacity={0.6} />
                {/* Marco de la ventana */}
                <rect
                  x={W.x - W.frame}
                  y={W.y - W.frame}
                  width={W.w + W.frame * 2}
                  height={W.h + W.frame * 2}
                  fill="none"
                  stroke={mixColor(MAT.laminate, MAT.particle, stain)}
                  strokeWidth={W.frame * 2}
                />
                <rect x={W.x - W.frame - 10} y={W.y + W.h + W.frame - 2} width={W.w + W.frame * 2 + 20} height={14} fill={MAT.laminateLight} />
              </g>
            </g>
            {/* Vidrio de la ventana (dentro del hueco) */}
            {p.falls === 0 ? (
              <g clipPath={`url(#uep-panel-${idx})`}>
                <WindowGlass broken={broken} sinceBreak={sinceBreak} />
              </g>
            ) : null}
          </g>
        );
      })}

    </Svg>
  );
};

const WindowGlass: React.FC<{ broken: boolean; sinceBreak: number }> = ({ broken, sinceBreak }) => {
  const bars = (
    <g fill={MAT.laminate}>
      <rect x={W.x + W.w / 2 - 6} y={W.y} width={12} height={W.h} />
      <rect x={W.x} y={W.y + W.h / 2 - 6} width={W.w} height={12} />
    </g>
  );
  if (!broken) {
    return (
      <g>
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill={MAT.windowDay} opacity={0.12} />
        <polygon
          points={`${W.x + 20},${W.y + W.h} ${W.x + 120},${W.y} ${W.x + 170},${W.y} ${W.x + 70},${W.y + W.h}`}
          fill={MAT.specular}
          opacity={0.08}
        />
        {bars}
      </g>
    );
  }
  const fallT = Math.max(0, sinceBreak) / 30;
  return (
    <g>
      {sinceBreak < 12
        ? SHARDS.map((s, i) => {
            const t = fallT;
            const y = s.cy + 0.5 * 2600 * t * t;
            const x = s.cx + s.vx * sinceBreak;
            const op = interpolate(sinceBreak, [0, 8, 11], [1, 0.9, 0], CLAMP);
            return (
              <polygon
                key={i}
                points={s.pts}
                transform={`translate(${x} ${y}) rotate(${s.spin * t})`}
                fill={MAT.windowDay}
                opacity={0.5 * op}
                stroke={MAT.specular}
                strokeOpacity={0.5 * op}
                strokeWidth={1.5}
              />
            );
          })
        : null}
      <g transform={`translate(${W.x} ${W.y})`}>
        <path d={RIM} fill={MAT.windowDay} opacity={0.35} />
      </g>
      <g opacity={interpolate(sinceBreak, [0, 2], [1, 0.75], CLAMP)}>{bars}</g>
    </g>
  );
};
