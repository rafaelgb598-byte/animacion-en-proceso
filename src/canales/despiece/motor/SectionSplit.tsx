// Parte un objeto SVG en dos mitades por una línea horizontal; las mitades se separan y dejan ver el corte transversal.
import React, { useId } from "react";
import { z } from "zod";
import { LIENZO } from "../../../canal/zonaSegura";

export const sectionSplitSchema = z.object({
  /** altura del corte (coordenadas del lienzo) */
  corteY: z.number(),
  /** 0..1: cuánto se separaron las mitades */
  apertura: z.number().min(0).max(1),
  /** separación total a apertura 1 (px) */
  separacion: z.number().default(40),
  /** opacidad del exterior (las mitades se desvanecen para dejar el corte a la vista) */
  opacidadExterior: z.number().min(0).max(1).default(1),
  /** opacidad del interior (el corte transversal) */
  opacidadInterior: z.number().min(0).max(1).default(1),
  id: z.string().default("split"),
});
export type SectionSplitProps = z.input<typeof sectionSplitSchema> & {
  /** el objeto entero visto desde afuera */
  exterior: React.ReactNode;
  /** el corte transversal (queda debajo) */
  interior: React.ReactNode;
};

export const SectionSplit: React.FC<SectionSplitProps> = ({ exterior, interior, ...raw }) => {
  const p = sectionSplitSchema.parse(raw);
  // id único por instancia (la hoja de contactos dibuja el mismo objeto en varios fotogramas)
  const id = `${p.id}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const s = (p.apertura * p.separacion) / 2;
  const W = LIENZO.w;
  const H = LIENZO.h;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-arriba`}>
          <rect x={0} y={0} width={W} height={p.corteY} />
        </clipPath>
        <clipPath id={`${id}-abajo`}>
          <rect x={0} y={p.corteY} width={W} height={H - p.corteY} />
        </clipPath>
      </defs>
      {p.opacidadInterior > 0 ? <g opacity={p.opacidadInterior}>{interior}</g> : null}
      {p.opacidadExterior > 0 ? (
        <g opacity={p.opacidadExterior}>
          <g transform={`translate(0 ${-s})`} clipPath={`url(#${id}-arriba)`}>
            {exterior}
          </g>
          <g transform={`translate(0 ${s})`} clipPath={`url(#${id}-abajo)`}>
            {exterior}
          </g>
        </g>
      ) : null}
    </g>
  );
};
