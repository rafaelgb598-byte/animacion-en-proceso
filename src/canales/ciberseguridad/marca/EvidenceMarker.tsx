// Marcador amarillo numerado (firma visual del canal): tent de plástico triangular en CSS 3D, apoyado en la mesa.
// Vive dentro del plano de la mesa (preserve-3d) y se contra-rota para quedar de pie frente a la cámara.
import React from "react";
import { ALPHA, COLOR, MARKER, TYPE } from "./theme";

/** inclinación de la cara del tent hacia atrás (grados) */
export const MARKER_LEAN = 22;

export type EvidenceMarkerProps = {
  n: number;
  /** base del marcador en coordenadas de la mesa */
  x: number;
  y: number;
  /** 0..~1.1 resorte de caída (puede pasarse de 1: rebote) */
  t: number;
  opacidad?: number;
};

export const EvidenceMarker: React.FC<EvidenceMarkerProps> = ({ n, x, y, t, opacidad = 1 }) => {
  if (t <= 0 || opacidad <= 0) return null;
  const { w, h } = MARKER;
  const caida = (1 - Math.min(t, 1.2)) * 160;
  const aplaste = t > 1 ? 1 - (t - 1) * 0.6 : 1;
  return (
    <>
      {/* sombra de contacto sobre la mesa */}
      <div
        style={{
          position: "absolute",
          left: x - w * 0.62,
          top: y - 26,
          width: w * 1.24,
          height: 52,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 50%, ${ALPHA.shadow} 0%, rgba(0,0,0,0) 70%)`,
          opacity: Math.min(1, t) * opacidad,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - w / 2,
          top: y - h,
          width: w,
          height: h,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
          // de pie sobre la mesa (−90° respecto del plano) con la cara inclinada hacia atrás como un tent real:
          // con la mesa a 52° queda casi frente a la cámara; con la cámara cenital se ve de canto (pequeño)
          transform: `rotateX(${-90 + MARKER_LEAN}deg) translateY(${-caida}px) scaleY(${aplaste})`,
          opacity: opacidad,
        }}
      >
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* cara lateral (canto más oscuro) */}
          <path d={`M${w * 0.62} 6 L${w - 2} ${h} L${w * 0.86} ${h} Z`} fill={COLOR.evidenceEdge} />
          {/* cara frontal */}
          <path d={`M${w * 0.38} 6 Q${w * 0.5} 0 ${w * 0.62} 6 L${w * 0.86} ${h} L2 ${h} Z`} fill={COLOR.evidence} />
          {/* cresta */}
          <path d={`M${w * 0.38} 6 Q${w * 0.5} 0 ${w * 0.62} 6`} fill="none" stroke={COLOR.evidenceEdge} strokeWidth={4} strokeLinecap="round" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: w * 0.88,
            bottom: 10,
            textAlign: "center",
            ...TYPE.monoBold,
            fontSize: MARKER.numberSize,
            lineHeight: 1,
            color: COLOR.ink,
          }}
        >
          {n}
        </div>
      </div>
    </>
  );
};
