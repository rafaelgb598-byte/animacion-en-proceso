// Episodio 01 · «Te mandé un código por error»: la plantilla AnatomiaEstafa + los datos del episodio.
// EstafaCodigoES / EstafaCodigoEN son la misma composición con la prop `lang`.
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Freeze } from "remotion";
import { z } from "zod";
import { AnatomiaEstafa } from "../../marca/AnatomiaEstafa";
import { SPONSOR_APAGADO, sponsorSchema } from "../../marca/SponsorSlot";
import { COLOR, TYPE } from "../../marca/theme";
import { crearEpisodio } from "./escena";
import { DURACION_BASE, FPS, SPONSOR_EXTRA } from "./timeline";

export const estafaCodigoSchema = z.object({
  lang: z.enum(["es", "en"]),
  showSafeZones: z.boolean().default(false),
  capa: z.enum(["todo", "subtitulos", "escena", "fondo"]).default("todo"),
  sponsor: sponsorSchema.default(SPONSOR_APAGADO),
});
export type EstafaCodigoProps = z.infer<typeof estafaCodigoSchema>;
export const ESTAFA_CODIGO_FPS = FPS;
export const ESTAFA_CODIGO_FRAMES = DURACION_BASE;

/** la duración sigue al patrocinio (y, con la voz real, al timeline ajustado) */
export const estafaCodigoMetadata: CalculateMetadataFunction<EstafaCodigoProps> = ({ props }) => ({
  durationInFrames: DURACION_BASE + (props.sponsor?.activo ? SPONSOR_EXTRA : 0),
});

export const EstafaCodigo: React.FC<EstafaCodigoProps> = ({ lang, showSafeZones, capa, sponsor }) => {
  const ep = React.useMemo(() => crearEpisodio(lang, sponsor ?? SPONSOR_APAGADO), [lang, sponsor]);
  return <AnatomiaEstafa ep={ep} capa={capa ?? "todo"} showSafeZones={showSafeZones ?? false} />;
};

// ── hoja de contactos (Still) ──
export const HOJA_FRAMES = [0, 45, 90, 150, 200, 250, 320, 420, 510, 570, 680, 820, 950, 1060, 1150, 1199] as const;
const COLS = 4;
const ESC = 0.25;
const TW = 1080 * ESC;
const TH = 1920 * ESC;
const LABEL = 44;
export const hojaSchema = z.object({ lang: z.enum(["es", "en"]) });
export const HOJA_W = COLS * TW;
export const HOJA_H = Math.ceil(HOJA_FRAMES.length / COLS) * (TH + LABEL);

export const EstafaCodigoHojaContactos: React.FC<z.infer<typeof hojaSchema>> = ({ lang }) => {
  const ep = React.useMemo(() => crearEpisodio(lang, SPONSOR_APAGADO), [lang]);
  return (
    <AbsoluteFill style={{ background: COLOR.black }}>
      {HOJA_FRAMES.map((fr, i) => (
        <div key={fr} style={{ position: "absolute", left: (i % COLS) * TW, top: Math.floor(i / COLS) * (TH + LABEL), width: TW, height: TH + LABEL, overflow: "hidden" }}>
          <div style={{ height: LABEL, ...TYPE.monoBold, fontSize: 26, color: COLOR.text, padding: "6px 10px" }}>f{fr}</div>
          <div style={{ width: 1080, height: 1920, transform: `scale(${ESC})`, transformOrigin: "0 0", position: "relative", overflow: "hidden" }}>
            <Freeze frame={fr}>
              <AnatomiaEstafa ep={ep} capa="escena" showSafeZones={false} conSubtitulos />
            </Freeze>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
