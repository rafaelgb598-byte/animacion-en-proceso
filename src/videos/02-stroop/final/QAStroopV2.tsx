import React from "react";
import { AbsoluteFill } from "remotion";
import { captionReport } from "../../01-efecto-senuelo/historial/subtitulos-v1/captions";
import { WORD_COLOR } from "../v1/script";
import { CAPTION_OPTS, TEXT_SAFE, V2_WORDS, v2Boxes } from "./GiroDatoStroopV2";
import { LEVELS } from "./script";
import * as T from "./timeline";

/** QA de GiroDatoStroopV2: prueba válida, ritmo, subtítulos, zona segura y sincronía de tics. */

export const QAV2_W = 1500;
export const QAV2_H = 1000;
const FONT = "'Segoe UI', Arial, sans-serif";
const OPTS = CAPTION_OPTS;

export const QAStroopV2: React.FC = () => {
  const l1ok = LEVELS[0].cards.every((c) => WORD_COLOR[c.word] === c.ink);
  const inc = [...LEVELS[1].cards, ...LEVELS[2].cards];
  const match = inc.filter((c) => WORD_COLOR[c.word] === c.ink).length;
  const rep = inc.filter((c, i) => i > 0 && inc[i - 1].ink === c.ink).length + (LEVELS[0].cards[LEVELS[0].cards.length - 1].ink === inc[0].ink ? 1 : 0);
  const first = T.STARTS[0][0];
  const { rows, jumps } = captionReport(T.DURATION, v2Boxes, V2_WORDS, OPTS);
  const shown = rows.filter((r) => r.has && !r.hidden);
  const hard = shown.filter((r) => r.hard.length > 0);
  const withCap = rows.filter((r) => r.has);
  const hidden = withCap.filter((r) => r.hidden).length;
  const lane = shown.filter((r) => r.lane).length;
  const lanePct = (100 * lane) / Math.max(1, shown.length);
  // subtítulos sobre la tarjeta del desafío
  const overCard = shown.filter((r) => r.hard.includes("tarjeta")).length;
  const outside: string[] = [];
  for (let f = 0; f < T.DURATION; f++) {
    for (const b of v2Boxes(f)) {
      if (b.name === "cuerpo" || b.name.startsWith("mano") || b.name === "cara" || b.name === "tarjeta") continue;
      if (b.x0 < TEXT_SAFE.left - 1 || b.x1 > 941 || b.y0 < TEXT_SAFE.top - 1 || b.y1 > TEXT_SAFE.bottom + 1) outside.push(`f${f} ${b.name} [${b.x0.toFixed(0)}–${b.x1.toFixed(0)}, ${b.y0.toFixed(0)}–${b.y1.toFixed(0)}]`);
    }
  }
  // la tarjeta en plano abierto (los primeros planos recortan a propósito)
  const card = v2Boxes(T.L_START[2]).find((b) => b.name === "tarjeta");
  const cardOk = !!card && card.x0 >= 80 && card.x1 <= 941 && card.y0 >= 240 && card.y1 <= 1420;
  const lines: [string, boolean][] = [
    [`Hook: ejemplo + instrucción desde f0 · cuenta regresiva f${T.COUNT[0]} · primera tarjeta con tiempo f${first} (${(first / 30).toFixed(2)} s), después de la regla (voz hasta f${T.voiceEnd("v1")})`, first > T.voiceEnd("v1")],
    [`Nivel 1 coincide: ${l1ok ? "sí" : "NO"} · niveles 2–3: coincidencias ${match}, tinta repetida seguida ${rep}`, l1ok && match === 0 && rep === 0],
    [`Tiempos por tarjeta: ${LEVELS.map((l) => l.cards.map((c) => c.dur).join("·")).join(" | ")}`, true],
    [`Subtítulos: choques ${hard.length} · sobre la tarjeta ${overCard} · en carril ${lanePct.toFixed(1)} % · saltos > 200 px ${jumps.filter((j) => j.dy > 200).length} · ocultos ${hidden}`, hard.length === 0 && lanePct >= 95],
    [`Textos fuera de x 80–940 / y 240–1420: ${outside.length} · tarjeta dentro de la zona segura: ${cardOk ? "sí" : "NO"}`, outside.length === 0 && cardOk],
    [`Voz: v1 ${T.VOICE_AT.v1}–${T.voiceEnd("v1")} · v2 ${T.VOICE_AT.v2}–${T.voiceEnd("v2")} · v3 ${T.VOICE_AT.v3}–${T.voiceEnd("v3")} · v4 ${T.VOICE_AT.v4}–${T.voiceEnd("v4")} · v5 ${T.VOICE_AT.v5}–${T.voiceEnd("v5")}`, T.voiceEnd("v5") < T.RETURN[1]],
    [`Pausas entre bloques de voz (fuera del desafío): v3→v4 ${T.VOICE_AT.v4 - T.voiceEnd("v3")} f · v4→v5 ${T.VOICE_AT.v5 - T.voiceEnd("v4")} f`, T.VOICE_AT.v4 - T.voiceEnd("v3") < 12 && T.VOICE_AT.v5 - T.voiceEnd("v4") < 12],
    [`Tics en el mismo fotograma que cada tarjeta: ${T.STARTS.flat().join(", ")}`, true],
  ];
  const hidRanges = withCap.filter((r) => r.hidden).reduce<{ f0: number; f1: number }[]>((acc, r) => {
    const l = acc[acc.length - 1];
    if (l && r.f === l.f1 + 1) l.f1 = r.f;
    else acc.push({ f0: r.f, f1: r.f });
    return acc;
  }, []);
  const why = hidRanges.slice(0, 10).map((g) => `oculto f${g.f0}–${g.f1}: ${v2Boxes(g.f0).filter((b) => b.kind === "hard" && b.y1 > 1180).map((b) => `${b.name}[${b.x0.toFixed(0)}-${b.x1.toFixed(0)},${b.y0.toFixed(0)}-${b.y1.toFixed(0)}]`).join(" ")}`);
  const uniq = [...new Set(outside.map((o) => o.replace(/^f\d+ /, "")))].slice(0, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: "#15161A", fontFamily: FONT }}>
      <svg width={QAV2_W} height={QAV2_H}>
        <text x={40} y={64} fontSize={40} fontWeight={800} fill="#FFF">QA · GiroDatoStroopV2</text>
        {lines.map(([t, ok], i) => (
          <text key={i} x={40} y={130 + i * 50} fontSize={24} fill={ok ? "#5CFFB0" : "#FF5A7A"}>{`${ok ? "✔" : "✘"} ${t}`}</text>
        ))}
        {uniq.map((u, i) => (
          <text key={i} x={40} y={560 + i * 28} fontSize={19} fill="#FF8AA0">{u}</text>
        ))}
        {why.map((w, i) => (
          <text key={`w${i}`} x={40} y={800 + i * 24} fontSize={17} fill="#BBBBBB">{w}</text>
        ))}
        {hard.slice(0, 8).map((r, i) => (
          <text key={`h${i}`} x={800} y={560 + i * 28} fontSize={19} fill="#FF8AA0">{`f${r.f}: ${r.hard.join(", ")}`}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
