import React from "react";
import { AbsoluteFill } from "remotion";
import { DURATION } from "../short-final/timing";
import { captionReport } from "../historial/subtitulos-v1/captions";
import { frameBoxes } from "./layout";
import { TomiV2Visual } from "./EfectoSenueloTomiV2";

/** QA del Short V2: choques, permanencia en el carril de abajo, saltos y hoja de contactos. */

export const QA2_W = 1800;
export const QA2_H = 2600;
const FONT = "'Segoe UI', 'Arial', sans-serif";

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

export const QATomiV2: React.FC = () => {
  const { rows, caps, jumps } = captionReport(DURATION, frameBoxes);
  const withCap = rows.filter((r) => r.has);
  const hard = rows.filter((r) => r.hard.length > 0);
  const hidden = rows.filter((r) => r.hidden);
  const lane = withCap.filter((r) => r.lane && !r.hidden);
  const lanePct = (100 * lane.length) / Math.max(1, withCap.length);
  const bigJumps = jumps.filter((j) => j.dy > 200);
  const cw = 1700 / DURATION;
  const thumbs = Array.from({ length: 30 }, (_, i) => Math.round((i * (DURATION - 1)) / 29));
  const tw = 1700 / 10;
  const th = (tw * 1920) / 1080;
  const ok = (b: boolean) => (b ? "#5CFFB0" : "#FF5A7A");
  return (
    <AbsoluteFill style={{ backgroundColor: "#15161A", fontFamily: FONT }}>
      <svg width={QA2_W} height={QA2_H}>
        <text x={50} y={70} fontSize={44} fontWeight={800} fill="#FFF">QA subtítulos · Short V2 completo</text>
        <text x={50} y={122} fontSize={30} fill={ok(hard.length === 0)}>{`Choques con elementos protegidos: ${hard.length} de ${DURATION} fotogramas`}</text>
        <text x={50} y={164} fontSize={30} fill={ok(lanePct >= 95)}>{`En el carril de abajo: ${lanePct.toFixed(1)} % del tiempo con subtítulo`}</text>
        <text x={50} y={206} fontSize={30} fill={ok(bigJumps.length === 0)}>{`Saltos de posición: ${jumps.length} (de más de 200 px: ${bigJumps.length}) · ocultos por falta de lugar: ${hidden.length} fotogramas`}</text>
        {/* tira: verde = carril de abajo · azul = otro lugar · gris = oculto/sin subtítulo · rojo = choque */}
        {rows.map((r) => {
          const c = r.hard.length ? "#FF2D55" : !r.has || r.hidden ? "#3A3C44" : r.lane ? "#2BD47D" : "#3D8BFF";
          return <rect key={r.f} x={50 + r.f * cw} y={240} width={cw + 0.5} height={50} fill={c} />;
        })}
        <text x={50} y={320} fontSize={20} fill="#AAA">verde: carril de abajo · azul: otro lugar · gris: sin subtítulo / oculto · rojo: choque</text>
        {ranges(hard).slice(0, 10).map((g, i) => (
          <text key={i} x={50} y={360 + i * 26} fontSize={20} fill="#FF8AA0">{g}</text>
        ))}
        {rows
          .filter((r) => r.has && !r.lane && !r.hidden)
          .reduce<{ f0: number; f1: number; y: number }[]>((acc, r) => {
            const l = acc[acc.length - 1];
            if (l && r.f === l.f1 + 1 && l.y === r.y) l.f1 = r.f;
            else acc.push({ f0: r.f, f1: r.f, y: r.y });
            return acc;
          }, [])
          .slice(0, 12)
          .map((g, i) => (
            <text key={i} x={900} y={360 + i * 26} fontSize={20} fill="#9CC2FF">{`f${g.f0}–${g.f1}: y${g.y}`}</text>
          ))}
        {rows
          .filter((r) => r.hidden)
          .reduce<{ f0: number; f1: number }[]>((acc, r) => {
            const l = acc[acc.length - 1];
            if (l && r.f === l.f1 + 1) l.f1 = r.f;
            else acc.push({ f0: r.f, f1: r.f });
            return acc;
          }, [])
          .slice(0, 12)
          .map((g, i) => (
            <text key={`h${i}`} x={1350} y={360 + i * 26} fontSize={20} fill="#BBBBBB">{`oculto f${g.f0}–${g.f1}`}</text>
          ))}
        <text x={50} y={700} fontSize={22} fill="#888">{`páginas: ${caps.length}`}</text>
        {thumbs.map((f, i) => (
          <g key={f} transform={`translate(${50 + (i % 10) * tw},${730 + Math.floor(i / 10) * (th + 46)})`}>
            <foreignObject width={tw - 6} height={th}>
              <div style={{ width: 1080, height: 1920, transform: `scale(${(tw - 6) / 1080})`, transformOrigin: "0 0", position: "relative" }}>
                <TomiV2Visual f={f} debug inst={`qa${i}`} />
              </div>
            </foreignObject>
            <text x={4} y={th + 28} fontSize={20} fill="#DDD">{`f${f}`}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
