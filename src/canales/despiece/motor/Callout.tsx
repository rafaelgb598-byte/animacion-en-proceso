// Etiqueta con línea guía que se dibuja sola (punto en la pieza → codo → texto en Plex Mono).
import React from "react";
import { interpolate } from "remotion";
import { z } from "zod";
import { CLAMP, OUT } from "../marca/anim";
import { COLOR, STROKE, TYPE } from "../marca/theme";
import { largo, punto, polilinea } from "./geom";

export const calloutSchema = z.object({
  /** punto de la pieza que se señala */
  ancla: punto,
  /** codo opcional de la línea guía */
  codo: punto.optional(),
  /** donde arranca el texto (línea base) */
  rotulo: punto,
  texto: z.string(),
  alinear: z.enum(["start", "middle", "end"]).default("start"),
  /** 0..1: 0–0,6 se dibuja la línea, 0,5–1 aparece el texto */
  progreso: z.number().min(0).max(1),
  opacidad: z.number().min(0).max(1).default(1),
  color: z.string().default(COLOR.paper),
  tam: z.number().default(TYPE.label.fontSize),
  /** contorno de la línea guía (para que se lea sobre papel y sobre fondo); null = sin contorno */
  halo: z.string().nullable().default(COLOR.bg),
});
export type CalloutProps = z.input<typeof calloutSchema>;

export const Callout: React.FC<CalloutProps> = (raw) => {
  const p = calloutSchema.parse(raw);
  if (p.progreso <= 0 || p.opacidad <= 0) return null;
  // la línea termina un poco antes del texto
  const fin = { x: p.rotulo.x + (p.alinear === "start" ? -14 : p.alinear === "end" ? 14 : 0), y: p.rotulo.y - p.tam * 0.34 };
  const pts = [p.ancla, ...(p.codo ? [p.codo] : []), fin];
  const L = largo(pts);
  const linea = interpolate(p.progreso, [0, 0.6], [0, 1], { ...CLAMP, easing: OUT });
  const texto = interpolate(p.progreso, [0.5, 1], [0, 1], { ...CLAMP, easing: OUT });
  return (
    <g opacity={p.opacidad}>
      <circle cx={p.ancla.x} cy={p.ancla.y} r={7 * Math.min(1, linea * 4)} fill={p.color} stroke={COLOR.bg} strokeWidth={STROKE.thin} />
      {p.halo ? <path d={polilinea(pts)} fill="none" stroke={p.halo} strokeWidth={STROKE.leader + 6} strokeLinecap="round" strokeDasharray={`${linea * L} ${L}`} /> : null}
      <path d={polilinea(pts)} fill="none" stroke={p.color} strokeWidth={STROKE.leader} strokeLinecap="round" strokeDasharray={`${linea * L} ${L}`} />
      <text
        x={p.rotulo.x}
        y={p.rotulo.y + (1 - texto) * 10}
        textAnchor={p.alinear}
        fill={p.color}
        opacity={texto}
        style={{ fontFamily: TYPE.label.fontFamily, fontWeight: TYPE.label.fontWeight, fontSize: p.tam, letterSpacing: TYPE.label.letterSpacing, textTransform: "uppercase" }}
      >
        {p.texto.split("\n").map((renglon, i) => (
          <tspan key={i} x={p.rotulo.x} dy={i === 0 ? 0 : p.tam * 1.15}>
            {renglon}
          </tspan>
        ))}
      </text>
    </g>
  );
};
