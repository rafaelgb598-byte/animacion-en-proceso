import React from "react";
import { interpolate, spring } from "remotion";
import { FONTS, STROOP } from "../../escenarios/mesa/theme";

/**
 * Explicación del efecto Stroop como una carrera entre dos procesos que van a la misma
 * "puerta de respuesta":
 *  A · LEER (automático): la palabra sale disparada y llega enseguida.
 *  B · NOMBRAR EL COLOR (esfuerzo): la tinta avanza lento, con esfuerzo.
 * Las dos llegan a la puerta, chocan, y sale la que llegó primero: la palabra.
 * Representación intuitiva (no anatómica). Coordenadas de pantalla.
 */

export type RaceTimes = { split: number; read: number; auto: number; name: number; clash: number; winner: number; out: number };
export type RaceGeom = {
  from: { x: number; y: number };
  a0: { x: number; y: number };
  b0: { x: number; y: number };
  gate: { x: number; y: number };
  /** tarjeta que se disuelve al separarse (opcional) */
  card?: { w: number; h: number; r: number };
  /** escala inicial de la ficha de la palabra (para que nazca del tamaño de la tarjeta) */
  wordFromScale?: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;

/** punto en la curva de un carril (de su inicio a la puerta) */
const lanePoint = (s: { x: number; y: number }, g: { x: number; y: number }, t: number, bow: number) => {
  const mx = (s.x + g.x) / 2;
  const my = (s.y + g.y) / 2 + bow;
  const u = 1 - t;
  return { x: u * u * s.x + 2 * u * t * mx + t * t * (g.x - 70), y: u * u * s.y + 2 * u * t * my + t * t * g.y };
};
const lanePath = (s: { x: number; y: number }, g: { x: number; y: number }, bow: number) =>
  `M ${s.x} ${s.y} Q ${(s.x + g.x) / 2} ${(s.y + g.y) / 2 + bow} ${g.x - 70} ${g.y}`;

const Track: React.FC<{ d: string; t: number; color: string; dash?: string }> = ({ d, t, color, dash }) =>
  t <= 0 ? null : (
    <g>
      <path d={d} stroke="#000" strokeOpacity={0.35} strokeWidth={30} fill="none" strokeLinecap="round" transform="translate(4,8)" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
      <path d={d} stroke="#23252B" strokeWidth={30} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
      <path d={d} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={dash ?? "1"} pathLength={dash ? undefined : 1} strokeDashoffset={dash ? 0 : 1 - t} opacity={0.75} />
    </g>
  );

export const RaceExplainer: React.FC<{ f: number; word: string; ink: string; times: RaceTimes; geom: RaceGeom; fps?: number }> = ({ f, word, ink, times, geom, fps = 30 }) => {
  if (f < times.split || f >= times.out + 10) return null;
  const leave = ramp(f, times.out, times.out + 10);
  const { from, a0, b0, gate } = geom;
  // 1 · la tarjeta se separa: la palabra va al carril A, la tinta al carril B
  const sp = spring({ frame: f - times.split, fps, config: { damping: 15, stiffness: 150, mass: 0.7 } });
  const trackT = ramp(f, times.split + 6, times.split + 20);
  const gateT = spring({ frame: f - (times.split + 10), fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
  // 2 · avance de cada proceso
  const aT = easeOut(ramp(f, times.auto - 2, times.auto + 7)) * 0.96; // casi instantáneo
  const bCrawl = ramp(f, times.name + 2, times.clash - 10) * 0.55; // lento
  const bWobble = f > times.name && f < times.clash ? 0.012 * Math.sin((f - times.name) * 0.9) : 0;
  const bT = Math.min(0.96, bCrawl + easeIn(ramp(f, times.clash - 10, times.clash)) * 0.41 + bWobble);
  const clashT = (f - times.clash) / 16;
  const win = ramp(f, times.winner, times.winner + 8);
  const shake = clashT > 0 && clashT < 1 ? 9 * Math.exp(-clashT * 4) * Math.sin(clashT * 40) : 0;
  const pA = f < times.split + 16 ? { x: lerp(from.x, a0.x, sp), y: lerp(from.y, a0.y, sp) } : lanePoint(a0, gate, aT, -40);
  const pB0 = { x: lerp(from.x, b0.x, sp), y: lerp(from.y, b0.y, sp) };
  const bounce = win > 0 ? -60 * easeOut(win) : 0;
  const pB = f < times.split + 16 ? pB0 : (() => {
    const p = lanePoint(b0, gate, bT, 40);
    return { x: p.x + bounce * 0.6, y: p.y + -bounce * 0.4 };
  })();
  const aIn = easeIn(win); // la palabra entra en la puerta
  const aPos = win > 0 ? { x: lerp(pA.x, gate.x, aIn), y: lerp(pA.y, gate.y, aIn) } : pA;
  const labelA = ramp(f, times.auto - 2, times.auto + 6);
  const labelB = ramp(f, times.name - 2, times.name + 6);
  const fast = f >= times.auto - 2 && f < times.auto + 10;
  const cardFade = 1 - ramp(f, times.split, times.split + 10);
  return (
    <g opacity={1 - leave} transform={`translate(${shake},0)`}>
      {geom.card && cardFade > 0 ? (
        <g opacity={cardFade} transform={`translate(${from.x},${from.y}) scale(${1 + 0.08 * (1 - cardFade)})`}>
          <rect x={-geom.card.w / 2} y={-geom.card.h / 2} width={geom.card.w} height={geom.card.h} rx={geom.card.r} fill={STROOP.card} stroke={STROOP.cardEdge} strokeWidth={3} />
        </g>
      ) : null}
      {/* carriles */}
      <Track d={lanePath(a0, gate, -40)} t={trackT} color="#F3EFE6" />
      <Track d={lanePath(b0, gate, 40)} t={trackT} color={ink} dash="10 14" />
      <g opacity={trackT}>
        <text x={a0.x - 10} y={a0.y - 52} fontFamily={FONTS.display} fontWeight={900} fontSize={34} fill={STROOP.text} letterSpacing={2}>
          LEER
        </text>
        <text x={a0.x - 10} y={a0.y - 20} fontFamily={FONTS.mono} fontSize={24} fill={STROOP.textDim} opacity={0.4 + 0.6 * labelA}>
          automático · rapidísimo
        </text>
        <text x={b0.x - 10} y={b0.y + 66} fontFamily={FONTS.display} fontWeight={900} fontSize={34} fill={STROOP.text} letterSpacing={2}>
          NOMBRAR EL COLOR
        </text>
        <text x={b0.x - 10} y={b0.y + 98} fontFamily={FONTS.mono} fontSize={24} fill={STROOP.textDim} opacity={0.4 + 0.6 * labelB}>
          esfuerzo · más lento
        </text>
      </g>

      {/* puerta de respuesta (la boca que tiene que decir UNA palabra) */}
      <g transform={`translate(${gate.x},${gate.y}) scale(${gateT})`}>
        <circle r={74} fill="#000" opacity={0.35} transform="translate(5,10)" />
        <circle r={74} fill={STROOP.card} stroke={clashT > 0 && clashT < 1 ? "#FFD84A" : STROOP.cardEdge} strokeWidth={6} />
        <text y={-90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={24} fill={STROOP.textDim}>
          respuesta
        </text>
        <path d="M -30 14 Q 0 40 30 14" stroke={STROOP.text} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>

      {/* líneas de velocidad del proceso A */}
      {fast ? (
        <g opacity={0.8}>
          {[-14, 0, 14].map((dy, i) => (
            <line key={i} x1={aPos.x - 130 - i * 20} y1={aPos.y + dy} x2={aPos.x - 60} y2={aPos.y + dy} stroke={STROOP.text} strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>
      ) : null}

      {/* proceso B: la tinta (gotas de esfuerzo mientras avanza) */}
      <g transform={`translate(${pB.x},${pB.y}) scale(${1 - 0.25 * win})`} opacity={1 - 0.6 * win}>
        <path transform="scale(0.5)" d="M -110 -20 C -90 -60, 40 -70, 100 -36 C 140 -10, 120 40, 60 50 C -10 62, -120 52, -126 14 C -128 -4, -120 -12, -110 -20 Z" fill={ink} stroke="#0A0B0D" strokeWidth={6} />
        {f > times.name && f < times.clash
          ? [0, 1].map((k) => {
              const ph = ((f - times.name) / 12 + k * 0.5) % 1;
              return <path key={k} transform={`translate(${-40 - ph * 20},${-34 - ph * 26})`} d="M 0 -10 Q 7 0 0 8 Q -7 0 0 -10 Z" fill="#9FD4FF" opacity={1 - ph} />;
            })
          : null}
      </g>

      {/* proceso A: la palabra */}
      <g transform={`translate(${aPos.x},${aPos.y}) scale(${(1 - 0.35 * aIn) * lerp(geom.wordFromScale ?? 1, 1, f < times.split + 16 ? sp : 1)})`}>
        <rect x={-108} y={-40} width={216} height={80} rx={18} fill={STROOP.card} stroke={win > 0 ? "#FFD84A" : STROOP.cardEdge} strokeWidth={4} />
        <text y={20} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={54} letterSpacing={-1} fill="none" stroke={STROOP.text} strokeWidth={3}>
          {word}
        </text>
      </g>

      {/* choque */}
      {clashT > 0 && clashT < 1 ? (
        <g opacity={Math.sin(Math.PI * clashT)}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r0 = 40 + 70 * clashT;
            return (
              <line key={i} x1={gate.x - 80 + Math.cos(a) * r0} y1={gate.y + Math.sin(a) * r0} x2={gate.x - 80 + Math.cos(a) * (r0 + 34 + (i % 2) * 20)} y2={gate.y + Math.sin(a) * (r0 + 34 + (i % 2) * 20)} stroke="#FFD84A" strokeWidth={7} strokeLinecap="round" />
            );
          })}
        </g>
      ) : null}

      {/* sale la palabra: globo con lo que "dice" la boca */}
      {win > 0 ? (
        <g transform={`translate(${gate.x - 20},${gate.y - 150}) scale(${interpolate(win, [0, 1], [0.6, 1])})`} opacity={win}>
          <path d="M -120 -50 Q -120 -80 -90 -80 L 90 -80 Q 120 -80 120 -50 L 120 20 Q 120 50 90 50 L 30 50 L 10 80 L 0 50 L -90 50 Q -120 50 -120 20 Z" fill="#F3EFE6" stroke="#0A0B0D" strokeWidth={5} />
          <text y={2} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={56} fill="#0A0B0D">
            ¡{word}!
          </text>
        </g>
      ) : null}
    </g>
  );
};
