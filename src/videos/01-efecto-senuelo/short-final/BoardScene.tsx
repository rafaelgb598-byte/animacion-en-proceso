import React from "react";
import { clamp, ease, lerp, poseTrack, smooth, track, type Key, type PoseKey } from "../../../canal/personaje/anim";
import { Character } from "../../../canal/personaje/tomi-v1/Character";
import { CharacterV2 } from "../../../canal/personaje/tomi-v2/CharacterV2";
import { arm, FACES, FACES_V2, standing } from "../../../canal/personaje/presets";
import { blink as blinkAt } from "../../../canal/personaje/anim";
import type { FacePose, HandShape, Pose } from "../../../canal/personaje/rig";
import { CHALK } from "../../../canal/escenarios/cafeteria/Cafe";
import { handAt } from "./cafe";
import { CUE, SCENE } from "./timing";

/**
 * Escena del pizarrón: la explicación se dibuja con tiza al ritmo de la narración
 * y Tomi la presenta señalando cada idea. Coordenadas = pantalla (1080×1920).
 */

const W = 1080;
const H = 1920;
const LINE = "#2A2024";
const CH = "#F4EFE3";
const YEL = "#FFE27A";

/* ------------------------------ Tomi presentador ------------------------------ */

const SC = 1.5;
const FLOOR_Y = 1760;
const TX = 185;

const LOOK: Record<string, [number, number]> = { cam: [-0.35, 0], up: [0.75, -0.75], mid: [0.85, -0.35], low: [0.85, -0.1] };
const GAZE: [number, string][] = [
  [0, "cam"], [14, "up"], [60, "cam"], [66, "up"], [124, "mid"], [190, "mid"], [230, "cam"], [262, "cam"], [270, "mid"],
  [330, "cam"], [345, "up"], [416, "mid"], [452, "low"], [470, "cam"],
];
const gazeKeys = (axis: 0 | 1): Key[] => {
  const out: Key[] = [];
  GAZE.forEach(([fr, name], i) => {
    const v = LOOK[name][axis];
    if (i > 0 && LOOK[GAZE[i - 1][1]][axis] !== v) {
      out.push([fr - 3, LOOK[GAZE[i - 1][1]][axis]]);
      out.push([fr, v]);
      return;
    }
    out.push([fr, v]);
  });
  return out;
};
const LX = gazeKeys(0);
const LY = gazeKeys(1);

const B = (f: number) => f - SCENE.boardIn; // fotograma local
const FACE_KEYS: PoseKey<FacePose>[] = [
  [0, FACES_V2.notice],
  [20, FACES.interested],
  [B(CUE.anio), { ...FACES.interested, browLiftL: 0.7, browLiftR: 0.7 }],
  [B(CUE.huber) + 10, FACES.interested],
  [B(CUE.tercera), { ...FACES_V2.aha, mouthOpen: 0.25 }],
  [B(CUE.cambiar) + 6, { ...FACES.ironic, lidL: 0.2, lidR: 0.18, smile: 0.55 }],
  [B(CUE.cafes) - 4, FACES.interested],
  [B(CUE.entradas), { ...FACES_V2.aha, mouthOpen: 0.2 }],
  [480, { ...FACES.ironic, lidL: 0.22, lidR: 0.2 }],
];
const FRONT: [number, HandShape][] = [[0, "open"], [24, "point"], [300, "point"], [330, "open"], [350, "point"], [470, "open"]];

/** objetivo del índice (pantalla) según lo que se esté explicando */
const pointAt = (b: number) => {
  const keys: [number, number, number][] = [
    [0, 560, 300],
    [B(CUE.anio), 690, 400],
    [B(CUE.huber), 720, 560],
    [B(CUE.sumar), 470, 790],
    [B(CUE.tercera), 870, 790],
    [B(CUE.cambiar), 470, 760],
    [B(CUE.cafes), 520, 400],
    [B(CUE.entradas), 640, 620],
    [B(CUE.suscripciones), 640, 880],
  ];
  let i = 0;
  while (i + 1 < keys.length && b >= keys[i + 1][0]) i++;
  const a = keys[i];
  const n = keys[Math.min(i + 1, keys.length - 1)];
  const t = n === a ? 0 : ease.inOut(clamp((b - a[0]) / 10, 0, 1));
  const prev = keys[Math.max(0, i - 1)];
  return { x: lerp(prev[1], a[1], t), y: lerp(prev[2], a[2], t) };
};

export const presenter = (b: number): Pose => {
  const base = standing(TX, FLOOR_Y, SC);
  const face = poseTrack(b, FACE_KEYS);
  face.lookX = track(b, LX);
  face.lookY = track(b, LY);
  const tgt = pointAt(b);
  const beat = Math.sin(b * 0.09);
  return {
    ...base,
    bodyTurn: 0.75,
    headTurn: 0.7 + 0.1 * Math.sin(b * 0.03),
    lean: 1.5 + beat * 0.8,
    headTilt: -4 + 3 * Math.sin(b * 0.05) + 6 * face.lookY,
    squash: 1 + 0.006 * Math.sin(b * 0.13),
    face,
    blink: blinkAt(b, [8, 70, 130, 200, 262, 330, 400, 455]),
    hairLag: 3 * Math.sin(b * 0.11),
    // señala con el brazo del fondo: sale hacia el pizarrón sin cruzar la cara (silueta clara)
    armBack: arm({
      ...handAt(b, FRONT),
      ik: { x: tgt.x, y: tgt.y, space: "scene", weight: track(b, [[0, 0.35], [18, 1, ease.out], [470, 1]]), bend: 1 },
      aim: { x: tgt.x, y: tgt.y, weight: 1 },
    }),
    armFront: arm({ shoulder: 6 + 3 * beat, elbow: 34 + 4 * beat, hand: "relaxed" }),
  };
};

/* ------------------------------ tiza ------------------------------ */

const reveal = (b: number, at: number, dur = 12) => smooth((b - B(at)) / dur);

const ChalkWrite: React.FC<{ id: string; x: number; y: number; size: number; t: number; color?: string; children: string; anchor?: "middle" | "start" }> = ({
  id,
  x,
  y,
  size,
  t,
  color = CH,
  children,
  anchor = "middle",
}) => {
  if (t <= 0) return null;
  const w = size * children.length * 0.8;
  const left = anchor === "middle" ? x - w / 2 : x;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={left - 10} y={y - size * 1.1} width={(w + 20) * clamp(t, 0, 1)} height={size * 1.5} />
        </clipPath>
      </defs>
      <text x={x} y={y} textAnchor={anchor} fontFamily={CHALK} fontWeight={700} fontSize={size} fill={color} clipPath={`url(#${id})`} opacity={0.95}>
        {children}
      </text>
    </g>
  );
};
const Chalk: React.FC<{ d: string; t: number; color?: string; w?: number; dash?: boolean }> = ({ d, t, color = CH, w = 6, dash }) =>
  t <= 0 ? null : (
    <path
      d={d}
      pathLength={1}
      strokeDasharray={dash ? "0.03 0.025" : 1}
      strokeDashoffset={dash ? 0 : 1 - clamp(t, 0, 1)}
      opacity={dash ? clamp(t, 0, 1) : 1}
      stroke={color}
      strokeWidth={w}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
const pop = (t: number) => (t <= 0 ? 0 : 0.6 + 0.4 * ease.overshoot(clamp(t, 0, 1)));

const OptionCard: React.FC<{ x: number; y: number; label: string; t: number; decoy?: boolean; star?: number; caption?: string; captionT?: number }> = ({
  x,
  y,
  label,
  t,
  decoy,
  star = 0,
  caption,
  captionT = 0,
}) =>
  t <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${pop(t)})`} opacity={clamp(t * 2, 0, 1)}>
      <rect x={-80} y={-100} width={160} height={200} rx={16} fill="none" stroke={decoy ? "#FF9C8A" : CH} strokeWidth={6} strokeDasharray={decoy ? "16 12" : undefined} />
      <text x={0} y={28} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={84} fill={decoy ? "#FF9C8A" : CH}>
        {label}
      </text>
      {star > 0 ? (
        <path transform={`translate(0,-128) scale(${pop(star)})`} d="M 0 -30 L 9 -9 L 32 -9 L 14 5 L 21 28 L 0 14 L -21 28 L -14 5 L -32 -9 L -9 -9 Z" fill={YEL} stroke={LINE} strokeWidth={3} />
      ) : null}
      {caption && captionT > 0 ? (
        <text x={0} y={156} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={34} fill="#FF9C8A" opacity={clamp(captionT * 2, 0, 1)}>
          {caption}
        </text>
      ) : null}
    </g>
  );

const Popcorn: React.FC<{ x: number; y: number; s: number; decoy?: boolean; star?: number }> = ({ x, y, s, decoy, star = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -40 -60 L -30 40 L 30 40 L 40 -60 Z" fill="none" stroke={decoy ? "#FF9C8A" : CH} strokeWidth={5} strokeDasharray={decoy ? "12 9" : undefined} strokeLinejoin="round" />
    {[-30, -10, 10, 30].map((px, i) => (
      <circle key={i} cx={px} cy={-70 - (i % 2) * 10} r={14} fill="none" stroke={decoy ? "#FF9C8A" : CH} strokeWidth={4} />
    ))}
    <path d="M -24 -50 L -18 30 M 0 -50 L 0 30 M 24 -50 L 18 30" stroke={decoy ? "#FF9C8A" : "#E24E5A"} strokeWidth={4} opacity={0.8} />
    {star > 0 ? <path transform={`translate(0,-120) scale(${pop(star) * 0.8})`} d="M 0 -30 L 9 -9 L 32 -9 L 14 5 L 21 28 L 0 14 L -21 28 L -14 5 L -32 -9 L -9 -9 Z" fill={YEL} stroke={LINE} strokeWidth={3} /> : null}
  </g>
);

const Plan: React.FC<{ x: number; y: number; name: string; decoy?: boolean; star?: number }> = ({ x, y, name, decoy, star = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-82} y={-70} width={164} height={140} rx={14} fill="none" stroke={decoy ? "#FF9C8A" : CH} strokeWidth={5} strokeDasharray={decoy ? "14 10" : undefined} />
    <text x={0} y={-22} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={30} fill={decoy ? "#FF9C8A" : CH}>
      {name}
    </text>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M -50 ${8 + i * 20} L ${30 - i * 14} ${8 + i * 20}`} stroke={decoy ? "#FF9C8A" : CH} strokeWidth={4} strokeLinecap="round" opacity={0.75} />
    ))}
    {star > 0 ? <path transform={`translate(0,-96) scale(${pop(star) * 0.7})`} d="M 0 -30 L 9 -9 L 32 -9 L 14 5 L 21 28 L 0 14 L -21 28 L -14 5 L -32 -9 L -9 -9 Z" fill={YEL} stroke={LINE} strokeWidth={3} /> : null}
  </g>
);

/* ------------------------------ escena ------------------------------ */

/** `v2`: dibuja a Tomi V2 (mismas poses y tiempos); por defecto, el Tomi original. */
export const BoardScene: React.FC<{ f: number; inst?: string; v2?: boolean }> = ({ f, inst = "", v2 = false }) => {
  const b = f - SCENE.boardIn;
  const id = (n: string) => `bd${n}${inst}`;
  const pose = presenter(b);
  const study = 1 - smooth((b - (B(CUE.cafes) - 18)) / 14); // el diagrama se borra antes de los ejemplos
  const tTitle = reveal(b, CUE.efecto - 6, 26);
  const tYear = reveal(b, CUE.anio, 10);
  const tCard = reveal(b, CUE.huber, 12);
  const tAB = reveal(b, CUE.sumar, 10);
  const tDecoy = reveal(b, CUE.tercera, 10);
  const tLess = reveal(b, CUE.menos, 10);
  const tWin = reveal(b, CUE.cambiar, 12);
  const tCafe = reveal(b, CUE.cafes - 8, 10);
  const tCine = reveal(b, CUE.entradas - 4, 12);
  const tSubs = reveal(b, CUE.suscripciones - 4, 12);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={id("bg")} cx="0.55" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#3B4A43" />
          <stop offset="1" stopColor="#25302B" />
        </radialGradient>
      </defs>
      {/* pared de la cafetería alrededor del pizarrón */}
      <rect x={0} y={0} width={W} height={H} fill="#E9D2AE" />
      <rect x={0} y={1540} width={W} height={380} fill="#A8653E" />
      {/* pizarrón */}
      <rect x={34} y={96} width={1012} height={1290} rx={22} fill="#7A4D33" stroke={LINE} strokeWidth={8} />
      <rect x={60} y={122} width={960} height={1238} rx={10} fill={`url(#${id("bg")})`} />
      {/* restos de tiza borrada (textura) */}
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M ${120 + i * 96} ${260 + (i % 3) * 330} q 40 -18 80 0`} stroke={CH} strokeWidth={10} opacity={0.05} strokeLinecap="round" />
      ))}
      <rect x={60} y={1344} width={960} height={18} fill="#5B3A29" />

      <ChalkWrite id={id("t1")} x={560} y={262} size={84} t={tTitle} color={YEL}>
        EFECTO SEÑUELO
      </ChalkWrite>
      <Chalk d="M 250 300 Q 560 322 870 298" t={tTitle * 1.2 - 0.2} color={YEL} w={6} />

      <g opacity={study}>
        <g transform={`translate(700,430) scale(${pop(tYear)})`} opacity={clamp(tYear * 2, 0, 1)}>
          <text x={0} y={0} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={130} fill={CH}>
            1982
          </text>
        </g>
        {tCard > 0 ? (
          <g transform={`translate(${lerp(1200, 705, ease.out(tCard))},565) rotate(-3)`}>
            <rect x={-300} y={-74} width={600} height={148} rx={8} fill="#FBF3DF" stroke={LINE} strokeWidth={4} />
            <rect x={-40} y={-80} width={80} height={26} fill="#F2E6B8" opacity={0.85} />
            <text x={0} y={-12} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={36} fill="#2A2024">
              Huber, Payne &amp; Puto (1982)
            </text>
            <text x={0} y={38} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={32} fill="#4A3C36">
              Journal of Consumer Research
            </text>
          </g>
        ) : null}
        <OptionCard x={470} y={810} label="A" t={tAB} star={tWin} />
        <OptionCard x={675} y={810} label="B" t={tAB} />
        <OptionCard x={880} y={810} label="A−" t={tDecoy} decoy caption="menos atractiva" captionT={tLess} />
        <Chalk d="M 875 700 Q 690 620 500 690" t={tWin} color={YEL} w={6} />
        <Chalk d="M 500 690 l 26 -6 M 500 690 l 12 22" t={tWin * 1.4 - 0.4} color={YEL} w={6} />
      </g>

      {/* no solo cafés: cine y suscripciones */}
      {tCafe > 0 ? (
        <g opacity={clamp(tCafe * 2, 0, 1)}>
          <g transform="translate(470,400) scale(0.9)">
            <path d="M -40 -40 L -32 44 L 32 44 L 40 -40 Z" fill="none" stroke={CH} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 40 -22 Q 66 -18 60 6 Q 54 26 34 22" fill="none" stroke={CH} strokeWidth={6} />
          </g>
          <ChalkWrite id={id("t2")} x={540} y={420} size={52} t={tCafe} anchor="start">
            …y también
          </ChalkWrite>
        </g>
      ) : null}
      {tCine > 0 ? (
        <g opacity={clamp(tCine * 2, 0, 1)} transform={`translate(0,${(1 - ease.out(tCine)) * 30})`}>
          <ChalkWrite id={id("t3")} x={420} y={530} size={56} t={tCine} anchor="start" color={YEL}>
            cine
          </ChalkWrite>
          <Popcorn x={500} y={680} s={0.95} />
          <Popcorn x={700} y={670} s={1.15} decoy />
          <Popcorn x={900} y={660} s={1.35} star={reveal(b, CUE.entradas + 8, 10)} />
        </g>
      ) : null}
      {tSubs > 0 ? (
        <g opacity={clamp(tSubs * 2, 0, 1)} transform={`translate(0,${(1 - ease.out(tSubs)) * 30})`}>
          <ChalkWrite id={id("t4")} x={420} y={805} size={56} t={tSubs} anchor="start" color={YEL}>
            suscripciones
          </ChalkWrite>
          <g transform="translate(705,930) scale(1.12) translate(-705,-930)">
            <Plan x={520} y={930} name="Básico" />
            <Plan x={705} y={930} name="Plus" decoy />
            <Plan x={890} y={930} name="Premium" star={reveal(b, CUE.suscripciones + 8, 10)} />
          </g>
        </g>
      ) : null}

      {/* sombra y presentador */}
      <ellipse cx={TX + 10} cy={FLOOR_Y + 6} rx={110} ry={20} fill="#2A1408" opacity={0.22} />
      {v2 ? <CharacterV2 pose={pose} uid={`bdt2${inst}`} /> : <Character pose={pose} uid={`bdt${inst}`} />}
    </svg>
  );
};
