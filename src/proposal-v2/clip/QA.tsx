import React from "react";
import { AbsoluteFill } from "remotion";
import { collisionReport, getCaptions } from "./captions";
import { CLIP_FRAMES } from "./timeline";
import { PruebaVisual } from "./PruebaAnimacionV2";

/** QA: choques del subtítulo fotograma a fotograma + hoja de contactos con cajas de depuración. */

export const QA_W = 1800;
export const QA_H = 2200;
const FONT = "'Segoe UI', 'Arial', sans-serif";

/** agrupa fotogramas consecutivos con el mismo choque */
const ranges = (rows: { f: number; hard: string[] }[]) => {
  const out: string[] = [];
  let a: { f0: number; f1: number; k: string } | null = null;
  for (const r of rows) {
    const k = r.hard.join(", ");
    if (a && a.k === k && r.f === a.f1 + 1) a.f1 = r.f;
    else {
      if (a) out.push(`f${a.f0}–${a.f1}: ${a.k}`);
      a = { f0: r.f, f1: r.f, k };
    }
  }
  if (a) out.push(`f${a.f0}–${a.f1}: ${a.k}`);
  return out;
};

export const QASubtitulos: React.FC = () => {
  const rows = collisionReport(CLIP_FRAMES / 30, CLIP_FRAMES);
  const caps = getCaptions(CLIP_FRAMES / 30, CLIP_FRAMES);
  const hard = rows.filter((r) => r.hard.length > 0);
  const outside = rows.filter((r) => r.outside);
  const soft = rows.filter((r) => r.soft.length > 0);
  const cw = 1700 / CLIP_FRAMES;
  const thumbs = Array.from({ length: 20 }, (_, i) => Math.round((i * (CLIP_FRAMES - 1)) / 19));
  const tw = 1700 / 10;
  const th = (tw * 1920) / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: "#15161A", color: "#EEE", fontFamily: FONT }}>
      <svg width={QA_W} height={QA_H}>
        <text x={50} y={70} fontSize={44} fontWeight={800} fill="#FFF">QA subtítulos · PruebaAnimacionV2</text>
        <text x={50} y={124} fontSize={30} fill={hard.length ? "#FF5A7A" : "#5CFFB0"}>
          {`Choques con elementos protegidos (cara, manos levantadas, vasos, precios, título): ${hard.length} de ${CLIP_FRAMES} fotogramas`}
        </text>
        <text x={50} y={168} fontSize={30} fill={outside.length ? "#FF5A7A" : "#5CFFB0"}>
          {`Fuera de la zona segura de Shorts: ${outside.length} fotogramas`}
        </text>
        <text x={50} y={212} fontSize={26} fill="#BBB">
          {`Superposición con zonas blandas (cuerpo / manos bajas): ${soft.length} fotogramas · páginas: ${caps.length}`}
        </text>
        {/* tira por fotograma: rojo choque duro, ámbar blando, verde limpio, gris sin subtítulo */}
        {rows.map((r) => {
          const hasCap = caps.some((p) => r.f >= p.f0 && r.f < p.f1);
          const c = r.hard.length ? "#FF2D55" : r.soft.length ? "#FFB020" : hasCap ? "#2BD47D" : "#3A3C44";
          return <rect key={r.f} x={50 + r.f * cw} y={250} width={cw + 0.5} height={50} fill={c} />;
        })}
        {caps.map((p, i) => (
          <text key={i} x={50 + p.f0 * cw + 2} y={330} fontSize={18} fill="#CCC">{`y${Math.round(p.cy)}`}</text>
        ))}
        {ranges(hard).slice(0, 26).map((g, i) => (
          <text key={i} x={50 + (i % 2) * 850} y={380 + Math.floor(i / 2) * 28} fontSize={21} fill="#FF8AA0">{g}</text>
        ))}
        {thumbs.map((f, i) => (
          <g key={f} transform={`translate(${50 + (i % 10) * tw},${760 + Math.floor(i / 10) * (th + 50)})`}>
            <foreignObject width={tw - 6} height={th}>
              <div style={{ width: 1080, height: 1920, transform: `scale(${(tw - 6) / 1080})`, transformOrigin: "0 0", position: "relative" }}>
                <PruebaVisual f={f} debug />
              </div>
            </foreignObject>
            <text x={4} y={th + 30} fontSize={22} fill="#DDD">{`f${f}`}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
