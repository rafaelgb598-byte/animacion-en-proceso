// Contenedor de un episodio de Despiece: fondo de plano técnico, escena (SVG 1080 × 1920), subtítulos compartidos y audio.
// capa (para el QA de subtítulos): «todo» · «subtitulos» (fondo transparente) · «escena» (sin subtítulos ni audio) · «fondo».
import React, { useEffect, useState } from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Subtitulos } from "../../../canal/subtitulos/Subtitulos";
import type { Fuente } from "../../../canal/subtitulos/estilo";
import type { Palabra } from "../../../canal/subtitulos/tipos";
import { CARRIL, LIENZO, ZONA } from "../../../canal/zonaSegura";
import { MEZCLA } from "../marca/sfx";
import { ALPHA, COLOR, FONT, FONTS_READY, GRID } from "../marca/theme";

export const capaSchema = z.enum(["todo", "subtitulos", "escena", "fondo"]);
export type Capa = z.infer<typeof capaSchema>;

/** props comunes a toda composición de Despiece */
export const episodioSchema = z.object({
  showSafeZones: z.boolean().default(false),
  capa: capaSchema.default("todo"),
});

export type CueSfx = { id: string; f: number; archivo: string; volumen?: number; dur?: number };
export type CueVoz = { id: string; f: number; audio: string | null };

export const FUENTE_SUBS_DESPIECE: Fuente = { familia: FONT.grotesk, listo: FONTS_READY };

export type DespieceEpisodeProps = {
  capa: Capa;
  showSafeZones: boolean;
  /** palabras del video (s absolutos) */
  palabras: Palabra[];
  subtitulos: { enfasis: string[]; remates: string[]; visible: (f: number) => boolean };
  sfx: CueSfx[];
  voz: CueVoz[];
  ambiente: string | null;
  /** hoja de contactos: escena + subtítulos, sin audio */
  conSubtitulos?: boolean;
  /** ducking: factor (0..1) para efectos y ambiente en cada frame del video (1 = sin bajar) */
  duck?: (f: number) => number;
  /** la escena: elementos SVG en coordenadas del lienzo */
  children: React.ReactNode;
};

/** cuadrícula de plano técnico (fija: el movimiento lo pone la escena) */
export const Cuadricula: React.FC = () => (
  <g>
    {Array.from({ length: LIENZO.w / GRID.minor + 1 }, (_, i) => (
      <line key={`v${i}`} x1={i * GRID.minor} y1={0} x2={i * GRID.minor} y2={LIENZO.h} stroke={(i * GRID.minor) % GRID.major === 0 ? ALPHA.gridMajor : ALPHA.gridMinor} strokeWidth={2} />
    ))}
    {Array.from({ length: LIENZO.h / GRID.minor + 1 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={i * GRID.minor} x2={LIENZO.w} y2={i * GRID.minor} stroke={(i * GRID.minor) % GRID.major === 0 ? ALPHA.gridMajor : ALPHA.gridMinor} strokeWidth={2} />
    ))}
  </g>
);

/** guías de zona segura (de src/canal/zonaSegura.ts) y carril de subtítulos */
export const GuiasZonaSegura: React.FC = () => (
  <g pointerEvents="none">
    <rect x={ZONA.left} y={ZONA.top} width={ZONA.right - ZONA.left} height={ZONA.bottom - ZONA.top} fill="none" stroke="#39FF88" strokeWidth={3} strokeDasharray="14 10" />
    <rect x={180} y={CARRIL.bottom - 200} width={720} height={200} fill="rgba(57,255,136,0.08)" stroke="#39FF88" strokeWidth={2} />
    <line x1={540} y1={0} x2={540} y2={LIENZO.h} stroke="#39FF88" strokeWidth={1} opacity={0.5} />
  </g>
);

const useFuentesListas = () => {
  const [handle] = useState(() => delayRender("fuentes del canal Despiece"));
  useEffect(() => {
    FONTS_READY().then(() => continueRender(handle));
  }, [handle]);
};

export const DespieceEpisode: React.FC<DespieceEpisodeProps> = ({ capa, showSafeZones, palabras, subtitulos, sfx, voz, ambiente, conSubtitulos = false, duck, children }) => {
  const k = duck ?? (() => 1);
  useFuentesListas();
  const f = useCurrentFrame();
  const escena = capa === "todo" || capa === "escena";
  const subs = capa === "todo" || capa === "subtitulos" || conSubtitulos;
  return (
    <AbsoluteFill style={{ backgroundColor: capa === "subtitulos" ? undefined : COLOR.bg }}>
      {capa !== "subtitulos" ? (
        <svg width={LIENZO.w} height={LIENZO.h} viewBox={`0 0 ${LIENZO.w} ${LIENZO.h}`} style={{ position: "absolute", inset: 0 }}>
          <Cuadricula />
          {escena ? children : null}
          {showSafeZones ? <GuiasZonaSegura /> : null}
        </svg>
      ) : null}
      {subs ? (
        <svg width={LIENZO.w} height={LIENZO.h} style={{ position: "absolute", inset: 0 }}>
          <Subtitulos
            f={f}
            palabras={palabras}
            enfasis={subtitulos.enfasis}
            remates={subtitulos.remates}
            visible={subtitulos.visible}
            fuente={FUENTE_SUBS_DESPIECE}
            debug={showSafeZones}
          />
        </svg>
      ) : null}
      {capa === "todo" ? (
        <>
          {ambiente ? <Audio src={staticFile(ambiente)} volume={(fr) => MEZCLA.ambiente * k(fr)} /> : null}
          {sfx.map((c) => (
            <Sequence key={c.id} from={c.f} durationInFrames={c.dur ?? 45} layout="none" name={`sfx ${c.id}`}>
              <Audio src={staticFile(c.archivo)} volume={(fr) => (c.volumen ?? 1) * MEZCLA.sfx * k(c.f + fr)} />
            </Sequence>
          ))}
          {voz.map((b) =>
            b.audio ? (
              <Sequence key={b.id} from={b.f} layout="none" name={`voz ${b.id}`}>
                <Audio src={staticFile(b.audio)} volume={MEZCLA.voz} />
              </Sequence>
            ) : null,
          )}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
