// Línea de cota: líneas de referencia, línea con flechas y el valor (que sale del data.json del episodio).
import React from "react";
import { interpolate } from "remotion";
import { z } from "zod";
import { CLAMP, OUT } from "../marca/anim";
import { COLOR, STROKE, TYPE } from "../marca/theme";
import { punto } from "./geom";

export const dimensionSchema = z.object({
  /** extremos medidos (sobre la pieza) */
  desde: punto,
  hasta: punto,
  /** corrimiento perpendicular de la línea de cota (px; positivo = a la derecha / abajo) */
  corrimiento: z.number().default(30),
  valor: z.string(),
  /** dónde va el valor: al costado de la cota o en un punto fijo */
  posValor: punto.optional(),
  progreso: z.number().min(0).max(1),
  opacidad: z.number().min(0).max(1).default(1),
  color: z.string().default(COLOR.paper),
  tamValor: z.number().default(TYPE.value.fontSize),
  /** contorno de las líneas (para que se lean sobre papel y sobre fondo); null = sin contorno */
  halo: z.string().nullable().default(COLOR.bg),
});
export type DimensionProps = z.input<typeof dimensionSchema>;

export const Dimension: React.FC<DimensionProps> = (raw) => {
  const p = dimensionSchema.parse(raw);
  if (p.progreso <= 0 || p.opacidad <= 0) return null;
  const dx = p.hasta.x - p.desde.x;
  const dy = p.hasta.y - p.desde.y;
  const L = Math.hypot(dx, dy) || 1;
  // normal unitaria (a la derecha del sentido desde → hasta)
  const nx = -dy / L;
  const ny = dx / L;
  const o = p.corrimiento;
  const a = { x: p.desde.x + nx * o, y: p.desde.y + ny * o };
  const b = { x: p.hasta.x + nx * o, y: p.hasta.y + ny * o };
  const t = interpolate(p.progreso, [0, 0.7], [0, 1], { ...CLAMP, easing: OUT });
  const tv = interpolate(p.progreso, [0.55, 1], [0, 1], { ...CLAMP, easing: OUT });
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  // la cota crece desde el medio hacia los dos extremos
  const a2 = { x: m.x + (a.x - m.x) * t, y: m.y + (a.y - m.y) * t };
  const b2 = { x: m.x + (b.x - m.x) * t, y: m.y + (b.y - m.y) * t };
  const ux = dx / L;
  const uy = dy / L;
  const flecha = (q: { x: number; y: number }, s: number) => {
    const k = 14;
    const w = 7;
    return `M${q.x} ${q.y} L${q.x - s * ux * k + nx * w} ${q.y - s * uy * k + ny * w} L${q.x - s * ux * k - nx * w} ${q.y - s * uy * k - ny * w} Z`;
  };
  const pv = p.posValor ?? { x: m.x + nx * 34, y: m.y + ny * 34 + p.tamValor * 0.35 };
  return (
    <g opacity={p.opacidad}>
      <g opacity={t}>
        <line x1={p.desde.x + nx * 6} y1={p.desde.y + ny * 6} x2={a.x + nx * 10} y2={a.y + ny * 10} stroke={p.color} strokeWidth={STROKE.thin} />
        <line x1={p.hasta.x + nx * 6} y1={p.hasta.y + ny * 6} x2={b.x + nx * 10} y2={b.y + ny * 10} stroke={p.color} strokeWidth={STROKE.thin} />
      </g>
      {p.halo ? <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={p.halo} strokeWidth={STROKE.leader + 6} /> : null}
      <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={p.color} strokeWidth={STROKE.leader} />
      {t > 0.95 ? (
        <>
          <path d={flecha(a, -1)} fill={p.color} />
          <path d={flecha(b, 1)} fill={p.color} />
        </>
      ) : null}
      <text x={pv.x} y={pv.y} textAnchor="middle" fill={p.color} opacity={tv} style={{ fontFamily: TYPE.value.fontFamily, fontWeight: TYPE.value.fontWeight, fontSize: p.tamValor }}>
        {p.valor}
      </text>
    </g>
  );
};
