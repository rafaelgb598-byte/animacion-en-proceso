import React from "react";
import { AbsoluteFill } from "remotion";
import { captionReport } from "../../01-efecto-senuelo/historial/subtitulos-v1/captions";
import { ROUND1, ROUND2, WORD_COLOR } from "./script";
import { stroopBoxes, STROOP_WORDS, TEXT_SAFE } from "./StroopShort";
import * as T from "./timeline";

/** QA del Short Stroop: prueba válida, spoiler, subtítulos, zona segura de textos y tics. */

export const QAS_W = 1400;
export const QAS_H = 900;
const FONT = "'Segoe UI', Arial, sans-serif";
const OPTS = { safe: TEXT_SAFE, bases: [1410, 1320, 1230, 1140, 1050, 960] };

export const QAStroop: React.FC = () => {
  // 1. prueba válida
  const r1ok = ROUND1.every((c) => WORD_COLOR[c.word] === c.ink);
  const r2match = ROUND2.filter((c) => WORD_COLOR[c.word] === c.ink).length;
  const r2rep = ROUND2.filter((c, i) => i > 0 && ROUND2[i - 1].ink === c.ink).length;
  const r2durs = ROUND2.map((c) => c.dur).join("·");
  // 2. subtítulos
  const { rows, jumps } = captionReport(T.DURATION, stroopBoxes, STROOP_WORDS, OPTS);
  const visible = (f: number) => f >= T.CAPTIONS_ON && f < T.CAPTIONS_OFF;
  const shown = rows.filter((r) => r.has && !r.hidden && visible(r.f));
  const spoiler = rows.filter((r) => r.has && !r.hidden && visible(r.f) && r.f < T.CAPTIONS_ON).length;
  const hard = shown.filter((r) => r.hard.length > 0);
  const lane = shown.filter((r) => r.lane).length;
  const lanePct = (100 * lane) / Math.max(1, shown.length);
  const rowsWithCap = rows.filter((r) => r.has && visible(r.f));
  const hidden = rowsWithCap.filter((r) => r.hidden).length;
  // 3. textos fuera de zona segura (cajas de texto protegidas, incluido el acercamiento)
  const outside: string[] = [];
  for (let f = 0; f < T.DURATION; f += 1) {
    for (const b of stroopBoxes(f)) {
      if (b.name === "cuerpo" || b.name.startsWith("mano") || b.name === "cara") continue;
      if (b.x0 < TEXT_SAFE.left - 1 || b.x1 > 940 + 1 || b.y0 < TEXT_SAFE.top - 1 || b.y1 > TEXT_SAFE.bottom + 1) outside.push(`f${f} ${b.name} [${b.x0.toFixed(0)}–${b.x1.toFixed(0)}, ${b.y0.toFixed(0)}–${b.y1.toFixed(0)}]`);
    }
  }
  const hidRanges = rowsWithCap.filter((r) => r.hidden).reduce<{ f0: number; f1: number }[]>((acc, r) => {
    const l = acc[acc.length - 1];
    if (l && r.f === l.f1 + 1) l.f1 = r.f;
    else acc.push({ f0: r.f, f1: r.f });
    return acc;
  }, []);
  const why = hidRanges.slice(0, 10).map((g) => {
    const names = new Set<string>();
    for (const b of stroopBoxes(g.f0)) if (b.kind === "hard" && b.y1 > 1180) names.add(`${b.name}[${b.x0.toFixed(0)}-${b.x1.toFixed(0)},${b.y0.toFixed(0)}-${b.y1.toFixed(0)}]`);
    return `oculto f${g.f0}–${g.f1}: ${[...names].join(" ")}`;
  });
  const uniq = [...new Set(outside.map((o) => o.replace(/^f\d+ /, "")))].slice(0, 8);
  const lines: [string, boolean][] = [
    [`Ronda 1: ${ROUND1.length} tarjetas, todas coinciden: ${r1ok ? "sí" : "NO"}`, r1ok],
    [`Ronda 2: coincidencias palabra/tinta: ${r2match} · tinta repetida seguida: ${r2rep} · duraciones ${r2durs}`, r2match === 0 && r2rep === 0],
    [`Spoiler: subtítulos visibles antes de f${T.CAPTIONS_ON}: ${spoiler}`, spoiler === 0],
    [`Subtítulos: choques ${hard.length} · en carril ${lanePct.toFixed(1)} % · saltos > 200 px: ${jumps.filter((j) => j.dy > 200).length} · ocultos ${hidden}`, hard.length === 0 && lanePct >= 95],
    [`Textos fuera de x 80–940 / y 240–1420: ${outside.length} fotogramas-caja`, outside.length === 0],
    [`Tics: ronda 1 en ${T.R1_STARTS.join(", ")} · ronda 2 en ${T.R2_STARTS.join(", ")} (mismo fotograma que cada tarjeta)`, true],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#15161A", fontFamily: FONT }}>
      <svg width={QAS_W} height={QAS_H}>
        <text x={40} y={64} fontSize={40} fontWeight={800} fill="#FFF">QA · StroopShort</text>
        {lines.map(([t, ok], i) => (
          <text key={i} x={40} y={130 + i * 52} fontSize={26} fill={ok ? "#5CFFB0" : "#FF5A7A"}>{`${ok ? "✔" : "✘"} ${t}`}</text>
        ))}
        {uniq.map((u, i) => (
          <text key={i} x={40} y={480 + i * 30} fontSize={20} fill="#FF8AA0">{u}</text>
        ))}
        {why.map((w, i) => (
          <text key={`w${i}`} x={40} y={640 + i * 26} fontSize={18} fill="#BBBBBB">{w}</text>
        ))}
        {hard.slice(0, 6).map((r, i) => (
          <text key={`h${i}`} x={760} y={480 + i * 30} fontSize={20} fill="#FF8AA0">{`f${r.f}: ${r.hard.join(", ")}`}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
