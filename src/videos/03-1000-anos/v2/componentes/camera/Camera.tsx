import React from "react";
import { AbsoluteFill } from "remotion";
import { CAM_EASE, lerp, TAU } from "../../lib/anim";
import { LAYOUT } from "../../theme";
import { CAMERA_KEYS as K, LOOP_CUT } from "../../timeline";

export const cameraAt = (frame: number, zoomTarget: { x: number; y: number }, zoomScreen: { x: number; y: number }) => {
  const f = frame >= LOOP_CUT ? 0 : frame;
  const seg = (k: { frames: readonly number[]; values: readonly number[] }) => {
    // curva por tramos, cada tramo con su propio easing
    for (let i = 0; i < k.frames.length - 1; i++) {
      if (f <= k.frames[i + 1]) return lerp(f, [k.frames[i], k.frames[i + 1]], [k.values[i], k.values[i + 1]], CAM_EASE);
    }
    return k.values[k.values.length - 1];
  };
  const z = lerp(f, K.zoom.frames, [0, 1], CAM_EASE);
  return {
    scale: seg(K.scale),
    rotX: seg(K.rotX),
    zoom: z,
    origin: {
      x: LAYOUT.cameraOrigin.x + (zoomTarget.x - LAYOUT.cameraOrigin.x) * z,
      y: LAYOUT.cameraOrigin.y + (zoomTarget.y - LAYOUT.cameraOrigin.y) * z,
    },
    driftX: K.driftX * Math.sin((TAU * frame) / K.driftPeriodX) + (zoomScreen.x - zoomTarget.x) * z,
    driftY: K.driftY * Math.sin((TAU * frame) / K.driftPeriodY) + (zoomScreen.y - zoomTarget.y) * z,
  };
};

const Plane: React.FC<{ z: number; extra?: number; children: React.ReactNode }> = ({ z, extra = 1, children }) => {
  const k = ((LAYOUT.perspective - z) / LAYOUT.perspective) * extra;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${LAYOUT.cameraOrigin.x}px ${LAYOUT.cameraOrigin.y}px`,
        transform: `translateZ(${z}px) scale(${k})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Cámara: perspectiva 1800 px con origen (540, 1020); cielo y pared en planos profundos (paralaje). */
export const Camera: React.FC<{
  frame: number;
  zoomTarget: { x: number; y: number };
  zoomScreen: { x: number; y: number };
  sky: React.ReactNode;
  wall: React.ReactNode;
  children: React.ReactNode;
}> = ({ frame, zoomTarget, zoomScreen, sky, wall, children }) => {
  const c = cameraAt(frame, zoomTarget, zoomScreen);
  return (
    <AbsoluteFill style={{ perspective: LAYOUT.perspective, perspectiveOrigin: `${LAYOUT.cameraOrigin.x}px ${LAYOUT.cameraOrigin.y}px` }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: `${c.origin.x}px ${c.origin.y}px`,
          transform: `translate(${c.driftX}px, ${c.driftY}px) scale(${c.scale}) rotateX(${c.rotX}deg)`,
        }}
      >
        <Plane z={LAYOUT.skyDepth} extra={1.15}>
          {sky}
        </Plane>
        <Plane z={LAYOUT.wallDepth} extra={1.06}>
          {wall}
        </Plane>
        <AbsoluteFill>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
