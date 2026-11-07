// La línea de corte naranja: el elemento característico del canal. Recorre el objeto y es la que lo abre.
import React from "react";
import { z } from "zod";
import { ALPHA, COLOR, STROKE } from "../marca/theme";
import { largo, punto, polilinea, puntoEn } from "./geom";

export const cutLineSchema = z.object({
  /** trayectoria (polilínea) en coordenadas del lienzo */
  trayectoria: z.array(punto).min(2),
  /** 0..1: cuánto del recorrido está dibujado */
  progreso: z.number().min(0).max(1),
  /** «abre»: se dibuja desde el inicio hasta `progreso` · «cierra»: queda dibujado de `progreso` al final (se retrae) */
  modo: z.enum(["abre", "cierra"]).default("abre"),
  opacidad: z.number().min(0).max(1).default(1),
  /** 0..1: halo alrededor de toda la línea (destello) */
  brillo: z.number().min(0).max(1).default(0),
  /** muestra la cabeza (punto que avanza) */
  cabeza: z.boolean().default(true),
  grosor: z.number().default(STROKE.cut),
});
export type CutLineProps = z.input<typeof cutLineSchema>;

export const CutLine: React.FC<CutLineProps> = (raw) => {
  const p = cutLineSchema.parse(raw);
  const L = largo(p.trayectoria);
  const d = polilinea(p.trayectoria);
  const desde = p.modo === "abre" ? 0 : p.progreso;
  const hasta = p.modo === "abre" ? p.progreso : 1;
  if (hasta - desde <= 0.0005 || p.opacidad <= 0) return null;
  const dash = `0 ${desde * L} ${(hasta - desde) * L} ${L}`;
  const head = puntoEn(p.trayectoria, p.modo === "abre" ? hasta : desde);
  const enMovimiento = p.cabeza && hasta - desde < 0.999;
  return (
    <g opacity={p.opacidad}>
      {p.brillo > 0 ? <path d={d} fill="none" stroke={ALPHA.signalGlow} strokeWidth={p.grosor + 22 * p.brillo} strokeLinecap="round" strokeDasharray={dash} /> : null}
      <path d={d} fill="none" stroke={COLOR.signal} strokeWidth={p.grosor} strokeLinecap="round" strokeDasharray={dash} />
      {enMovimiento ? (
        <>
          <circle cx={head.x} cy={head.y} r={p.grosor * 3.2} fill={ALPHA.signalGlow} />
          <circle cx={head.x} cy={head.y} r={p.grosor * 1.3} fill={COLOR.signal} />
        </>
      ) : null}
    </g>
  );
};
