// Íconos dibujados en SVG (nunca emojis del sistema: el render cambiaría según la máquina).
import React from "react";
import { COLOR } from "../theme";

type P = { size?: number; color?: string; style?: React.CSSProperties };

export const IconoCasa: React.FC<P> = ({ size = 32, color = COLOR.text, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: "inline-block", verticalAlign: "-0.12em", ...style }}>
    <path d="M5 15 L16 5 L27 15" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13 V27 H24 V13" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
    <rect x={13.5} y={19} width={5} height={8} fill={color} />
  </svg>
);

/** carita que se tapa los ojos (reemplaza al emoji) */
export const IconoVerguenza: React.FC<P> = ({ size = 36, color = COLOR.text, style }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: "inline-block", verticalAlign: "-0.16em", ...style }}>
    <circle cx={18} cy={19} r={14} fill="none" stroke={color} strokeWidth={2.6} />
    <path d="M7 15 Q12 11 17 15" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M19 15 Q24 11 29 15" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M13 25 Q18 28 23 25" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);

export const IconoCandado: React.FC<P & { cierre?: number }> = ({ size = 120, color = COLOR.safe, cierre = 1, style }) => {
  // cierre 0 = arco levantado, 1 = cerrado
  const lift = (1 - cierre) * 18;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={style}>
      <path d={`M28 ${54 - lift} V${36 - lift} a22 22 0 0 1 44 0 V${54 - lift - (1 - cierre) * 10}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
      <rect x={16} y={52} width={68} height={56} rx={12} fill="none" stroke={color} strokeWidth={8} />
      <circle cx={50} cy={76} r={6} fill={color} />
      <path d="M50 80 V92" stroke={color} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

export const IconoSenal: React.FC<P> = ({ size = 26, color = COLOR.text }) => (
  <svg width={size * 1.3} height={size} viewBox="0 0 34 26">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 9} y={20 - i * 6} width={6} height={6 + i * 6} rx={1.5} fill={color} />
    ))}
  </svg>
);

export const IconoBateria: React.FC<P> = ({ size = 26, color = COLOR.text }) => (
  <svg width={size * 1.7} height={size} viewBox="0 0 44 26">
    <rect x={1.5} y={4} width={36} height={18} rx={5} fill="none" stroke={color} strokeWidth={2.4} opacity={0.6} />
    <rect x={5} y={7.5} width={26} height={11} rx={2.5} fill={color} />
    <rect x={39.5} y={10} width={3} height={6} rx={1.5} fill={color} opacity={0.6} />
  </svg>
);

export const IconoAtras: React.FC<P> = ({ size = 30, color = COLOR.text }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 18 30">
    <path d="M15 3 L4 15 L15 27" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconoMenu: React.FC<P> = ({ size = 30, color = COLOR.text }) => (
  <svg width={size * 0.3} height={size} viewBox="0 0 9 30">
    {[5, 15, 25].map((y) => (
      <circle key={y} cx={4.5} cy={y} r={3} fill={color} />
    ))}
  </svg>
);

/** globo de mensajes genérico (app de SMS) */
export const IconoSms: React.FC<P> = ({ size = 34, color = COLOR.text }) => (
  <svg width={size} height={size} viewBox="0 0 34 34">
    <rect x={3} y={5} width={28} height={20} rx={6} fill="none" stroke={color} strokeWidth={2.6} />
    <path d="M10 25 L8 31 L16 25" fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" />
  </svg>
);

export const IconoEnviar: React.FC<P> = ({ size = 30, color = COLOR.text }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path d="M15 24 V7 M7 14 L15 6 L23 14" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** «leído» propio del canal: dos rombos pequeños (no la doble tilde de ninguna app real) */
export const IconoLeido: React.FC<P> = ({ size = 22, color = COLOR.muted }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 33 22">
    <rect x={5} y={6} width={9} height={9} transform="rotate(45 9.5 10.5)" fill={color} />
    <rect x={18} y={6} width={9} height={9} transform="rotate(45 22.5 10.5)" fill={color} />
  </svg>
);

export const IconoPersona: React.FC<P> = ({ size = 40, color = COLOR.text }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={14} r={7} fill="none" stroke={color} strokeWidth={3} />
    <path d="M7 35 Q20 18 33 35" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export const IconoGrupo: React.FC<P> = ({ size = 40, color = COLOR.text }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={14} cy={15} r={5.5} fill="none" stroke={color} strokeWidth={2.6} />
    <circle cx={27} cy={15} r={5.5} fill="none" stroke={color} strokeWidth={2.6} />
    <path d="M3 33 Q14 20 24 33" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    <path d="M17 33 Q27 20 37 33" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
  </svg>
);

export const ICONOS: Record<string, React.FC<P>> = {
  casa: IconoCasa,
  verguenza: IconoVerguenza,
};
