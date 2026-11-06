import React from "react";
import { MAT } from "../../theme";

/** Fondo de pantalla: golden retriever vectorial original (8 formas), sin texto ni íconos de interfaz. */
export const DogScreen: React.FC<{ w: number; h: number; id: string }> = ({ w, h, id }) => (
  <svg width={w} height={h} viewBox="0 0 184 394" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={MAT.dogBg} />
        <stop offset="1" stopColor={MAT.dogBgLow} />
      </linearGradient>
    </defs>
    <rect width={184} height={394} fill={`url(#${id}-bg)`} />
    {/* cuerpo */}
    <ellipse cx={92} cy={350} rx={86} ry={92} fill={MAT.dogFur} />
    {/* orejas */}
    <ellipse cx={48} cy={205} rx={24} ry={50} fill={MAT.dogFurDark} transform="rotate(18 48 205)" />
    <ellipse cx={136} cy={205} rx={24} ry={50} fill={MAT.dogFurDark} transform="rotate(-18 136 205)" />
    {/* cabeza */}
    <ellipse cx={92} cy={200} rx={50} ry={56} fill={MAT.dogFur} />
    {/* hocico */}
    <ellipse cx={92} cy={232} rx={30} ry={24} fill={MAT.dogBgLow} opacity={0.55} />
    {/* nariz */}
    <ellipse cx={92} cy={222} rx={11} ry={8} fill={MAT.dogNose} />
    {/* ojos */}
    <circle cx={72} cy={192} r={5.5} fill={MAT.dogNose} />
    <circle cx={112} cy={192} r={5.5} fill={MAT.dogNose} />
  </svg>
);
