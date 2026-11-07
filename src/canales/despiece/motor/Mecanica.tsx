// Piezas mecánicas paramétricas: Spring (resorte), Pin (perno / contraperno) y Gear (engranaje).
import React from "react";
import { z } from "zod";
import { ALPHA, COLOR, STROKE } from "../marca/theme";

// ── resorte ──
export const springSchema = z.object({
  x: z.number(),
  /** extremo fijo (arriba) y extremo móvil (abajo): la compresión sale de la distancia entre ellos */
  yTop: z.number(),
  yBottom: z.number(),
  ancho: z.number().default(36),
  espiras: z.number().int().min(2).default(7),
  color: z.string().default(COLOR.paper),
  grosor: z.number().default(STROKE.leader),
});
export type SpringProps = z.input<typeof springSchema>;

export const Spring: React.FC<SpringProps> = (raw) => {
  const p = springSchema.parse(raw);
  const n = p.espiras * 2;
  const h = p.yBottom - p.yTop;
  const pts: string[] = [`M${p.x} ${p.yTop}`];
  const margen = Math.min(8, h * 0.08);
  pts.push(`L${p.x} ${p.yTop + margen}`);
  for (let i = 1; i < n; i++) {
    const y = p.yTop + margen + ((h - 2 * margen) * i) / n;
    pts.push(`L${p.x + (i % 2 ? 1 : -1) * (p.ancho / 2)} ${y}`);
  }
  pts.push(`L${p.x} ${p.yBottom - margen}`, `L${p.x} ${p.yBottom}`);
  return <path d={pts.join(" ")} fill="none" stroke={p.color} strokeWidth={p.grosor} strokeLinejoin="round" strokeLinecap="round" />;
};

// ── perno ──
export const pinSchema = z.object({
  x: z.number(),
  yTop: z.number(),
  yBottom: z.number(),
  ancho: z.number().default(44),
  /** «llave»: perno inferior (punta redondeada abajo) · «contra»: contraperno (rayado) */
  tipo: z.enum(["llave", "contra"]),
  relleno: z.string().default(COLOR.paper),
  trazo: z.string().default(COLOR.ink),
  /** contorno de resalte (naranja o rojo); null = sin resalte */
  resalte: z.string().nullable().default(null),
  id: z.string(),
});
export type PinProps = z.input<typeof pinSchema>;

export const Pin: React.FC<PinProps> = (raw) => {
  const p = pinSchema.parse(raw);
  const w = p.ancho;
  const x0 = p.x - w / 2;
  const h = p.yBottom - p.yTop;
  const r = Math.min(w / 2, h / 2) * 0.9;
  const d =
    p.tipo === "llave"
      ? `M${x0} ${p.yTop + 3} Q${x0} ${p.yTop} ${x0 + 3} ${p.yTop} L${x0 + w - 3} ${p.yTop} Q${x0 + w} ${p.yTop} ${x0 + w} ${p.yTop + 3} L${x0 + w} ${p.yBottom - r} Q${x0 + w} ${p.yBottom} ${p.x} ${p.yBottom} Q${x0} ${p.yBottom} ${x0} ${p.yBottom - r} Z`
      : `M${x0 + 3} ${p.yTop} L${x0 + w - 3} ${p.yTop} Q${x0 + w} ${p.yTop} ${x0 + w} ${p.yTop + 3} L${x0 + w} ${p.yBottom - 3} Q${x0 + w} ${p.yBottom} ${x0 + w - 3} ${p.yBottom} L${x0 + 3} ${p.yBottom} Q${x0} ${p.yBottom} ${x0} ${p.yBottom - 3} L${x0} ${p.yTop + 3} Q${x0} ${p.yTop} ${x0 + 3} ${p.yTop} Z`;
  return (
    <g>
      <defs>
        <clipPath id={`pin-${p.id}`}>
          <path d={d} />
        </clipPath>
      </defs>
      {p.resalte ? <path d={d} fill="none" stroke={p.resalte} strokeWidth={STROKE.piece + 8} opacity={0.45} /> : null}
      <path d={d} fill={p.relleno} />
      {p.tipo === "contra" ? (
        <g clipPath={`url(#pin-${p.id})`}>
          {Array.from({ length: Math.ceil((h + w) / 14) + 1 }, (_, i) => (
            <line key={i} x1={x0 - 4} y1={p.yTop + i * 14} x2={x0 + w + 4} y2={p.yTop + i * 14 - w - 8} stroke={ALPHA.hatch} strokeWidth={STROKE.thin} />
          ))}
        </g>
      ) : (
        <rect x={x0 + w * 0.62} y={p.yTop + 6} width={w * 0.16} height={Math.max(0, h - r - 10)} fill={ALPHA.shade} clipPath={`url(#pin-${p.id})`} />
      )}
      <path d={d} fill="none" stroke={p.resalte ?? p.trazo} strokeWidth={STROKE.piece} strokeLinejoin="round" />
    </g>
  );
};

// ── engranaje ──
export const gearSchema = z.object({
  cx: z.number(),
  cy: z.number(),
  dientes: z.number().int().min(6),
  radioExterior: z.number(),
  radioInterior: z.number(),
  /** radio del eje (agujero central) */
  radioEje: z.number().default(10),
  /** grados */
  rotacion: z.number().default(0),
  relleno: z.string().default(COLOR.paper),
  trazo: z.string().default(COLOR.ink),
});
export type GearProps = z.input<typeof gearSchema>;

export const Gear: React.FC<GearProps> = (raw) => {
  const p = gearSchema.parse(raw);
  const pts: string[] = [];
  const paso = (Math.PI * 2) / p.dientes;
  for (let i = 0; i < p.dientes; i++) {
    const a = i * paso;
    const seq: [number, number][] = [
      [a, p.radioInterior],
      [a + paso * 0.2, p.radioExterior],
      [a + paso * 0.5, p.radioExterior],
      [a + paso * 0.7, p.radioInterior],
    ];
    for (const [ang, r] of seq) pts.push(`${(p.cx + Math.cos(ang) * r).toFixed(2)} ${(p.cy + Math.sin(ang) * r).toFixed(2)}`);
  }
  return (
    <g transform={`rotate(${p.rotacion} ${p.cx} ${p.cy})`}>
      <path d={`M${pts.join(" L")} Z`} fill={p.relleno} stroke={p.trazo} strokeWidth={STROKE.piece} strokeLinejoin="round" />
      <circle cx={p.cx} cy={p.cy} r={p.radioEje} fill={COLOR.bg} stroke={p.trazo} strokeWidth={STROKE.piece} />
    </g>
  );
};
