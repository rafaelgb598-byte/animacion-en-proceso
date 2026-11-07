// Episodio 01 · «¿Cómo sabe tu cerradura que es TU llave?» — une el motor, el objeto, el guion y el timeline.
// DespieceCerradura (con voz real cuando exista vozReal.json) · DespieceCerraduraSinVoz (borrador de ritmo) · hoja de contactos.
import React from "react";
import type { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { SFX } from "../../marca/sfx";
import { palabrasDelVideo } from "../../marca/voz";
import { DespieceEpisode, episodioSchema, HojaContactos, hojaTam, type CueSfx } from "../../motor";
import { Cerradura } from "./Cerradura";
import { bloques, SUBS } from "./script";
import { crearTimeline, FPS, type Timeline } from "./timeline";

export const cerraduraSchema = episodioSchema.extend({
  /** true = usa la voz real (vozReal.json); false = borrador sin voz con palabras planificadas */
  conVoz: z.boolean().default(true),
});
export type CerraduraProps = z.infer<typeof cerraduraSchema>;
export const CERRADURA_FPS = FPS;

const armar = (conVoz: boolean) => {
  const bs = bloques(conVoz);
  const T = crearTimeline(bs);
  return { bs, T };
};
export const cerraduraDuracion = (conVoz: boolean) => armar(conVoz).T.DURACION;
export const cerraduraMetadata: CalculateMetadataFunction<CerraduraProps> = ({ props }) => ({ durationInFrames: cerraduraDuracion(props.conVoz ?? true) });

/** efectos colgados de los eventos del timeline */
const sfxDe = (T: Timeline): CueSfx[] => [
  { id: "corte", f: 0, archivo: SFX.corte, volumen: 0.7, dur: 32 },
  { id: "apertura", f: T.APERTURA, archivo: SFX.apertura, volumen: 0.9 },
  { id: "llave-asoma", f: T.LLAVE_ASOMA, archivo: SFX.llave, volumen: 0.45 },
  ...Object.entries(T.ROTULOS).map(([k, f]) => ({ id: `trazo-${k}`, f, archivo: SFX.trazo, volumen: 0.6 })),
  { id: "trazo-contra", f: T.ROTULO_CONTRA, archivo: SFX.trazo, volumen: 0.6 },
  { id: "trazo-perno", f: T.ROTULO_PERNO, archivo: SFX.trazo, volumen: 0.6 },
  { id: "llave-entra", f: T.LLAVE_ENTRA, archivo: SFX.llave, volumen: 0.7 },
  ...T.LUCES.map((f, i) => ({ id: `tic-${i}`, f, archivo: SFX.tic, volumen: 0.9 })),
  { id: "destello", f: T.DESTELLO, archivo: SFX.destello, volumen: 0.6 },
  { id: "clac", f: T.GIRO_FIN - 4, archivo: SFX.clac, volumen: 1 },
  { id: "llave-sale", f: T.LLAVE_SALE, archivo: SFX.llave, volumen: 0.35 },
  { id: "mala-entra", f: T.MALA_ENTRA, archivo: SFX.llave, volumen: 0.55 },
  { id: "rebote", f: T.INTENTO, archivo: SFX.rebote, volumen: 1 },
  { id: "chip", f: T.AVISO, archivo: SFX.chip, volumen: 0.7 },
  { id: "cierre", f: T.CIERRE + 2, archivo: SFX.apertura, volumen: 0.5 },
  { id: "corte-loop", f: T.CIERRE + 10, archivo: SFX.corte, volumen: 0.4, dur: 20 },
];

export const DespieceCerradura: React.FC<CerraduraProps & { conSubtitulos?: boolean }> = ({ capa, showSafeZones, conVoz, conSubtitulos }) => {
  const { bs, T } = React.useMemo(() => armar(conVoz ?? true), [conVoz]);
  const palabras = React.useMemo(() => palabrasDelVideo(bs, T.V, FPS).filter((w) => Math.round(w.s * FPS) >= T.SUBS_DESDE), [bs, T]);
  return (
    <DespieceEpisode
      capa={capa ?? "todo"}
      showSafeZones={showSafeZones ?? false}
      palabras={palabras}
      subtitulos={{ enfasis: SUBS.enfasis, remates: SUBS.remates, visible: (f) => f >= T.SUBS_DESDE && f < T.CIERRE }}
      sfx={sfxDe(T)}
      voz={bs.map((b) => ({ id: b.id, f: T.V[b.id as keyof typeof T.V], audio: b.audio }))}
      ambiente={SFX.ambiente}
      conSubtitulos={conSubtitulos}
    >
      <Cerradura T={T} />
    </DespieceEpisode>
  );
};

// ── hoja de contactos: 0; 0,5; 1; 1,5 s y después uno cada 2 s, más el último fotograma ──
export const hojaFrames = (conVoz: boolean) => {
  const D = cerraduraDuracion(conVoz);
  const fs = [0, 15, 30, 45];
  for (let t = 2; t * FPS < D; t += 2) fs.push(t * FPS);
  fs.push(D - 1);
  return fs;
};
export const hojaCerraduraSchema = z.object({ conVoz: z.boolean().default(false) });
const N_HOJA = Math.max(hojaFrames(false).length, hojaFrames(true).length);
export const HOJA_CERRADURA = { ...hojaTam(N_HOJA), duracion: Math.max(cerraduraDuracion(false), cerraduraDuracion(true)) };

export const DespieceCerraduraHojaContactos: React.FC<z.infer<typeof hojaCerraduraSchema>> = ({ conVoz }) => (
  <HojaContactos frames={hojaFrames(conVoz)} fps={FPS} render={() => <DespieceCerradura capa="escena" showSafeZones={false} conVoz={conVoz} conSubtitulos />} />
);
