import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { ease } from "../character/anim";
import { CharacterV2 } from "../character/v2/CharacterV2";
import { snap } from "../character/v2/motion2";
import { SONIDOS } from "../biblioteca/sonidos";
import type { Box } from "../final-v2/cafe";
import { CaptionsLayer } from "../final-v2/CaptionsLayer";
import type { CaptionOpts } from "../final-v2/captions";
import type { Word } from "../short-final/words";
import { RaceExplainer, type RaceGeom } from "../components/stroop/RaceExplainer";
import { WordCard, wordSize, type CardGeom } from "../components/stroop/WordCard";
import { blockWords, voiceSrc } from "./voice";
import { FONTS, INK, STROOP } from "../stroop/theme";
import { EXAMPLE, LAST_CARD, LEVELS } from "./script";
import * as T from "./timeline";
import { getTomiV2, tomiBoxes } from "./tomi";

/**
 * GIRODATO · «Decí el color» V2 (efecto Stroop).
 * Mismo personaje, voz, tintas y estética que la V1, con un montaje nuevo: el desafío arranca
 * en el segundo 1, tres niveles, Tomi más grande y expresivo, primeros planos motivados,
 * explicación animada como una carrera entre dos procesos y loop sin costura.
 */

export const giroDatoStroopV2Schema = z.object({ showSafeZones: z.boolean(), hasVoiceover: z.boolean() });
export type GiroDatoStroopV2Props = z.infer<typeof giroDatoStroopV2Schema>;
export const GIRODATO_STROOP_V2_FRAMES = T.DURATION;

const W = 1080;
const H = 1920;
export const TEXT_SAFE = { left: 80, right: 900, top: 240, bottom: 1420 };
export const CAPTION_OPTS: CaptionOpts = { safe: TEXT_SAFE, bases: [1410, 1320, 1230, 1140, 1050, 960], oneLineMax: 20 };
/** tarjeta del desafío: más grande y más arriba que en la V1 */
export const CARD2: CardGeom = { cx: 510, cy: 715, w: 820, h: 350, fontSize: 200, maxText: 740 };
/** el diagrama se dibuja 18 % más grande alrededor de este punto */
const RACE_SCALE = 1.18;
const RACE_PIVOT = { x: 600, y: 660 };
const raceTf = `translate(${RACE_PIVOT.x},${RACE_PIVOT.y}) scale(${RACE_SCALE}) translate(${-RACE_PIVOT.x},${-RACE_PIVOT.y})`;
/** coordenadas dentro del grupo escalado que caen sobre la tarjeta real */
const unscale = (v: { x: number; y: number }) => ({ x: RACE_PIVOT.x + (v.x - RACE_PIVOT.x) / RACE_SCALE, y: RACE_PIVOT.y + (v.y - RACE_PIVOT.y) / RACE_SCALE });
const RACE: RaceGeom = {
  card: { w: CARD2.w / RACE_SCALE, h: CARD2.h / RACE_SCALE, r: 28 / RACE_SCALE },
  from: unscale({ x: CARD2.cx, y: CARD2.cy }),
  a0: { x: 380, y: 520 },
  b0: { x: 400, y: 780 },
  gate: { x: 780, y: 650 },
  // la palabra de la tarjeta (200 px) se encoge hasta la ficha (54 px)
  wordFromScale: wordSize(LAST_CARD.word, CARD2) / 54 / RACE_SCALE,
};
const rs = (v: { x: number; y: number }) => ({ x: (v.x - RACE_PIVOT.x) * RACE_SCALE + RACE_PIVOT.x, y: (v.y - RACE_PIVOT.y) * RACE_SCALE + RACE_PIVOT.y });

/* ── cámara: planos con intención (abierto / primer plano de Tomi), cortes secos ── */
type Shot = { from: number; kind: "wide" | "close" | "punch" };
const SHOTS: Shot[] = [
  { from: 0, kind: "wide" },
  { from: T.CLOSE1[0], kind: "close" },
  { from: T.CLOSE1[1], kind: "wide" },
  { from: T.FREEZE, kind: "punch" },
  { from: T.CLOSE2[0], kind: "close" },
  { from: T.CLOSE2[1], kind: "wide" },
];
const shotAt = (f: number) => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].from) i++;
  return SHOTS[i];
};
export const camAt = (f: number) => {
  const s = shotAt(f);
  const ph = (f / T.LAST) * Math.PI * 2;
  const drift = { x: 3 * Math.sin(ph), y: 2 * Math.sin(2 * ph) };
  const settle = s.from > 0 ? 1 + 0.035 * Math.exp(-(f - s.from) / 4) : 1;
  const stampShake = f >= T.STAMP_HIT && f < T.STAMP_HIT + 14 ? 7 * Math.exp(-(f - T.STAMP_HIT) / 4) * Math.sin((f - T.STAMP_HIT) * 2.6) : 0;
  if (s.kind === "close") {
    const h = getTomiV2()[s.from].head;
    const z = 1.8 * settle;
    // la cara queda en (470, 780) en el primer plano 1 y en (470, 880) en el 2 (deja ver la tarjeta congelada)
    const ty = s.from === T.CLOSE1[0] ? 760 : 880;
    return { cx: h.x - (470 - 540) / z, cy: h.y - (ty - 960) / z, z, dx: drift.x, dy: drift.y };
  }
  if (s.kind === "punch") {
    const z = 1.06 + 0.02 * Math.exp(-(f - s.from) / 3);
    return { cx: 470, cy: 900, z, dx: drift.x, dy: drift.y };
  }
  return { cx: 540, cy: 960, z: 1, dx: drift.x + stampShake, dy: drift.y };
};
const camPoint = (f: number) => {
  const c = camAt(f);
  return (v: { x: number; y: number }) => ({ x: (v.x - c.cx) * c.z + 540 + c.dx, y: (v.y - c.cy) * c.z + 960 + c.dy });
};

/* ── subtítulos: los cinco bloques de voz ── */
const shift = (ws: Word[], at: number): Word[] => ws.map((w) => ({ ...w, s: w.s + at / T.FPS, e: w.e + at / T.FPS }));
export const V2_WORDS: Word[] = (Object.keys(T.VOICE_AT) as T.VoiceId[]).flatMap((id) => shift(blockWords(id), T.VOICE_AT[id]));

/* ── cabeceras ── */
type Head = { from: number; to: number; big?: boolean; lines: React.ReactNode[]; compactAt?: readonly [number, number] };
const TITLE_LINES = [<tspan key="a">DECÍ EL COLOR</tspan>, <tspan key="b">NO LA PALABRA</tspan>];
const HEADS: Head[] = [
  { from: -1, to: T.FREEZE - 4, lines: TITLE_LINES, compactAt: T.TITLE_COMPACT },
  {
    from: T.HEAD_EFFECT - 4,
    to: T.END_HEAD,
    lines: [
      <React.Fragment key="a">
        <tspan>EFECTO </tspan>
        <tspan fontFamily={FONTS.serif} fontStyle="italic" fontWeight={700}>
          Stroop
        </tspan>
      </React.Fragment>,
    ],
  },
  { from: T.END_HEAD, to: T.RETURN[0], lines: [<tspan key="a">¿TE ANIMÁS OTRA VEZ?</tspan>] },
  { from: T.RETURN[0] + 2, to: T.DURATION + 100, lines: TITLE_LINES },
];
const HEAD_X = 510;
const HEAD_Y = 337;
const headState = (h: Head, f: number) => {
  const tin = h.from < 0 ? 1 : snap(0, 0.01, 4.5, 1.6 * Math.PI)(Math.min(1, Math.max(0, (f - h.from) / 9)));
  const tout = ease.in(Math.min(1, Math.max(0, (f - h.to) / 7)));
  const c = h.compactAt ? ease.inOut(Math.min(1, Math.max(0, (f - h.compactAt[0]) / (h.compactAt[1] - h.compactAt[0])))) : 0;
  const scale = (1.04 - 0.04 * tin) * (1 - 0.2 * tout) * (1 - 0.28 * c);
  const y = HEAD_Y - 28 * c;
  return { tin, tout, c, scale, y, visible: f >= h.from && tout < 1 };
};
const headHeight = (h: Head) => (h.lines.length > 1 ? 232 : 140);
const Headline: React.FC<{ f: number }> = ({ f }) => (
  <>
    {HEADS.map((h, i) => {
      const st = headState(h, f);
      if (!st.visible) return null;
      const long = h.from === T.END_HEAD;
      return (
        <g key={i} opacity={Math.min(1, st.tin * 3) * (1 - st.tout)} transform={`translate(${HEAD_X},${st.y}) scale(${st.scale}) rotate(-1.5)`}>
          <rect x={-390} y={-84} width={780} height={headHeight(h)} rx={26} fill="#FFFFFF" stroke={STROOP.line} strokeWidth={9} />
          {h.lines.map((ln, li) => (
            <text key={li} x={0} y={li === 0 ? 14 : 116} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={li === 0 ? (long ? 58 : 82) : 60} letterSpacing={-2} fill={li === 0 ? STROOP.line : "#E24E5A"}>
              {ln}
            </text>
          ))}
        </g>
      );
    })}
  </>
);
const headBox = (h: Head, f: number): Box | null => {
  const st = headState(h, f);
  if (!st.visible) return null;
  const hh = headHeight(h) * st.scale;
  return { x0: HEAD_X - 395 * st.scale, y0: st.y - 87 * st.scale, x1: HEAD_X + 395 * st.scale, y1: st.y - 87 * st.scale + hh + 12, kind: "hard", name: "cabecera" };
};

/* ── chip de nivel + progreso ── */
const CHIP_Y = 470;
const levelAt = (f: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) if (f >= T.L_START[LEVELS[i].id] - 8) return i;
  return -1;
};
const LevelChip: React.FC<{ f: number }> = ({ f }) => {
  const i = levelAt(f);
  if (i < 0 || f >= T.FREEZE || (f >= T.CLOSE1[0] && f < T.CLOSE1[1] - 8)) return null;
  const at = T.L_START[LEVELS[i].id] - 8;
  const s = spring({ frame: f - at, fps: T.FPS, config: { damping: 11, stiffness: 300, mass: 0.5 } });
  const label = LEVELS[i].label;
  const w = label.length * 19 + 56;
  const col = i === 0 ? "#3D8BFF" : i === 1 ? "#F5D547" : "#F0443A";
  return (
    <g transform={`translate(${CARD2.cx},${CHIP_Y}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(1, s * 2)}>
      <rect x={-w / 2} y={-28} width={w} height={56} rx={28} fill={STROOP.card} stroke={col} strokeWidth={4} />
      <text y={10} textAnchor="middle" fontFamily={FONTS.mono} fontWeight={700} fontSize={28} letterSpacing={3} fill={STROOP.text}>
        {label}
      </text>
    </g>
  );
};
const ALL_STARTS = T.STARTS.flat();
const DOTS_Y = 945;
const BAR_Y = 908;
const DOTS_CX = 600;
/** durante los primeros planos no se muestran los elementos de interfaz del juego */
const inClose = (f: number) => (f >= T.CLOSE1[0] && f < T.CLOSE1[1]) || (f >= T.CLOSE2[0] && f < T.CLOSE2[1]);
const Progress: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.L_START[1] - 4 || f >= T.FREEZE + 6 || inClose(f)) return null;
  const o = Math.min(1, (f - (T.L_START[1] - 4)) / 6) * (1 - Math.max(0, (f - T.FREEZE) / 6));
  const n = ALL_STARTS.length;
  const gap = 30;
  const x0 = DOTS_CX - ((n - 1) * gap) / 2 - 8;
  return (
    <g opacity={o}>
      {ALL_STARTS.map((s, i) => {
        const n1 = LEVELS[0].cards.length;
        const lv = i < n1 ? 0 : i < n1 + LEVELS[1].cards.length ? 1 : 2;
        const done = f >= s;
        const pop = done ? 1 + 0.5 * Math.exp(-(f - s) / 3) : 1;
        return <circle key={i} cx={x0 + i * gap + (lv > 0 ? 8 : 0) + (lv > 1 ? 8 : 0)} cy={DOTS_Y} r={(done ? 8 : 6) * pop} fill={done ? STROOP.text : "none"} stroke={STROOP.textDim} strokeWidth={2} />;
      })}
    </g>
  );
};

/* ── referencia documental: ficha que entra y se reduce a una etiqueta ── */
const Citation: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.CITE_IN || f >= T.EXPLAIN_OUT + 8) return null;
  const sIn = spring({ frame: f - T.CITE_IN, fps: T.FPS, config: { damping: 14, stiffness: 190, mass: 0.6 } });
  const shrink = ease.inOut(Math.min(1, Math.max(0, (f - T.CITE_TAG) / 12)));
  const out = Math.max(0, (f - T.EXPLAIN_OUT) / 8);
  const x = 510 + (1 - sIn) * 460 + shrink * 230;
  const y = 318 - shrink * 34;
  const sc = 0.8 * (1 - 0.5 * shrink);
  return (
    <g opacity={1 - out} transform={`translate(${x},${y}) rotate(${-2 + (1 - sIn) * -6}) scale(${sc})`}>
      <rect x={-330} y={-78} width={660} height={156} rx={10} fill="#000" opacity={0.35} transform="translate(6,10)" />
      <rect x={-330} y={-78} width={660} height={156} rx={10} fill="#FBF3DF" stroke="#2A2024" strokeWidth={4} />
      <rect x={-44} y={-88} width={88} height={26} fill="#F2E6B8" opacity={0.9} />
      <text x={0} y={-14} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={42} fill="#2A2024">
        John Ridley Stroop · 1935
      </text>
      <text x={0} y={38} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill="#4A3C36">
        Journal of Experimental Psychology
      </text>
    </g>
  );
};
const citationBox = (f: number): Box | null => {
  if (f < T.CITE_IN || f >= T.EXPLAIN_OUT + 8) return null;
  const shrink = ease.inOut(Math.min(1, Math.max(0, (f - T.CITE_TAG) / 12)));
  const sc = 0.8 * (1 - 0.5 * shrink);
  const x = 510 + shrink * 230;
  const y = 318 - shrink * 34;
  return { x0: x - 335 * sc, y0: y - 90 * sc, x1: x + 335 * sc, y1: y + 90 * sc, kind: "hard", name: "cita" };
};

/* ── sello naranja «STROOP» (único momento con el naranja del canal) ── */
const Stamp: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.STAMP_HIT - 4 || f >= T.END_HEAD + 4) return null;
  const s = spring({ frame: f - (T.STAMP_HIT - 4), fps: T.FPS, config: { damping: 11, stiffness: 320, mass: 0.6 } });
  const o = Math.min(1, (f - (T.STAMP_HIT - 4)) / 2) * (1 - Math.max(0, (f - T.END_HEAD) / 4));
  return (
    <g opacity={o} transform={`translate(${CARD2.cx},${CARD2.cy}) rotate(-8) scale(${1.9 - 0.9 * s})`}>
      <rect x={-330} y={-110} width={660} height={220} rx={24} fill="none" stroke={STROOP.accent} strokeWidth={14} />
      <rect x={-306} y={-86} width={612} height={172} rx={14} fill="none" stroke={STROOP.accent} strokeWidth={4} opacity={0.7} />
      <text x={0} y={52} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={150} letterSpacing={6} fill={STROOP.accent}>
        STROOP
      </text>
    </g>
  );
};

/* ── apertura: tarjeta de ejemplo (jugable desde el fotograma 0) ── */
const EX_RETURN = T.RETURN[0] + 2;
const ExampleCard: React.FC<{ f: number }> = ({ f }) => {
  const opening = f < T.EX_OUT + 4;
  const closing = f >= EX_RETURN;
  if (!opening && !closing) return null;
  // en la apertura ya está apoyada; en el cierre vuelve a aterrizar (loop)
  // el último fotograma usa la tarjeta ya asentada: idéntico al fotograma 0
  const settled = opening || f >= T.LAST - 1;
  const start = settled ? -200 : EX_RETURN;
  const dur = opening ? T.EX_OUT - start : 100000;
  return <WordCard f={f} word={EXAMPLE.word} ink={INK[EXAMPLE.ink]} start={start} dur={dur} exits={opening} geom={CARD2} />;
};
/** «DECÍ: AZUL ✔ · ROJO ✘» */
const ExampleHint: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.EX_HINT || f >= T.EX_OUT + 4) return null;
  const s = spring({ frame: f - T.EX_HINT, fps: T.FPS, config: { damping: 12, stiffness: 260, mass: 0.5 } });
  const o = Math.min(1, s * 2) * (1 - Math.max(0, (f - T.EX_OUT) / 4));
  const strike = Math.min(1, Math.max(0, (f - T.EX_HINT - 6) / 6));
  return (
    <g opacity={o} transform={`translate(${CARD2.cx + 40},${CARD2.cy + 128}) scale(${0.7 + 0.3 * s})`}>
      <text x={-30} y={12} textAnchor="end" fontFamily={FONTS.display} fontWeight={900} fontSize={40} fill={STROOP.text}>
        DECÍ: <tspan fill={INK[EXAMPLE.ink]}>{EXAMPLE.answer}</tspan> ✔
      </text>
      <text x={30} y={12} fontFamily={FONTS.display} fontWeight={900} fontSize={40} fill={STROOP.textDim}>
        {EXAMPLE.word}
      </text>
      <line x1={26} x2={26 + 116 * strike} y1={-2} y2={-2} stroke="#F0443A" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};
/** cuenta regresiva 3 · 2 · 1 en el lugar de la tarjeta */
const Countdown: React.FC<{ f: number }> = ({ f }) => {
  for (let i = 0; i < 3; i++) {
    const at = T.COUNT[i];
    if (f >= at && f < at + T.COUNT_STEP) {
      const t = f - at;
      const s = spring({ frame: t, fps: T.FPS, config: { damping: 10, stiffness: 320, mass: 0.5 } });
      const o = Math.min(1, t / 2) * (1 - Math.max(0, (t - (T.COUNT_STEP - 3)) / 3));
      return (
        <g opacity={o} transform={`translate(${CARD2.cx},${CARD2.cy}) scale(${1.35 - 0.35 * s})`}>
          <circle r={128} fill={STROOP.card} stroke={STROOP.cardEdge} strokeWidth={5} />
          <circle r={128} fill="none" stroke={STROOP.text} strokeWidth={8} strokeDasharray={`${804 * (1 - t / T.COUNT_STEP)} 804`} transform="rotate(-90)" opacity={0.8} />
          <text y={58} textAnchor="middle" fontFamily={FONTS.display} fontWeight={900} fontSize={170} fill={STROOP.text}>
            {3 - i}
          </text>
        </g>
      );
    }
  }
  return null;
};
/** barra de tiempo de la tarjeta actual (cuánto queda para responder) */
const TimerBar: React.FC<{ f: number }> = ({ f }) => {
  if (inClose(f) || f >= T.FREEZE) return null;
  for (let li = 0; li < LEVELS.length; li++) {
    for (let ci = 0; ci < LEVELS[li].cards.length; ci++) {
      const at = T.STARTS[li][ci];
      const dur = LEVELS[li].cards[ci].dur;
      if (f >= at && f < at + dur) {
        const left = 1 - (f - at) / dur;
        const w = 360;
        const col = left < 0.3 ? "#F0443A" : STROOP.text;
        return (
          <g transform={`translate(${DOTS_CX - w / 2},${BAR_Y})`}>
            <rect width={w} height={10} rx={5} fill="#23252B" />
            <rect width={w * left} height={10} rx={5} fill={col} opacity={0.9} />
          </g>
        );
      }
    }
  }
  return null;
};
/** llamada a comentar en el cierre */
const CTA: React.FC<{ f: number }> = ({ f }) => {
  const a = T.END_HEAD + 6;
  const b = T.RETURN[0];
  if (f < a || f >= b + 6) return null;
  const s = spring({ frame: f - a, fps: T.FPS, config: { damping: 12, stiffness: 220, mass: 0.6 } });
  const o = Math.min(1, s * 2) * (1 - Math.max(0, (f - b) / 6));
  return (
    <g opacity={o} transform={`translate(${HEAD_X},${CHIP_Y + 2}) scale(${0.8 + 0.2 * s})`}>
      <rect x={-300} y={-30} width={600} height={60} rx={30} fill={STROOP.card} stroke={STROOP.textDim} strokeWidth={3} />
      <text y={11} textAnchor="middle" fontFamily={FONTS.mono} fontSize={28} fill={STROOP.text}>
        💬 comentá en cuál te trabaste
      </text>
    </g>
  );
};

/* ── adelanto del cierre: la prueba otra vez, más rápido ── */
const TEASE = [...LEVELS[2].cards, ...LEVELS[1].cards];
const Teaser: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = T.TEASER;
  if (f < a || f >= b) return null;
  const k = Math.floor((f - a) / T.TEASER_STEP);
  const cd = TEASE[k % TEASE.length];
  const local = (f - a) % T.TEASER_STEP;
  const fadeOut = Math.min(1, Math.max(0, (b - f) / 6));
  return (
    <g opacity={fadeOut}>
      <WordCard f={local} word={cd.word} ink={INK[cd.ink]} start={0} dur={T.TEASER_STEP + 1} exits={false} geom={CARD2} />
    </g>
  );
};

/* ── zonas protegidas por fotograma (subtítulos y QA) ── */
export const v2Boxes = (f: number): Box[] => {
  const cp = camPoint(f);
  const out: Box[] = tomiBoxes(f, cp);
  const rect = (x0: number, y0: number, x1: number, y1: number, name: string, kind: Box["kind"] = "hard"): Box => {
    const p = cp({ x: x0, y: y0 });
    const q = cp({ x: x1, y: y1 });
    return { x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y), x1: Math.max(p.x, q.x), y1: Math.max(p.y, q.y), kind, name };
  };
  if (((f >= T.L_START[1] && f < T.SPLIT + 8) || (f >= T.TEASER[0] && f < T.TEASER[1])) && !(f >= T.CLOSE1[0] + 2 && f < T.CLOSE1[1])) out.push(rect(CARD2.cx - CARD2.w / 2, CARD2.cy - CARD2.h / 2, CARD2.cx + CARD2.w / 2, CARD2.cy + CARD2.h / 2, "tarjeta"));
  if (levelAt(f) >= 0 && f < T.FREEZE && !(f >= T.CLOSE1[0] && f < T.CLOSE1[1] - 8)) out.push({ x0: CARD2.cx - 220, y0: CHIP_Y - 32, x1: CARD2.cx + 220, y1: CHIP_Y + 32, kind: "hard", name: "nivel" });
  if (f >= T.L_START[1] - 4 && f < T.FREEZE + 6 && !inClose(f)) out.push(rect(DOTS_CX - 220, BAR_Y - 6, DOTS_CX + 220, DOTS_Y + 14, "progreso"));
  if (f < T.EX_OUT + 4 || f >= EX_RETURN) out.push(rect(CARD2.cx - CARD2.w / 2, CARD2.cy - CARD2.h / 2, CARD2.cx + CARD2.w / 2, CARD2.cy + CARD2.h / 2, "ejemplo"));
  if (f >= T.COUNT[0] && f < T.COUNT[2] + T.COUNT_STEP) out.push(rect(CARD2.cx - 175, CARD2.cy - 175, CARD2.cx + 175, CARD2.cy + 175, "cuenta"));
  if (f >= T.END_HEAD + 6 && f < T.RETURN[0] + 6) out.push({ x0: HEAD_X - 305, y0: CHIP_Y - 30, x1: HEAD_X + 305, y1: CHIP_Y + 34, kind: "hard", name: "cta" });
  if (f >= T.SPLIT && f < T.EXPLAIN_OUT + 10) {
    const rr = (x0: number, y0: number, x1: number, y1: number, name: string) => {
      const a = rs({ x: x0, y: y0 });
      const b = rs({ x: x1, y: y1 });
      return rect(a.x, a.y, b.x, b.y, name);
    };
    out.push(rr(260, 440, 680, 575, "carril A"), rr(280, 735, 740, 900, "carril B"), rr(650, 470, 880, 740, "respuesta"));
  }
  const cb = citationBox(f);
  if (cb) out.push(cb);
  if (f >= T.STAMP_HIT - 4 && f < T.END_HEAD + 4) out.push(rect(170, 590, 850, 810, "sello"));
  for (const h of HEADS) {
    const b = headBox(h, f);
    if (b) out.push(b);
  }
  return out;
};

/* ── escenario ── */
const Table: React.FC = () => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={STROOP.bg} />
    {Array.from({ length: 24 }, (_, i) => (
      <path key={i} d={`M -300 ${-100 + i * 92} C 300 ${-120 + i * 92}, 700 ${-70 + i * 92}, 1400 ${-110 + i * 92}`} stroke="#16171B" strokeWidth={3} fill="none" opacity={0.7} />
    ))}
    <ellipse cx={CARD2.cx} cy={CARD2.cy + 80} rx={760} ry={820} fill="url(#gdSpot)" />
    {/* segundo foco, más chico, sobre Tomi: capa de profundidad */}
    <ellipse cx={230} cy={1150} rx={360} ry={420} fill="url(#gdSpot2)" />
  </g>
);
const TableLip: React.FC = () => (
  <g>
    <rect x={-400} y={1450} width={W + 800} height={900} fill="url(#gdLip)" />
    <rect x={-400} y={1446} width={W + 800} height={6} fill="#3A322B" />
  </g>
);

export const GiroDatoV2Visual: React.FC<{ f: number; showSafeZones?: boolean }> = ({ f, showSafeZones = false }) => {
  const c = camAt(f);
  const { pose, rig } = getTomiV2()[Math.min(T.LAST, Math.max(0, f))];
  const camTf = `translate(${540 + c.dx},${960 + c.dy}) scale(${c.z}) translate(${-c.cx},${-c.cy})`;
  const grainSeed = f === T.LAST ? 0 : f % 8;
  return (
    <AbsoluteFill style={{ backgroundColor: STROOP.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="gdSpot">
            <stop offset="0" stopColor={STROOP.spot} stopOpacity={0.14} />
            <stop offset="0.6" stopColor={STROOP.spot} stopOpacity={0.045} />
            <stop offset="1" stopColor={STROOP.spot} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="gdSpot2">
            <stop offset="0" stopColor="#7FE0D2" stopOpacity={0.07} />
            <stop offset="1" stopColor="#7FE0D2" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="gdLip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={STROOP.tableLip} />
            <stop offset="1" stopColor="#0B0A09" />
          </linearGradient>
          <linearGradient id="stroopPaper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.05} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.12} />
          </linearGradient>
          <radialGradient id="gdVignette" cx="0.5" cy="0.45" r="0.78">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <filter id="stroopSoft" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
          <filter id="gdGrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={grainSeed} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" />
          </filter>
        </defs>

        <g transform={camTf}>
          <Table />
          {LEVELS.map((lv, li) =>
            lv.cards.map((cd, ci) => {
              const last = li === 2 && ci === lv.cards.length - 1;
              return (
                <WordCard
                  key={`${li}-${ci}`}
                  f={f}
                  word={cd.word}
                  ink={INK[cd.ink]}
                  start={T.STARTS[li][ci]}
                  dur={last ? T.SPLIT - T.STARTS[li][ci] : cd.dur}
                  exits={!last}
                  geom={CARD2}
                />
              );
            }),
          )}
          <ExampleCard f={f} />
          <Countdown f={f} />
          <TimerBar f={f} />
          <Progress f={f} />
          <g transform={raceTf}>
          <RaceExplainer
            f={f}
            word={LAST_CARD.word}
            ink={INK[LAST_CARD.ink]}
            geom={RACE}
            times={{ split: T.SPLIT, read: T.READ, auto: T.AUTO, name: T.NAME, clash: T.CLASH, winner: T.WINNER, out: T.EXPLAIN_OUT }}
          />
          </g>
          <Stamp f={f} />
          <Teaser f={f} />
          <ExampleHint f={f} />
          <CharacterV2 pose={pose} rig={rig} uid="gdTomi" />
          <TableLip />
        </g>

        <LevelChip f={f} />
        <CTA f={f} />
        <Citation f={f} />
        <Headline f={f} />
        <CaptionsLayer f={f} frames={T.DURATION} boxesAt={v2Boxes} words={V2_WORDS} opts={CAPTION_OPTS} italic={["automatico", "stroop"]} visible={(fr) => fr >= T.VOICE_AT.v1} />

        <rect x={0} y={0} width={W} height={H} fill="url(#gdVignette)" />
        <rect x={0} y={0} width={W} height={H} filter="url(#gdGrain)" opacity={0.55} />

        {showSafeZones ? (
          <g>
            <rect x={TEXT_SAFE.left} y={TEXT_SAFE.top} width={940 - TEXT_SAFE.left} height={TEXT_SAFE.bottom - TEXT_SAFE.top} fill="none" stroke="#00FF9C" strokeWidth={3} strokeDasharray="14 10" />
            <rect x={0} y={1536} width={W} height={H - 1536} fill="#FF0040" opacity={0.12} />
            {v2Boxes(f).map((b, i) => (
              <rect key={i} x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="none" stroke={b.kind === "hard" ? "#FF2D55" : "#FFB020"} strokeWidth={b.kind === "hard" ? 4 : 2} />
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ── audio: voz + efectos (sin música) ── */
const VOICE_GAIN = 1.35;
type Cue = { src: string; at: number; vol: number; dur?: number };
const CUES: Cue[] = [
  // tics: uno por tarjeta (nivel 1 suave; niveles 2 y 3 cada vez más agudos)
  ...T.STARTS[0].map((at) => ({ src: "stroop/sfx/tic-r1.wav", at, vol: 0.28 })),
  ...[...T.STARTS[1], ...T.STARTS[2]].map((at, k) => ({ src: `stroop/sfx/tic-v2-${k + 1}.wav`, at, vol: 0.5 })),
  // cuenta regresiva
  ...T.COUNT.map((at, i) => ({ src: "stroop/sfx/tic-r1.wav", at, vol: i === 2 ? 0.45 : 0.35 })),
  // pops de nivel
  { src: SONIDOS["price-pop"], at: T.L_START[1] - 8, vol: 0.3 },
  { src: SONIDOS["price-pop"], at: T.L_START[2] - 8, vol: 0.35 },
  { src: SONIDOS["price-pop"], at: T.L_START[3] - 8, vol: 0.4 },
  // cortes de plano
  { src: SONIDOS["whoosh-corto"], at: T.CLOSE1[0] - 3, vol: 0.18 },
  { src: SONIDOS["whoosh-corto"], at: T.CLOSE1[1] - 3, vol: 0.18 },
  { src: SONIDOS["whoosh-corto"], at: T.CLOSE2[1] - 3, vol: 0.2 },
  // tensión antes del nivel 3, confusión al equivocarse
  { src: SONIDOS.riser, at: T.RISER_AT, vol: 0.22 },
  { src: SONIDOS.sorpresa, at: T.MISTAKE + 10, vol: 0.3 },
  // congelado, revelación, choque, sello
  { src: SONIDOS.thud, at: T.FREEZE, vol: 0.85 },
  { src: SONIDOS.revelacion, at: T.SPLIT, vol: 0.45 },
  { src: SONIDOS["air-clack"], at: T.CLASH, vol: 0.3 },
  { src: SONIDOS.shimmer, at: T.WINNER, vol: 0.3 },
  { src: SONIDOS.impact, at: T.STAMP_HIT, vol: 0.7 },
  // adelanto: tic por tarjeta
  ...Array.from({ length: Math.floor((T.TEASER[1] - T.TEASER[0]) / T.TEASER_STEP) }, (_, k) => ({ src: `stroop/sfx/tic-v2-${9 - (k % 3)}.wav`, at: T.TEASER[0] + k * T.TEASER_STEP, vol: 0.22, dur: 6 })),
  // cierre que conecta con el principio
  { src: SONIDOS["whoosh-suave"], at: T.RETURN[0] - 6, vol: 0.22 },
];

export const GiroDatoStroopV2: React.FC<GiroDatoStroopV2Props> = ({ showSafeZones, hasVoiceover }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GiroDatoV2Visual f={f} showSafeZones={showSafeZones} />
      <Audio src={staticFile(SONIDOS["sala-cafe"])} volume={0.05} durationInFrames={T.DURATION} />
      {hasVoiceover
        ? (Object.keys(T.VOICE_AT) as T.VoiceId[]).map((id) => (
            <Sequence key={id} from={T.VOICE_AT[id]} layout="none" name={`voz ${id}`}>
              <Audio src={staticFile(voiceSrc(id))} volume={VOICE_GAIN} />
            </Sequence>
          ))
        : null}
      {CUES.map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={c.dur ?? 75} layout="none" name={c.src.split("/").pop()}>
          <Audio src={staticFile(c.src)} volume={c.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
