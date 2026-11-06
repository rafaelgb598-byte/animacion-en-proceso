// Cámara del canal (§ 10): contenedor con perspective 1800px y origen en el centro del teléfono.
// Mesa = plano con rotateX(θ). Estas funciones reproducen la proyección de CSS para unir planos (líneas, dedo).
import { track } from "./anim";
import type { Episodio } from "./tipos";

export const CAM = { ox: 540, oy: 855, persp: 1800 } as const;

export type CamState = { s: number; th: number; x: number; y: number };

export const camara = (ep: Episodio, f: number): CamState => {
  const d = ep.deriva;
  return {
    s: track(f, ep.camara.escala),
    th: track(f, ep.camara.inclinacion),
    x: track(f, ep.camara.x) + d.ax * Math.sin((2 * Math.PI * f) / d.px),
    y: track(f, ep.camara.y) + d.ay * Math.sin((2 * Math.PI * f) / d.py),
  };
};

/** punto del plano de la mesa (z = 0) → coordenadas dentro del contenedor de cámara (antes de la escala) */
export const proyectarMesa = (px: number, py: number, thDeg: number, z = 0) => {
  const th = (thDeg * Math.PI) / 180;
  const dx = px - CAM.ox;
  const dy = py - CAM.oy;
  const y1 = dy * Math.cos(th) - z * Math.sin(th);
  const z1 = dy * Math.sin(th) + z * Math.cos(th);
  const k = CAM.persp / (CAM.persp - z1);
  return { x: CAM.ox + dx * k, y: CAM.oy + y1 * k, k };
};

/** coordenadas del contenedor de cámara → pantalla (translate + scale con origen en el teléfono) */
export const aPantalla = (p: { x: number; y: number }, c: CamState) => ({ x: CAM.ox + c.x + (p.x - CAM.ox) * c.s, y: CAM.oy + c.y + (p.y - CAM.oy) * c.s });
