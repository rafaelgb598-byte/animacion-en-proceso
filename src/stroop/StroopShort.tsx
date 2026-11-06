import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { ease, track } from "../character/anim";
import { CharacterV2 } from "../character/v2/CharacterV2";
import { snap } from "../character/v2/motion2";
import { SONIDOS } from "../biblioteca/sonidos";
import type { Box } from "../final-v2/cafe";
import { CaptionsLayer } from "../final-v2/CaptionsLayer";
import type { CaptionOpts } from "../final-v2/captions";
import type { Word } from "../short-final/words";
import { CitationCard } from "../components/stroop/CitationCard";
import { InterferenceDiagram } from "../components/stroop/InterferenceDiagram";
import { CARD, WordCard } from "../components/stroop/WordCard";
import { blockWords, ROUND1, ROUND2 } from "./script";
import { FONTS, INK, STROOP } from "./theme";
import * as T from "./timeline";
import { getTomi, tomiBoxes } from "./tomi";

/**
 * SHORT — «Decí el color» (efecto Stroop) · episodio 2 del canal.
 * Un único plano secuencia sobre la "mesa de evidencia", con Tomi V2. El último fotograma es
 * idéntico al primero (loop sin costura).
 */

export const stroopSchema = z.object({ showSafeZones: z.boolean(), hasVoiceover: z.boolean() });
export type StroopProps = z.infer<typeof stroopSchema>;
export const STROOP_FRAMES = T.DURATION;

const W = 1080;
const H = 1920;
/** zona segura de texto del episodio (y carril de subtítulos dentro de ella) */
export const TEXT_SAFE = { left: 80, right: 900, top: 240, bottom: 1420 };
const CAPTION_OPTS: CaptionOpts = { safe: TEXT_SAFE, bases: [1410, 1320, 1230, 1140, 1050, 960] };

/* ── cámara: plano secuencia con deriva senoidal; se acerca 6 % en el congelado ── */
export const camAt = (f: number) => {
  const z = track(f, [
    [0, 1],
    [T.FREEZE, 1],
    [T.FREEZE_ZOOM_END, T.ZOOM, snap(0, 0.01, 4.5, 1.6 * Math.PI)],
    [T.ZOOM_BACK[0], T.ZOOM],
    [T.ZOOM_BACK[1], 1, ease.inOut],
  ]);
  const ph = (f / T.LAST) * Math.PI * 2;
  // temblor breve al golpe del sello
  const d = f - T.STAMP_HIT;
  const sh = d >= 0 && d < 14 ? 7 * Math.exp(-d / 4) * Math.sin(d * 2.6) : 0;
  return { z, x: 3 * Math.sin(ph) + sh, y: 2 * Math.sin(2 * ph) };
};
const camPoint = (f: number) => {
  const c = camAt(f);
  return (v: { x: number; y: number }) => ({ x: CARD.cx + (v.x - CARD.cx) * c.z + c.x, y: CARD.cy + (v.y - CARD.cy) * c.z + c.y });
};

/* ── palabras de los subtítulos (solo explicación y sello) ── */
const shift = (ws: Word[], at: number): Word[] => ws.map((w) => ({ ...w, s: w.s + at / T.FPS, e: w.e + at / T.FPS }));
export const STROOP_WORDS: Word[] = [...shift(blockWords("v3"), T.V3_AT), ...shift(blockWords("v4"), T.V4_AT)];
const captionsOn = (f: number) => f >= T.CAPTIONS_ON && f < T.CAPTIONS_OFF;

/* ── cabeceras ── */
type Head = { from: number; to: number; lines: React.ReactNode[] };
const HEADS: Head[] = [
  { from: -1, to: T.HEAD1_OUT, lines: [<tspan key="a">DECÍ EL COLOR.</tspan>, <tspan key="b">NO LA PALABRA.</tspan>] },
  { from: T.HEAD2_IN, to: T.HEAD2_OUT, lines: [<tspan key="a">AHORA EN SERIO.</tspan>] },
  {
    from: T.HEAD_EFFECT - 4,
    to: T.END_IN - 6,
    lines: [
      <React.Fragment key="a">
        <tspan>EFECTO </tspan>
        <tspan fontFamily={FONTS.serif} fontStyle="italic" fontWeight={700}>
          Stroop
        </tspan>
      </React.Fragment>,
    ],
  },
  { from: T.END_IN, to: T.RETURN[0] + 4, lines: [<tspan key="a">¿TE ANIMÁS OTRA VEZ?</tspan>] },
  { from: T.RETURN[0] + 8, to: T.DURATION + 100, lines: [<tspan key="a">DECÍ EL COLOR.</tspan>, <tspan key="b">NO LA PALABRA.</tspan>] },
];
const HEAD_Y = 330;
const HEAD_X = 510;
/** la cabecera más larga («¿TE ANIMÁS OTRA VEZ?») se achica para entrar en la caja */
const fitHead = (h: Head, li: number) => (h.from === T.END_IN && li === 0 ? 0.84 : 1);
const headBox = (h: Head, f: number) => {
  const tin = h.from < 0 ? 1 : snap(0, 0.01, 4.5, 1.6 * Math.PI)(Math.min(1, Math.max(0, (f - h.from) / 9)));
  const tout = ease.in(Math.min(1, Math.max(0, (f - h.to) / 8)));
  return { tin, tout, visible: f >= h.from && tout < 1 };
};
const Headline: React.FC<{ f: number }> = ({ f }) => (
  <>
    {HEADS.map((h, i) => {
      const { tin, tout, visible } = headBox(h, f);
      if (!visible) return null;
      const sc = (1.08 - 0.08 * tin) * (1 - 0.2 * tout);
      return (
        <g key={i} opacity={Math.min(1, tin * 3) * (1 - tout)} transform={`translate(${HEAD_X},${HEAD_Y - tout * 60}) scale(${sc}) rotate(-1.5)`}>
          <rect x={-405} y={-84} width={810} height={h.lines.length > 1 ? 232 : 140} rx={26} fill="#FFFFFF" stroke={STROOP.line} strokeWidth={9} />
          {h.lines.map((ln, li) => (
            <text key={li} x={0} y={li === 0 ? 14 : 112} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={(li === 0 ? 76 : 56) * fitHead(h, li)} letterSpacing={-2} fill={STROOP.line}>
              {ln}
            </text>
          ))}
        </g>
      );
    })}
  </>
);

/* ── «RONDA 1» ── */
const MonoLabel: React.FC<{ f: number; text: string; from: number; to: number; x: number; y: number }> = ({ f, text, from, to, x, y }) => {
  if (f < from || f >= to + 6) return null;
  const o = Math.min(1, (f - from) / 3) * (1 - Math.max(0, (f - to) / 6));
  return (
    <g opacity={o} transform={`translate(${x},${y})`}>
      <rect x={-140} y={-38} width={280} height={66} rx={12} fill="none" stroke={STROOP.textDim} strokeWidth={3} />
      <text x={0} y={8} textAnchor="middle" fontFamily={FONTS.mono} fontSize={36} letterSpacing={6} fill={STROOP.text}>
        {text}
      </text>
    </g>
  );
};

/* ── sello naranja «STROOP» ── */
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.STAMP_HIT - 4 || f >= T.END_IN + 4) return null;
  const s = spring({ frame: f - (T.STAMP_HIT - 4), fps: T.FPS, config: { damping: 11, stiffness: 320, mass: 0.6 } });
  const o = Math.min(1, (f - (T.STAMP_HIT - 4)) / 2) * (1 - Math.max(0, (f - T.END_IN) / 4));
  return (
    <g opacity={o} transform={`translate(${CARD.cx},${CARD.cy}) rotate(-8) scale(${1.9 - 0.9 * s})`}>
      <rect x={-330} y={-110} width={660} height={220} rx={24} fill="none" stroke={STROOP.accent} strokeWidth={14} />
      <rect x={-306} y={-86} width={612} height={172} rx={14} fill="none" stroke={STROOP.accent} strokeWidth={4} opacity={0.7} />
      <text x={0} y={52} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={150} letterSpacing={6} fill={STROOP.accent}>
        STROOP
      </text>
    </g>
  );
};

/* ── comentario sugerido (en la zona de subtítulos, en Mono) ── */
const Comment: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = T.COMMENT;
  if (f < a || f >= b + 8) return null;
  const o = Math.min(1, (f - a) / 6) * (1 - Math.max(0, (f - b) / 8));
  return (
    <text x={585} y={1380} textAnchor="middle" fontFamily={FONTS.mono} fontSize={30} fill={STROOP.text} opacity={o}>
      Comentá: ¿en qué tarjeta te trabaste?
    </text>
  );
};

/* ── zonas protegidas por fotograma (subtítulos y QA) ── */
export const stroopBoxes = (f: number): Box[] => {
  const cp = camPoint(f);
  const out: Box[] = tomiBoxes(f, cp);
  const rect = (x0: number, y0: number, x1: number, y1: number, name: string): Box => {
    const p = cp({ x: x0, y: y0 });
    const q = cp({ x: x1, y: y1 });
    return { x0: p.x, y0: p.y, x1: q.x, y1: q.y, kind: "hard", name };
  };
  if (f >= T.SPLIT && f < T.STAMP_IN + 10) {
    out.push(rect(125, 495, 475, 790, "capa palabra"), rect(515, 855, 865, 1085, "capa tinta"), rect(440, 680, 600, 840, "choque"));
  }
  if (f >= T.CITE_IN && f < T.STAMP_IN + 10) out.push({ x0: 200, y0: 250, x1: 860, y1: 410, kind: "hard", name: "cita" });
  if (f >= T.STAMP_HIT - 4 && f < T.END_IN + 4) out.push(rect(170, 620, 870, 900, "sello"));
  for (const h of HEADS) {
    const { visible } = headBox(h, f);
    if (visible) out.push({ x0: HEAD_X - 410, y0: HEAD_Y - 90, x1: HEAD_X + 410, y1: HEAD_Y + (h.lines.length > 1 ? 150 : 60), kind: "hard", name: "cabecera" });
  }
  return out;
};

/* ── escena ── */
const Table: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={STROOP.bg} />
    {/* vetas muy sutiles de la mesa */}
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M -100 ${120 + i * 92} C 300 ${100 + i * 92}, 700 ${150 + i * 92}, 1200 ${110 + i * 92}`} stroke="#16171B" strokeWidth={3} fill="none" opacity={0.7} />
    ))}
    {/* foco cálido sobre la tarjeta */}
    <ellipse cx={CARD.cx} cy={CARD.cy + 40} rx={720} ry={760} fill="url(#stroopSpot)" />
  </g>
);

const TableLip: React.FC = () => (
  <g>
    <rect x={-200} y={1450} width={W + 400} height={700} fill="url(#stroopLip)" />
    <rect x={-200} y={1446} width={W + 400} height={6} fill="#3A322B" />
  </g>
);

export const StroopVisual: React.FC<{ f: number; showSafeZones?: boolean }> = ({ f, showSafeZones = false }) => {
  const c = camAt(f);
  const { pose, rig } = getTomi()[Math.min(T.LAST, Math.max(0, f))];
  const camTf = `translate(${c.x},${c.y}) translate(${CARD.cx},${CARD.cy}) scale(${c.z}) translate(${-CARD.cx},${-CARD.cy})`;
  const last = ROUND2[ROUND2.length - 1];
  const grainSeed = f === T.LAST ? 0 : f % 8;
  return (
    <AbsoluteFill style={{ backgroundColor: STROOP.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="stroopSpot">
            <stop offset="0" stopColor={STROOP.spot} stopOpacity={0.13} />
            <stop offset="0.6" stopColor={STROOP.spot} stopOpacity={0.04} />
            <stop offset="1" stopColor={STROOP.spot} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="stroopLip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STROOP.tableLip} />
            <stop offset="1" stopColor="#0B0A09" />
          </linearGradient>
          <linearGradient id="stroopPaper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.05} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.12} />
          </linearGradient>
          <radialGradient id="stroopVignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
          <filter id="stroopSoft" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
          <filter id="stroopGrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={grainSeed} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" />
          </filter>
        </defs>

        <g transform={camTf}>
          <Table />
          <CharacterV2 pose={pose} rig={rig} uid="stroopTomi" />
          <TableLip />

          {ROUND1.map((cd, i) => (
            <WordCard key={`r1${i}`} f={f} word={cd.word} ink={INK[cd.ink]} start={T.R1_STARTS[i]} dur={cd.dur} />
          ))}
          {ROUND2.map((cd, i) => (
            <WordCard
              key={`r2${i}`}
              f={f}
              word={cd.word}
              ink={INK[cd.ink]}
              start={T.R2_STARTS[i]}
              dur={i === ROUND2.length - 1 ? T.SPLIT - T.R2_STARTS[i] : cd.dur}
              exits={i !== ROUND2.length - 1}
            />
          ))}
          <InterferenceDiagram
            f={f}
            word={last.word}
            ink={INK[last.ink]}
            times={{ split: T.SPLIT, read: T.LABEL_READ, name: T.LABEL_NAME, clash: T.CLASH, winner: T.WINNER, out: T.STAMP_IN }}
          />
          <MonoLabel f={f} text="RONDA 1" from={T.R1_LABEL} to={T.R1_LABEL_END} x={CARD.cx} y={CARD.cy} />
          <Stamp f={f} />
        </g>

        <CitationCard f={f} at={T.CITE_IN} out={T.STAMP_IN} x={530} y={330} title="Stroop · 1935" source="Journal of Experimental Psychology" />
        <Headline f={f} />
        <Comment f={f} />
        <CaptionsLayer f={f} frames={T.DURATION} boxesAt={stroopBoxes} words={STROOP_WORDS} opts={CAPTION_OPTS} italic={["automatico", "stroop"]} visible={captionsOn} />

        <rect x={0} y={0} width={W} height={H} fill="url(#stroopVignette)" />
        <rect x={0} y={0} width={W} height={H} filter="url(#stroopGrain)" opacity={0.55} />

        {showSafeZones ? (
          <g>
            <rect x={TEXT_SAFE.left} y={TEXT_SAFE.top} width={940 - TEXT_SAFE.left} height={TEXT_SAFE.bottom - TEXT_SAFE.top} fill="none" stroke="#00FF9C" strokeWidth={3} strokeDasharray="14 10" />
            <rect x={0} y={1536} width={W} height={H - 1536} fill="#FF0040" opacity={0.12} />
            {stroopBoxes(f).map((b, i) => (
              <rect key={i} x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="none" stroke={b.kind === "hard" ? "#FF2D55" : "#FFB020"} strokeWidth={b.kind === "hard" ? 4 : 2} />
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ── audio ── */
const VOICE_GAIN = 1.05;
const TICK_R1 = 0.28;
const TICK_R2 = 0.5;

export const StroopShort: React.FC<StroopProps> = ({ showSafeZones, hasVoiceover }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <StroopVisual f={f} showSafeZones={showSafeZones} />
      <Audio src={staticFile(SONIDOS["sala-cafe"])} volume={0.05} durationInFrames={T.DURATION} />
      {hasVoiceover
        ? (Object.keys(T.VOICE_AT) as (keyof typeof T.VOICE_AT)[]).map((id) => (
            <Sequence key={id} from={T.VOICE_AT[id]} layout="none" name={`voz ${id}`}>
              <Audio src={staticFile(`stroop/vo/${id}.mp3`)} volume={VOICE_GAIN} />
            </Sequence>
          ))
        : null}
      <Sequence from={T.R1_LABEL} durationInFrames={10} layout="none" name="tic ronda 1">
        <Audio src={staticFile("stroop/sfx/tic-r1.wav")} volume={TICK_R1} />
      </Sequence>
      {T.R1_STARTS.map((s, i) => (
        <Sequence key={`t1${i}`} from={s} durationInFrames={10} layout="none" name={`tic r1-${i + 1}`}>
          <Audio src={staticFile("stroop/sfx/tic-r1.wav")} volume={TICK_R1} />
        </Sequence>
      ))}
      {T.R2_STARTS.map((s, i) => (
        <Sequence key={`t2${i}`} from={s} durationInFrames={10} layout="none" name={`tic r2-${i + 1}`}>
          <Audio src={staticFile(`stroop/sfx/tic-r2-${i + 1}.wav`)} volume={TICK_R2} />
        </Sequence>
      ))}
      <Sequence from={T.FREEZE} durationInFrames={30} layout="none" name="golpe sordo">
        <Audio src={staticFile(SONIDOS.thud)} volume={0.8} />
      </Sequence>
      <Sequence from={T.STAMP_HIT} durationInFrames={30} layout="none" name="sello">
        <Audio src={staticFile(SONIDOS.impact)} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};

