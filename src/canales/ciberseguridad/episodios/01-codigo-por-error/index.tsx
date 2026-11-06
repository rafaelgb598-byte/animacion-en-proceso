// Episodio 01 · «Te mandé un código por error»: la plantilla AnatomiaEstafa + los datos del episodio.
// EstafaCodigoES / EstafaCodigoEN son la misma composición con la prop `lang`.
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Freeze } from "remotion";
import { z } from "zod";
import { AnatomiaEstafa } from "../../marca/AnatomiaEstafa";
import { SPONSOR_APAGADO, sponsorSchema } from "../../marca/SponsorSlot";
import { COLOR, TYPE } from "../../marca/theme";
import { crearEpisodio, timelineDe } from "./escena";
import { FPS } from "./timeline";

export const estafaCodigoSchema = z.object({
  lang: z.enum(["es", "en"]),
  showSafeZones: z.boolean().default(false),
  capa: z.enum(["todo", "subtitulos", "escena", "fondo"]).default("todo"),
  sponsor: sponsorSchema.default(SPONSOR_APAGADO),
});
export type EstafaCodigoProps = z.infer<typeof estafaCodigoSchema>;
export const ESTAFA_CODIGO_FPS = FPS;
/** duración por defecto (ES sin patrocinio); la real la da calculateMetadata según idioma y patrocinio */
export const ESTAFA_CODIGO_FRAMES = timelineDe("es", false).DURACION;

/** la duración sigue al patrocinio (y, con la voz real, al timeline ajustado) */
export const estafaCodigoMetadata: CalculateMetadataFunction<EstafaCodigoProps> = ({ props }) => ({
  durationInFrames: timelineDe(props.lang, Boolean(props.sponsor?.activo)).DURACION,
});

export const EstafaCodigo: React.FC<EstafaCodigoProps> = ({ lang, showSafeZones, capa, sponsor }) => {
  const ep = React.useMemo(() => crearEpisodio(lang, sponsor ?? SPONSOR_APAGADO), [lang, sponsor]);
  return <AnatomiaEstafa ep={ep} capa={capa ?? "todo"} showSafeZones={showSafeZones ?? false} />;
};

// ── hoja de contactos (Still) ──
/** 16 momentos clave, sacados del timeline de cada idioma (la duración sigue a la voz) */
export const hojaFrames = (lang: "es" | "en") => {
  const T = timelineDe(lang, false);
  return [0, 45, T.GANCHO_SALE - 20, T.TOQUES.COPIAR + 10, T.PERDIDA + 30, T.REBOBINADO + 20, T.MARCADOR_1 + 40, T.MARCADOR_2 + 40, T.MARCADOR_3 + 20, T.MARCADOR_4 + 20, T.GRUPO_MENSAJE + 30, T.TOGGLE + 20, T.FICHA + 40, T.CIERRE + 40, T.VUELTA + 40, T.ULTIMO];
};
const N_HOJA = 16;
/** la composición de la hoja tiene que durar al menos lo que el idioma más largo (Freeze no pasa del final) */
export const HOJA_DURACION = Math.max(timelineDe("es", false).DURACION, timelineDe("en", false).DURACION);
const COLS = 4;
const ESC = 0.25;
const TW = 1080 * ESC;
const TH = 1920 * ESC;
const LABEL = 44;
export const hojaSchema = z.object({ lang: z.enum(["es", "en"]) });
export const HOJA_W = COLS * TW;
export const HOJA_H = Math.ceil(N_HOJA / COLS) * (TH + LABEL);

export const EstafaCodigoHojaContactos: React.FC<z.infer<typeof hojaSchema>> = ({ lang }) => {
  const ep = React.useMemo(() => crearEpisodio(lang, SPONSOR_APAGADO), [lang]);
  return (
    <AbsoluteFill style={{ background: COLOR.black }}>
      {hojaFrames(lang).map((fr, i) => (
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
