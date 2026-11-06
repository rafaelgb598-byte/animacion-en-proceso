import React from "react";
import { AbsoluteFill } from "remotion";
import { TAU } from "../../lib/anim";
import { worldFraming } from "../../shots";
import { LAYOUT } from "../../theme";

const Plane: React.FC<{ z: number; extra?: number; children: React.ReactNode }> = ({ z, extra = 1, children }) => {
  const k = ((LAYOUT.perspective - z) / LAYOUT.perspective) * extra;
  return (
    <AbsoluteFill style={{ transformOrigin: `${LAYOUT.cameraOrigin.x}px ${LAYOUT.cameraOrigin.y}px`, transform: `translateZ(${z}px) scale(${k})` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Cámara por planos: centra (cx, cy) en el ancla de pantalla con zoom y giros; paralaje en cielo y pared. */
export const CameraV3: React.FC<{ frame: number; sky: React.ReactNode; wall: React.ReactNode; children: React.ReactNode }> = ({ frame, sky, wall, children }) => {
  const c = worldFraming(frame);
  const a = LAYOUT.screenAnchor;
  const dx = 2 * Math.sin((TAU * frame) / 150);
  const dy = 1.5 * Math.sin((TAU * frame) / 240);
  return (
    <AbsoluteFill style={{ perspective: LAYOUT.perspective, perspectiveOrigin: `${a.x}px ${a.y}px`, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: `${c.cx}px ${c.cy}px`,
          transform: `translate(${a.x - c.cx + dx}px, ${a.y - c.cy + dy}px) scale(${c.zoom}) rotateX(${c.rotX}deg) rotateY(${c.rotY}deg)`,
        }}
      >
        <Plane z={LAYOUT.skyDepth} extra={1.25}>
          {sky}
        </Plane>
        <Plane z={LAYOUT.wallDepth} extra={1.1}>
          {wall}
        </Plane>
        <AbsoluteFill>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
