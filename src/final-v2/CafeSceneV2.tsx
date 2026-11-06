import React from "react";
import { clamp } from "../character/anim";
import { CharacterV2 } from "../character/v2/CharacterV2";
import { Cup } from "../scenes/decoy/Props";
import { BackWallV2, COUNTER_TOP, CounterV2, FLOOR, FloorV2, GradeV2, Lamps, Outside, PAL_CHAIN, Sunbeams } from "../scenes/decoy-v2/CafeV2";
import { ChalkPath, ChalkText, NapkinDraped, NapkinHeld, Sparkle, Tag } from "../short-final/CafeScene";
import { CUE } from "../short-final/timing";
import {
  camAt,
  camMotion,
  cupHookSquash,
  CUP_H,
  cupLx,
  cupSx,
  FX,
  getCafeV2,
  M_X,
  mDropY,
  mSquash,
  mTagScale,
  mVisible,
  N,
  napkinDraped,
  napkinHeld,
  napkinT,
  tagPulse,
  toScreen,
  type CamF,
} from "./cafe";

/**
 * Cafetería del Short V2 (escenas A y B). El dibujo siempre nítido: solo el fondo recibe un
 * desenfoque leve; la sensación de movimiento la dan líneas de velocidad y pulsos breves.
 */

const W = 1080;
const H = 1920;
const LINE = "#2A2024";
const BADGE = PAL_CHAIN.band;

const camTf = (c: CamF, depth = 1) => {
  const cx = 1100 + (c.x - 1100) * depth;
  const cy = 1100 + (c.y - 1100) * depth;
  return `translate(${W / 2 + c.sx * depth},${H / 2 + c.sy * depth}) scale(${c.zoom}) translate(${-cx},${-cy})`;
};

const SpeedLines: React.FC<{ x: number; y: number; t: number; r0?: number; n?: number; color?: string }> = ({ x, y, t, r0 = 190, n = 14, color = "#FFFFFF" }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g opacity={Math.sin(Math.PI * t)}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.13;
        const ra = r0 + t * 90 + (i % 3) * 18;
        const rb = ra + 60 + (i % 2) * 40;
        return <line key={i} x1={x + Math.cos(a) * ra} y1={y + Math.sin(a) * ra} x2={x + Math.cos(a) * rb} y2={y + Math.sin(a) * rb} stroke={color} strokeWidth={7 - (i % 3) * 1.5} strokeLinecap="round" />;
      })}
    </g>
  );
};

const Dust: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 || t >= 1 ? null : (
    <g opacity={1 - t}>
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <circle key={`${s}${i}`} cx={x + s * (70 + t * 90 + i * 26)} cy={y - 8 - i * 6 - t * 18} r={(12 - i * 3) * (0.6 + t)} fill="#F4E6CF" opacity={0.85} />
        )),
      )}
    </g>
  );

/** chasquido de dedos ("eureka"): tres trazos cortos que salen de la mano */
const Snap: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 || t >= 1 ? null : (
    <g opacity={Math.sin(Math.PI * t)} stroke={LINE} strokeWidth={5} strokeLinecap="round">
      {[-50, -10, 30].map((a, i) => {
        const r = (a * Math.PI) / 180;
        const r0 = 34 + t * 26;
        return <line key={i} x1={x + Math.sin(r) * r0} y1={y - Math.cos(r) * r0} x2={x + Math.sin(r) * (r0 + 24)} y2={y - Math.cos(r) * (r0 + 24)} />;
      })}
    </g>
  );

export const CafeSceneV2: React.FC<{ f: number; inst?: string }> = ({ f, inst = "" }) => {
  const fr = clamp(f, 0, N - 1);
  const { pose, rig, head } = getCafeV2()[fr];
  const cam = camAt(fr);
  const mb = camMotion(fr) * 0.22;
  const dof = clamp((cam.zoom - 1.5) * 0.6, 0, 0.8);
  const bgSoft = dof + mb;
  const lx = cupLx(fr);
  const sx = cupSx(fr);
  const mv = mVisible(fr);
  const mY = mDropY(fr);
  const land = CUE.mediano + 2;
  const id = (n: string) => `cv2${n}${inst}`;
  const headS = toScreen(cam, head);
  const mScreen = toScreen(cam, { x: M_X, y: COUNTER_TOP - 70 });
  const handS = toScreen(cam, { x: pose.x + rig.front.palm.x * 1.5, y: pose.y + rig.front.palm.y * 1.5 });

  const half = FX.half(fr);
  const reveal = FX.reveal(fr);
  const arcCaro = FX.arcCaro(fr);
  const arcGanga = FX.arcGanga(fr);
  const mGlow = FX.mGlow(fr);
  const lSpark = FX.lSparkle(fr);
  const mShadow = mv ? clamp(1 + mY / 700, 0, 1) * clamp(1 - mY / 40, 0, 1) : 0;

  return (
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
        {mv ? <ellipse cx={M_X + 6} cy={COUNTER_TOP + 3} rx={CUP_H.M * 0.3 * mShadow} ry={8} fill="#3A1E10" opacity={0.3 * mShadow} filter={`url(#${id("soft")})`} /> : null}

        {/* brillos: la opción del medio / el grande "parece mejor" / el US$7 que nunca cambió */}
        {mv && mGlow > 0 ? <ellipse cx={M_X} cy={COUNTER_TOP - 80} rx={110} ry={130} fill="#FFE27A" opacity={0.55 * mGlow} filter={`url(#${id("glow")})`} /> : null}
        {Math.max(reveal, lSpark, half) > 0 ? (
          <ellipse cx={lx} cy={COUNTER_TOP - 90} rx={120} ry={150} fill="#FFE27A" opacity={0.4 * Math.max(reveal, lSpark, half * 0.8)} filter={`url(#${id("glow")})`} />
        ) : null}

        <g transform={`translate(${sx},${COUNTER_TOP})`}>
          <Cup h={CUP_H.S} letter="S" steam={fr + 30} badge={BADGE} sy={cupHookSquash(fr, 0)} sx={1 / Math.sqrt(cupHookSquash(fr, 0))} />
        </g>
        <g transform={`translate(${lx},${COUNTER_TOP})`}>
          <Cup h={CUP_H.L} letter="L" steam={fr} badge={BADGE} sy={cupHookSquash(fr, 3)} sx={1 / Math.sqrt(cupHookSquash(fr, 3))} />
        </g>
        {mv ? (
          <g clipPath={`url(#${id("above")})`}>
            {fr < land ? (
              <g opacity={0.8}>
                {[-40, 0, 40].map((dx, i) => (
                  <line key={i} x1={M_X + dx} x2={M_X + dx} y1={COUNTER_TOP + mY - CUP_H.M - 40 - i * 20} y2={COUNTER_TOP + mY - CUP_H.M - 180 - i * 30} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
                ))}
              </g>
            ) : null}
            <g transform={`translate(${M_X},${COUNTER_TOP + mY})`}>
              <Cup h={CUP_H.M} letter="M" sy={mSquash(fr)} sx={1 / Math.sqrt(mSquash(fr))} sleeve="#9E6E4A" badge={BADGE} steam={fr > 262 && !napkinDraped(fr) ? fr + 12 : undefined} />
              {napkinDraped(fr) ? <NapkinDraped h={CUP_H.M} t={napkinT(fr)} /> : null}
            </g>
          </g>
        ) : null}
        <Dust x={M_X} y={COUNTER_TOP} t={(fr - land) / 14} />

        {/* precios */}
        <g transform={`translate(${lx},${COUNTER_TOP + 22}) scale(${tagPulse.L(fr)})`}>
          <Tag size="GRANDE" price="US$7" highlight={clamp(FX.hiL(fr), 0, 1)} glow={Math.max(reveal, lSpark)} />
        </g>
        <g transform={`translate(${sx},${COUNTER_TOP + 22}) scale(${tagPulse.S(fr)})`}>
          <Tag size="CHICO" price="US$3" highlight={FX.hiS(fr)} />
        </g>
        {mv && mTagScale(fr) > 0.01 ? (
          <g transform={`translate(${M_X},${COUNTER_TOP + 22}) rotate(${(1 - mTagScale(fr)) * -8})`}>
            <Tag size="MEDIANO" price="US$6,50" scale={mTagScale(fr) * tagPulse.M(fr)} highlight={FX.hiM(fr)} glow={mGlow} />
          </g>
        ) : null}
        <Sparkle x={sx + 82} y={COUNTER_TOP + 38} s={Math.sin(Math.PI * clamp((fr - CUE.tres) / 14, 0, 1)) * 0.9} />
        <Sparkle x={lx + 82} y={COUNTER_TOP + 38} s={Math.sin(Math.PI * clamp((fr - CUE.siete) / 14, 0, 1)) * 0.9} />
        <Sparkle x={M_X + 90} y={COUNTER_TOP + 36} s={Math.sin(Math.PI * clamp((fr - CUE.seis - 4) / 14, 0, 1))} />
        <Sparkle x={M_X - 86} y={COUNTER_TOP + 120} s={Math.sin(Math.PI * clamp((fr - CUE.seis - 7) / 12, 0, 1)) * 0.6} />

        {/* "+US$0,50": une el mediano con el grande */}
        {half > 0 ? (
          <g>
            <ChalkPath d={`M ${lx} 1088 Q ${lx + 20} 1030 ${(lx + M_X) / 2} 1028 Q ${M_X - 20} 1030 ${M_X} 1118`} t={half * 1.3} color="#FFE27A" w={8} />
            <ChalkText x={(lx + M_X) / 2} y={1004} t={half * 1.6 - 0.4} size={46} color="#FFE27A">
              +US$0,50
            </ChalkText>
          </g>
        ) : null}
        {/* "nunca cambió": el US$7 sigue igual */}
        {reveal > 0 ? (
          <ChalkPath
            d={`M ${lx - 104} ${COUNTER_TOP + 86} Q ${lx - 100} ${COUNTER_TOP + 10} ${lx} ${COUNTER_TOP + 14} Q ${lx + 104} ${COUNTER_TOP + 18} ${lx + 100} ${COUNTER_TOP + 92} Q ${lx + 90} ${COUNTER_TOP + 160} ${lx} ${COUNTER_TOP + 156} Q ${lx - 92} ${COUNTER_TOP + 150} ${lx - 108} ${COUNTER_TOP + 80}`}
            t={reveal}
            color="#FFE27A"
            w={7}
          />
        ) : null}
        {/* contra qué lo comparás: grande vs chico = caro · grande vs mediano = ganga */}
        {arcCaro > 0 || arcGanga > 0 ? (
          <g>
            <ChalkPath d={`M ${lx} 1090 Q ${(lx + sx) / 2} 900 ${sx} 1140`} t={arcCaro} color="#FF9C8A" w={7} />
            <ChalkText x={(lx + sx) / 2} y={922} t={arcCaro * 1.5 - 0.3} size={44} color="#FF9C8A">
              caro
            </ChalkText>
            <ChalkPath d={`M ${lx + 10} 1100 Q ${(lx + M_X) / 2} 1040 ${M_X} 1124`} t={arcGanga} color="#9FE3B0" w={7} />
            <ChalkText x={(lx + M_X) / 2 - 6} y={1052} t={arcGanga * 1.5 - 0.3} size={40} color="#9FE3B0">
              ¡ganga!
            </ChalkText>
          </g>
        ) : null}
        {lSpark > 0 ? (
          <g>
            <Sparkle x={lx - 82} y={1070} s={lSpark * (0.8 + 0.2 * Math.sin(fr * 0.5))} />
            <Sparkle x={lx + 88} y={1110} s={lSpark * 0.7 * (0.8 + 0.2 * Math.sin(fr * 0.5 + 2))} />
            <Sparkle x={lx + 40} y={1030} s={lSpark * 0.55} />
          </g>
        ) : null}

        <g opacity={0.6}>
          <Sunbeams f={fr} />
        </g>
        <ellipse cx={pose.x + 10} cy={FLOOR + 8} rx={95 * (1 - pose.hop / 120)} ry={18} fill="#2A1408" opacity={0.2} />
        <CharacterV2 pose={pose} rig={rig} uid={`cv2t${inst}`} backProp={napkinHeld(fr) ? <NapkinHeld /> : undefined} />
      </g>
      <GradeV2 w={W} h={H} />

      {/* énfasis en pantalla (breves y con propósito) */}
      <SpeedLines x={headS.x} y={headS.y} t={(fr - CUE.rapido - 1) / 9} r0={170 * cam.zoom * 0.7} />
      <SpeedLines x={mScreen.x} y={mScreen.y - 40} t={(fr - land) / 9} r0={170} n={10} color="#FFF4D6" />
      <SpeedLines x={headS.x} y={headS.y} t={(fr - CUE.son - 2) / 10} r0={190 * cam.zoom * 0.6} color="#FFE27A" />
      <Snap x={handS.x} y={handS.y - 30 * cam.zoom} t={(fr - CUE.deRepente - 2) / 8} />
      {fr >= land && fr < land + 3 ? <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" opacity={0.22 * (1 - (fr - land) / 3)} /> : null}
      {fr >= CUE.nunca - 2 && fr < CUE.nunca + 2 ? <rect x={0} y={0} width={W} height={H} fill="#FFF6D8" opacity={0.18 * (1 - (fr - CUE.nunca + 2) / 4)} /> : null}
    </svg>
  );
};

