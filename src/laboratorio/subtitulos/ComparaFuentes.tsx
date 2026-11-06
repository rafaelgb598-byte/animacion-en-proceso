import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FUENTES, type Fuente } from "../../canal/subtitulos/estilo";
import { Subtitulos } from "../../canal/subtitulos/Subtitulos";
import { SUBS_SENUELO, TomiV2Visual } from "../../videos/01-efecto-senuelo/final/EfectoSenueloTomiV2";

/** Laboratorio: el mismo fotograma del señuelo con la fuente de antes y las dos candidatas de Google Fonts. */
const PANELES: { nombre: string; fuente: Fuente }[] = [
  { nombre: "ANTES · Segoe UI Black (sistema)", fuente: FUENTES.segoe },
  { nombre: "Montserrat 900", fuente: FUENTES.montserrat },
  { nombre: "Inter Tight 900", fuente: FUENTES.interTight },
];

export const ComparaFuentes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      {PANELES.map((p, i) => (
        <div key={p.nombre} style={{ position: "absolute", left: i * 1080, top: 0, width: 1080, height: 1920, overflow: "hidden" }}>
          <TomiV2Visual f={f} capa="escena" inst={`cmp${i}`} />
          <AbsoluteFill>
            <svg width={1080} height={1920} viewBox="0 0 1080 1920">
              <Subtitulos f={f} {...SUBS_SENUELO} fuente={p.fuente} />
              <rect x={0} y={1600} width={1080} height={120} fill="#111" opacity={0.85} />
              <text x={540} y={1678} textAnchor="middle" fill="#fff" fontFamily="Arial" fontWeight={700} fontSize={48}>
                {p.nombre}
              </text>
            </svg>
          </AbsoluteFill>
        </div>
      ))}
    </AbsoluteFill>
  );
};
