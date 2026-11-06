// Electricidad (frame, no año): el velador y la pantalla se apagan con el corte de luz en f90
// y vuelven en el corte de loop (f1155), para que el último frame sea igual al primero.
import { CLAMP } from "./anim";
import { interpolate } from "remotion";
import { CUE, LOOP_CUT } from "../timeline";

/** Velador: dos caídas de 40 % (f88, f90) y fundido de 6 frames. */
export const lampOn = (frame: number): number => {
  if (frame >= LOOP_CUT) return 1;
  const [d1, d2] = CUE.lampDips;
  const dip = frame === d1 || frame === d2 ? 0.6 : 1;
  const fade = interpolate(frame, [CUE.lampOff, CUE.lampOff + CUE.lampFade], [1, 0], CLAMP);
  return Math.min(dip, fade);
};

export const screenOn = (frame: number): number => {
  if (frame >= LOOP_CUT) return 1;
  return interpolate(frame, [CUE.screenOff, CUE.screenOff + CUE.screenFade], [1, 0], CLAMP);
};

/** Vibración del celular (CUE.buzz): ±CUE.buzzAmp px durante CUE.buzzLen frames. */
export const buzzOffset = (frame: number): number => {
  if (frame < CUE.buzz || frame >= CUE.buzz + CUE.buzzLen) return 0;
  return (frame - CUE.buzz) % 2 === 0 ? CUE.buzzAmp : -CUE.buzzAmp;
};

/** Destello especular sobre el ganador (f990, 24 frames): 0..1 o null. */
export const glintT = (frame: number): number | null => {
  if (frame < CUE.glint || frame >= CUE.glint + CUE.glintLen) return null;
  return (frame - CUE.glint) / CUE.glintLen;
};

/** Fantasma de la foto sobre el vidrio (f1100, 20 frames, 12 %). */
export const ghostOpacity = (frame: number): number =>
  interpolate(frame, [CUE.photoNo, CUE.photoNo + 5, CUE.photoNo + CUE.ghostLen - 6, CUE.photoNo + CUE.ghostLen], [0, 0.12, 0.12, 0], CLAMP);
