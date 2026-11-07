// Geometría compartida del motor: puntos, polilíneas y su largo (para trazos que se dibujan solos).
import { z } from "zod";

export const punto = z.object({ x: z.number(), y: z.number() });
export type Punto = z.infer<typeof punto>;

export const largo = (pts: Punto[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

/** punto a una fracción t (0..1) del recorrido de la polilínea */
export const puntoEn = (pts: Punto[], t: number): Punto => {
  const total = largo(pts);
  let resto = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (resto <= l || i === pts.length - 1) {
      const k = l === 0 ? 0 : Math.min(1, resto / l);
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    resto -= l;
  }
  return pts[pts.length - 1];
};

export const polilinea = (pts: Punto[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
