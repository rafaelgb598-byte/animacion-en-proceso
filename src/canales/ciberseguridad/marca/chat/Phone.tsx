// Teléfono físico 2.5D (§ 5.5): canto de 12 px (capa detrás, en z = 0), bisel, reflejo especular que se
// desplaza con la cámara, sombra de contacto y brillo de pantalla sobre la mesa. Solo CSS 3D.
import React from "react";
import { ALPHA, COLOR, PHONE } from "../theme";

export type PhoneProps = {
  w: number;
  h: number;
  /** 0..1: posición del reflejo diagonal (sigue a la cámara) */
  glare?: number;
  /** pantalla fría y sin rostro (el teléfono del ladrón) */
  frio?: boolean;
  /** 0..1 brillo de pantalla sobre la mesa */
  glow?: number;
  /** 0..1 pantalla apagada a gris */
  apagado?: number;
  children?: React.ReactNode;
  /** contenido de pantalla por ENCIMA del apagado (avisos del sistema, sellos) */
  encima?: React.ReactNode;
};

export const Phone: React.FC<PhoneProps> = ({ w, h, glare = 0.5, frio = false, glow = 1, apagado = 0, children, encima }) => {
  const r = PHONE.radius * (w / 540);
  const bezel = PHONE.bezel * (w / 540);
  const edge = PHONE.edge * (w / 540);
  const gx = -60 + glare * 120;
  return (
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d" }}>
      {/* brillo de la pantalla sobre la mesa */}
      <div
        style={{
          position: "absolute",
          left: -w * 0.35,
          top: -h * 0.2,
          width: w * 1.7,
          height: h * 1.4,
          background: `radial-gradient(ellipse at 50% 50%, ${ALPHA.screenGlow} 0%, rgba(0,0,0,0) 60%)`,
          opacity: glow * (1 - apagado * 0.8),
        }}
      />
      {/* canto (cuerpo, detrás) + sombra */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          background: COLOR.black,
          boxShadow: PHONE.shadow,
        }}
      />
      {/* frente del cuerpo, levantado por el canto */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          transform: `translateZ(${edge}px)`,
          background: COLOR.phoneBody,
          boxShadow: `inset 0 0 0 2px ${ALPHA.bevelLight}, inset 0 -6px 10px ${ALPHA.bevelDark}, 0 ${edge}px 0 0 ${COLOR.black}`,
          overflow: "hidden",
        }}
      >
        {/* pantalla */}
        <div
          style={{
            position: "absolute",
            left: bezel,
            top: bezel,
            right: bezel,
            bottom: bezel,
            borderRadius: r - bezel,
            background: COLOR.screen,
            overflow: "hidden",
          }}
        >
          {children}
          {/* pantalla que se apaga a gris */}
          <div style={{ position: "absolute", inset: 0, background: COLOR.screen, opacity: apagado * 0.55, mixBlendMode: "saturation" }} />
          <div style={{ position: "absolute", inset: 0, background: ALPHA.dim, opacity: apagado * 0.6 }} />
          {frio ? <div style={{ position: "absolute", inset: 0, background: ALPHA.screenGlow }} /> : null}
          {encima}
        </div>
        {/* reflejo especular diagonal al 10 % */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, rgba(0,0,0,0) ${30 + gx * 0.3}%, ${ALPHA.specular} ${42 + gx * 0.3}%, rgba(0,0,0,0) ${56 + gx * 0.3}%)`,
          }}
        />
      </div>
    </div>
  );
};
