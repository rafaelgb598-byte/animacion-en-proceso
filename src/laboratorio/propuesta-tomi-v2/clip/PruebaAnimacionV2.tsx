import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, ease, smooth } from "../../../canal/personaje/anim";
import { CharacterV2 } from "../../../canal/personaje/tomi-v2/CharacterV2";
import { snap } from "../../../canal/personaje/tomi-v2/motion2";
import { Cup } from "../../../canal/escenarios/cafeteria/Props";
import { BackWallV2, COUNTER_TOP, CounterV2, FLOOR, FloorV2, GradeV2, Lamps, Outside, PAL_CHAIN, Sunbeams } from "../../../canal/escenarios/cafeteria/CafeV2";
import { Sparkle, Tag } from "../../../videos/01-efecto-senuelo/short-final/CafeScene";
import { CUE, SFX } from "../../../videos/01-efecto-senuelo/short-final/timing";
import { captionRect, captionX, captionY, getCaptions, SAFE, slotX } from "./captions";
import {
  camAt,
  camBlur,
  CLIP_FRAMES,
  cupHookSquash,
  CUP_H,
  cupLx,
  cupSx,
  getClip,
  M_X,
  mDropY,
  mSquash,
  mTagScale,
  mVisible,
  protectedBoxes,
  tagPulse,
  TITLE_OUT,
  toScreen,
  type Cam,
} from "./timeline";

/**
 * PRUEBA V2 — los primeros 10 s del Short con Tomi V2, actuación nueva, cámara con
 * punch-ins / barridos / temblores, efectos de énfasis y subtítulos con reposicionamiento.
 * Narración, efectos de sonido y escenografía: los mismos del Short final.
 */

export type PruebaProps = { debug: boolean };
const W = 1080;
const H = 1920;
const LINE = "#2A2024";
const FONT = "'Segoe UI Black', 'Arial Black', 'Segoe UI', sans-serif";
const BADGE = PAL_CHAIN.band;
const NARRATION_SEC = CLIP_FRAMES / 30;

const camTf = (c: Cam & { sx: number; sy: number }, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2 + c.sx * depth},${H / 2 + c.sy * depth}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

/* ------------------------------ efectos ------------------------------ */

/** líneas de velocidad radiales (pantalla), breves y con propósito */
const SpeedLines: React.FC<{ x: number; y: number; t: number; r0?: number; n?: number; color?: string }> = ({ x, y, t, r0 = 190, n = 14, color = "#FFFFFF" }) => {
  if (t <= 0 || t >= 1) return null;
  const o = Math.sin(Math.PI * t);
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.13;
        const ra = r0 + t * 90 + (i % 3) * 18;
        const rb = ra + 60 + (i % 2) * 40;
        return (
          <line key={i} x1={x + Math.cos(a) * ra} y1={y + Math.sin(a) * ra} x2={x + Math.cos(a) * rb} y2={y + Math.sin(a) * rb} stroke={color} strokeWidth={7 - (i % 3) * 1.5} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

/** puff de polvo al apoyar el vaso (mundo) */
const Dust: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g opacity={1 - t}>
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <circle key={`${s}${i}`} cx={x + s * (70 + t * 90 + i * 26)} cy={y - 8 - i * 6 - t * 18} r={(12 - i * 3) * (0.6 + t)} fill="#F4E6CF" opacity={0.85} />
        )),
      )}
    </g>
  );
};

/** título del gancho: entra "estampado", tiembla en "¡Rápido!" y sale hacia arriba */
const HookTitle: React.FC<{ f: number }> = ({ f }) => {
  const enter = snap(0, 0.01, 4.5, 1.6 * Math.PI)(clamp(f / 9, 0, 1));
  const leave = ease.in(clamp((f - TITLE_OUT) / 8, 0, 1));
  if (leave >= 1) return null;
  const sc = (1.1 - 0.1 * enter) * (1 - 0.25 * leave);
  const jolt = f >= CUE.rapido && f < CUE.rapido + 10 ? Math.sin((f - CUE.rapido) * 2.6) * 4 * (1 - (f - CUE.rapido) / 10) : 0;
  return (
    <g opacity={1 - leave} transform={`translate(${540 + jolt},${294 - leave * 160}) scale(${sc}) rotate(${-2 + jolt * 0.4})`}>
      <rect x={-470} y={-86} width={940} height={144} rx={26} fill="#FFFFFF" stroke={LINE} strokeWidth={9} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} letterSpacing={-2}>
        <tspan fill={LINE}>¿CUÁL </tspan>
        <tspan fill="#2BB3A3">COMPRARÍAS</tspan>
        <tspan fill={LINE}>?</tspan>
      </text>
    </g>
  );
};

/* ------------------------------ subtítulos ------------------------------ */

const Captions: React.FC<{ f: number; debug: boolean }> = ({ f, debug }) => {
  const caps = getCaptions(NARRATION_SEC, CLIP_FRAMES);
  const page = caps.find((p) => f >= p.f0 && f < p.f1);
  if (!page) return null;
  const t = f / 30;
  let current = null as (typeof page.words)[number] | null;
  for (const w of page.words) if (t >= w.s - 0.04 && t < w.e + 0.25) current = w;
  // aparición de página o salto a otro lugar: pop corto
  const lastSwitch = Math.max(page.f0, ...page.switches.filter((x) => x <= f));
  const inT = lastSwitch === 0 ? 1 : clamp((f - lastSwitch) / 6, 0, 1);
  const sc = 0.86 + 0.14 * snap(0, 0.01, 4.5, 1.6 * Math.PI)(inT);
  const LH = page.size * 1.22;
  const cy = captionY(page, f);
  const baseY = cy - ((page.lines.length - 1) * LH) / 2 + page.size * 0.36;
  const cx = slotX(page, captionX(page, f));
  const r = captionRect(page, cy, captionX(page, f));
  return (
    <g opacity={clamp(inT * 2, 0, 1)} transform={`translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})`}>
      {debug ? <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="none" stroke="#00E0FF" strokeWidth={4} strokeDasharray="10 8" /> : null}
      {page.lines.map((line, li) => (
        <text key={li} x={cx} y={baseY + li * LH} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={page.size} letterSpacing={-1}>
          {line.map((w, wi) => {
            const active = w === current;
            return (
              <tspan
                key={wi}
                fill={active ? "#FFD84A" : "#FFFFFF"}
                stroke={LINE}
                strokeWidth={14}
                paintOrder="stroke"
                strokeLinejoin="round"
                dy={active ? -4 : 0}
                dx={wi === 0 ? 0 : 18}
                style={{ fontSize: active ? page.size * 1.06 : page.size }}
              >
                {w.t.toUpperCase()}
              </tspan>
            );
          })}
        </text>
      ))}
    </g>
  );
};

const DebugBoxes: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={SAFE.left} y={SAFE.top} width={SAFE.right - SAFE.left} height={SAFE.bottom - SAFE.top} fill="none" stroke="#00FF9C" strokeWidth={3} strokeDasharray="14 10" />
    <rect x={0} y={SAFE.bottom} width={W} height={H - SAFE.bottom} fill="#FF0040" opacity={0.12} />
    <rect x={SAFE.right} y={0} width={W - SAFE.right} height={SAFE.bottom} fill="#FF0040" opacity={0.08} />
    {protectedBoxes(f).map((b, i) => (
      <rect key={i} x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="none" stroke={b.kind === "hard" ? "#FF2D55" : "#FFB020"} strokeWidth={b.kind === "hard" ? 4 : 2} />
    ))}
  </g>
);

/* ------------------------------ escena ------------------------------ */

export const PruebaVisual: React.FC<{ f: number; debug?: boolean }> = ({ f, debug = false }) => {
  const fr = clamp(f, 0, CLIP_FRAMES - 1);
  const { pose, rig, head } = getClip()[fr];
  const cam = camAt(fr);
  // el dibujo siempre nítido: solo el fondo recibe un desenfoque leve (profundidad + movimiento)
  const mb = camBlur(fr) * 0.22;
  const dof = clamp((cam.zoom - 1.5) * 0.6, 0, 0.8);
  const bgSoft = dof + mb;
  const lx = cupLx(fr);
  const sx = cupSx(fr);
  const mv = mVisible(fr);
  const mY = mDropY(fr);
  const land = CUE.mediano + 2;

  const hiS = smooth((fr - CUE.tres) / 6) * (1 - smooth((fr - CUE.tres - 50) / 10));
  const hiL = smooth((fr - CUE.siete) / 6);
  const hiM = smooth((fr - CUE.seis) / 6);
  const headS = toScreen(cam, head);
  const mScreen = toScreen(cam, { x: M_X, y: COUNTER_TOP - 70 });
  const id = (n: string) => `pv2${n}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2DDBA" }}>
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <filter id={id("far")} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={0.8 + bgSoft} />
            </filter>
            <filter id={id("wall")} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation={bgSoft} />
            </filter>
            <filter id={id("soft")} x="-50%" y="-200%" width="200%" height="500%">
              <feGaussianBlur stdDeviation={4} />
            </filter>
            <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={16} />
            </filter>
            <clipPath id={id("above")}>
              <rect x={0} y={-2000} width={4000} height={2000 + COUNTER_TOP + 1} />
            </clipPath>
          </defs>

          <g transform={camTf(cam, 0.55)} filter={`url(#${id("far")})`}>
            <Outside f={fr} />
          </g>
          <g transform={camTf(cam, 0.85)} filter={bgSoft > 0.15 ? `url(#${id("wall")})` : undefined}>
            <BackWallV2 f={fr} pal={PAL_CHAIN} />
            <rect x={-800} y={-600} width={4000} height={2400} fill="#F7EBD8" opacity={0.12} />
          </g>
          <g transform={camTf(cam, 0.92)} filter={bgSoft > 0.15 ? `url(#${id("wall")})` : undefined}>
            <Lamps f={fr} pal={PAL_CHAIN} />
          </g>

          <g transform={camTf(cam)}>
            <FloorV2 />
            <CounterV2 f={fr} pal={PAL_CHAIN} />

            <ellipse cx={sx + 6} cy={COUNTER_TOP + 3} rx={CUP_H.S * 0.3} ry={8} fill="#3A1E10" opacity={0.3} filter={`url(#${id("soft")})`} />
            <ellipse cx={lx + 6} cy={COUNTER_TOP + 3} rx={CUP_H.L * 0.3} ry={8} fill="#3A1E10" opacity={0.3} filter={`url(#${id("soft")})`} />
            {mv ? (
              <ellipse cx={M_X + 6} cy={COUNTER_TOP + 3} rx={CUP_H.M * 0.3 * clamp(1 + mY / 700, 0, 1)} ry={8} fill="#3A1E10" opacity={0.3 * clamp(1 + mY / 700, 0, 1)} filter={`url(#${id("soft")})`} />
            ) : null}
            {hiL > 0 && fr < CUE.siete + 40 ? (
              <ellipse cx={lx} cy={COUNTER_TOP - 90} rx={120} ry={150} fill="#FFE27A" opacity={0.35 * hiL * (1 - smooth((fr - CUE.siete - 24) / 14))} filter={`url(#${id("glow")})`} />
            ) : null}

            <g transform={`translate(${sx},${COUNTER_TOP})`}>
              <Cup h={CUP_H.S} letter="S" steam={fr + 30} badge={BADGE} sy={cupHookSquash(fr, 0)} sx={1 / Math.sqrt(cupHookSquash(fr, 0))} />
            </g>
            <g transform={`translate(${lx},${COUNTER_TOP})`}>
              <Cup h={CUP_H.L} letter="L" steam={fr} badge={BADGE} sy={cupHookSquash(fr, 3)} sx={1 / Math.sqrt(cupHookSquash(fr, 3))} />
            </g>
            {mv ? (
              <g clipPath={`url(#${id("above")})`}>
                {/* estela de caída */}
                {fr < land ? (
                  <g opacity={0.8}>
                    {[-40, 0, 40].map((dx, i) => (
                      <line key={i} x1={M_X + dx} x2={M_X + dx} y1={COUNTER_TOP + mY - CUP_H.M - 40 - i * 20} y2={COUNTER_TOP + mY - CUP_H.M - 180 - i * 30} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
                    ))}
                  </g>
                ) : null}
                <g transform={`translate(${M_X},${COUNTER_TOP + mY})`}>
                  <Cup h={CUP_H.M} letter="M" sy={mSquash(fr)} sx={1 / Math.sqrt(mSquash(fr))} sleeve="#9E6E4A" badge={BADGE} steam={fr > 262 ? fr + 12 : undefined} />
                </g>
              </g>
            ) : null}
            <Dust x={M_X} y={COUNTER_TOP} t={(fr - land) / 14} />

            {/* precios: pulso de escala al nombrarlos */}
            <g transform={`translate(${lx},${COUNTER_TOP + 22}) scale(${tagPulse.L(fr)})`}>
              <Tag size="GRANDE" price="US$7" highlight={hiL} />
            </g>
            <g transform={`translate(${sx},${COUNTER_TOP + 22}) scale(${tagPulse.S(fr)})`}>
              <Tag size="CHICO" price="US$3" highlight={hiS} />
            </g>
            {mv && mTagScale(fr) > 0.01 ? (
              <g transform={`translate(${M_X},${COUNTER_TOP + 22}) rotate(${(1 - mTagScale(fr)) * -8})`}>
                <Tag size="MEDIANO" price="US$6,50" scale={mTagScale(fr) * tagPulse.M(fr)} highlight={hiM} />
              </g>
            ) : null}
            {/* destellos breves sobre el precio que se nombra */}
            <Sparkle x={sx + 82} y={COUNTER_TOP + 38} s={Math.sin(Math.PI * clamp((fr - CUE.tres) / 14, 0, 1)) * 0.9} />
            <Sparkle x={lx + 82} y={COUNTER_TOP + 38} s={Math.sin(Math.PI * clamp((fr - CUE.siete) / 14, 0, 1)) * 0.9} />
            <Sparkle x={M_X + 90} y={COUNTER_TOP + 36} s={Math.sin(Math.PI * clamp((fr - CUE.seis - 4) / 14, 0, 1))} />
            <Sparkle x={M_X - 86} y={COUNTER_TOP + 120} s={Math.sin(Math.PI * clamp((fr - CUE.seis - 7) / 12, 0, 1)) * 0.6} />

            <g opacity={0.6}>
              <Sunbeams f={fr} />
            </g>
            <ellipse cx={pose.x + 10} cy={FLOOR + 8} rx={95 * (1 - pose.hop / 120)} ry={18} fill="#2A1408" opacity={0.2} />
            <CharacterV2 pose={pose} rig={rig} uid="pv2t" />
          </g>
          <GradeV2 w={W} h={H} />

          {/* énfasis en pantalla */}
          <SpeedLines x={headS.x} y={headS.y + 60} t={fr / 9} r0={220} />
          <SpeedLines x={headS.x} y={headS.y} t={(fr - CUE.rapido - 1) / 9} r0={170 * cam.zoom * 0.7} />
          <SpeedLines x={mScreen.x} y={mScreen.y - 40} t={(fr - land) / 9} r0={170} n={10} color="#FFF4D6" />
          {fr >= land && fr < land + 3 ? <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" opacity={0.22 * (1 - (fr - land) / 3)} /> : null}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <HookTitle f={fr} />
          <Captions f={fr} debug={debug} />
          {debug ? <DebugBoxes f={fr} /> : null}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PruebaAnimacionV2: React.FC<PruebaProps> = ({ debug }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PruebaVisual f={f} debug={debug} />
      <Audio src={staticFile("videos/01-efecto-senuelo/voz/narracion-isaac.mp3")} />
      {SFX.filter((s) => s.at < CLIP_FRAMES).map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.dur ?? 60} layout="none" name={`sfx ${s.name}`}>
          <Audio src={staticFile(`videos/01-efecto-senuelo/sfx/${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

