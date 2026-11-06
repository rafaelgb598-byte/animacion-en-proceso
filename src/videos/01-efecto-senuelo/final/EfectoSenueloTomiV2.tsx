import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { clamp, ease, smooth } from "../../../canal/personaje/anim";
import { snap } from "../../../canal/personaje/tomi-v2/motion2";
import { BoardScene } from "../short-final/BoardScene";
import { CUE, DURATION, SFX } from "../short-final/timing";
import { CafeSceneV2 } from "./CafeSceneV2";
import { PRIMER_PLANO_CAFE, PrimerPlano } from "../../../canal/escenarios/PrimerPlano";
import { Subtitulos } from "../../../canal/subtitulos/Subtitulos";
import { ZONA } from "../../../canal/zonaSegura";
import { WORDS } from "../short-final/words";
import { frameBoxes, LOOP_TITLE_IN, montage, TITLE_OUT } from "./layout";

/**
 * SHORT V2 — Efecto señuelo con Tomi V2 (1080×1920 · 30 fps · 46,4 s).
 * Misma narración, efectos, guion, montaje y duración que el Short final. Cambian: personaje,
 * actuación, cámara, énfasis, gancho («¿Cuál comprarías?») y subtítulos (carril fijo abajo).
 */

export const TOMI_V2_FRAMES = DURATION;
/** el presentador del pizarrón queda donde estaba (aprobado): el mostrador en primer plano ya tapa su cuerpo en el carril */
export const PRESENTADOR_DX = 0;
/** capa: "todo" (video) · "subtitulos" (solo subtítulos, fondo transparente) · "escena" (todo menos subtítulos)
 *  · "fondo" (solo el escenario: con "escena" el QA saca la máscara de Tomi, objetos y textos) */
export const CAPAS = ["todo", "subtitulos", "escena", "fondo"] as const;
/** primerPlano: mostrador en primer plano de la cafetería (deja el carril de subtítulos sobre madera) */
export const tomiV2Schema = z.object({ debug: z.boolean(), capa: z.enum(CAPAS).default("todo"), primerPlano: z.boolean().default(true) });
export type TomiV2Props = { debug: boolean; capa?: (typeof CAPAS)[number]; primerPlano?: boolean };

/** subtítulos: palabras clave en amarillo (máx. 1 por página) y palabras que pueden ir solas */
export const SUBS_SENUELO = {
  palabras: WORDS,
  enfasis: ["señuelo", "cincuenta centavos", "grande", "mediano", "tapá"],
  remates: [] as string[],
};

const W = 1080;
const H = 1920;
const LINE = "#2A2024";
const FONT = "'Segoe UI Black', 'Arial Black', 'Segoe UI', sans-serif";

/** gancho y loop: «¿Cuál comprarías?» */
const HookTitle: React.FC<{ f: number }> = ({ f }) => {
  let sc = 1;
  let o = 1;
  let y = 294;
  let jolt = 0;
  if (f < 300) {
    const enter = snap(0, 0.01, 4.5, 1.6 * Math.PI)(clamp(f / 9, 0, 1));
    const leave = ease.in(clamp((f - TITLE_OUT) / 8, 0, 1));
    if (leave >= 1) return null;
    sc = (1.1 - 0.1 * enter) * (1 - 0.25 * leave);
    o = 1 - leave;
    y = 294 - leave * 160;
    if (f >= CUE.rapido && f < CUE.rapido + 10) jolt = Math.sin((f - CUE.rapido) * 2.6) * 4 * (1 - (f - CUE.rapido) / 10);
  } else {
    const a = smooth((f - LOOP_TITLE_IN) / 8);
    if (a <= 0) return null;
    o = a;
    sc = 0.94 + 0.06 * snap(0, 0.01, 4.5, 1.6 * Math.PI)(a);
    y = 294 - (1 - a) * 160;
  }
  return (
    <g opacity={o} transform={`translate(${540 + jolt},${y}) scale(${sc}) rotate(${-2 + jolt * 0.4})`}>
      <rect x={-470} y={-86} width={940} height={144} rx={26} fill="#FFFFFF" stroke={LINE} strokeWidth={9} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} letterSpacing={-2}>
        <tspan fill={LINE}>¿CUÁL </tspan>
        <tspan fill="#2BB3A3">COMPRARÍAS</tspan>
        <tspan fill={LINE}>?</tspan>
      </text>
    </g>
  );
};


const DebugBoxes: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={ZONA.left} y={ZONA.top} width={ZONA.right - ZONA.left} height={ZONA.bottom - ZONA.top} fill="none" stroke="#00FF9C" strokeWidth={3} strokeDasharray="14 10" />
    <rect x={0} y={ZONA.bottom} width={W} height={H - ZONA.bottom} fill="#FF0040" opacity={0.12} />
    <rect x={ZONA.right} y={0} width={W - ZONA.right} height={ZONA.bottom} fill="#FF0040" opacity={0.08} />
    {frameBoxes(f).map((b, i) => (
      <rect key={i} x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="none" stroke={b.kind === "hard" ? "#FF2D55" : "#FFB020"} strokeWidth={b.kind === "hard" ? 4 : 2} />
    ))}
  </g>
);

/** parte visual (también la usan las herramientas de QA con un fotograma fijo) */
export const TomiV2Visual: React.FC<{ f: number; debug?: boolean; inst?: string; capa?: TomiV2Props["capa"]; primerPlano?: boolean }> = ({
  f,
  debug = false,
  inst = "",
  capa = "todo",
  primerPlano = true,
}) => {
  const m = montage(f);
  const escena = capa !== "subtitulos";
  const fondo = capa === "fondo";
  const subs = capa === "todo" || capa === "subtitulos";
  return (
    <AbsoluteFill style={{ backgroundColor: escena ? "#F2DDBA" : undefined }}>
      {escena && m.showCafe ? (
        <AbsoluteFill style={{ transform: `translateY(${m.cafeY}px)` }}>
          <CafeSceneV2 f={m.cafeF} inst={inst} soloFondo={fondo} primerPlano={false} />
        </AbsoluteFill>
      ) : null}
      {escena && m.showBoard ? (
        <AbsoluteFill style={{ transform: `translateY(${m.boardY}px)` }}>
          <BoardScene f={f} inst={`v2${inst}`} v2 soloFondo={fondo} presentadorDx={PRESENTADOR_DX} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* mostrador en primer plano, FIJO en pantalla para todo el video (café y pizarrón, también durante los
              deslizamientos): el carril de subtítulos queda siempre sobre madera. Es escenario: también va en la capa «fondo». */}
          {escena && primerPlano ? <PrimerPlano estilo={PRIMER_PLANO_CAFE} uid={`v2${inst}`} /> : null}
          {escena && !fondo ? <HookTitle f={f} /> : null}
          {subs ? <Subtitulos f={f} {...SUBS_SENUELO} debug={debug} /> : null}
          {debug ? <DebugBoxes f={f} /> : null}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EfectoSenueloTomiV2: React.FC<TomiV2Props> = ({ debug, capa = "todo", primerPlano = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TomiV2Visual f={f} debug={debug} capa={capa} primerPlano={primerPlano} />
      <Audio src={staticFile("videos/01-efecto-senuelo/voz/narracion-isaac.mp3")} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.dur ?? 60} layout="none" name={`sfx ${s.name}`}>
          <Audio src={staticFile(`videos/01-efecto-senuelo/sfx/${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
