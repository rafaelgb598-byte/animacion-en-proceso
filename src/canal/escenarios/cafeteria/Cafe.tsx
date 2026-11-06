import React from "react";

/** Escenario de la cafetería (coordenadas de mundo: 0..2400 × 0..2300, piso en y = 1650). */

export const FLOOR = 1650;
export const COUNTER_TOP = 1300;
export const CHALK = "'Segoe Print', 'Comic Sans MS', cursive";

const L = "#2A2024";

/** Pared del fondo: se dibuja en una capa con parallax. */
export const BackWall: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="lampGlow">
        <stop offset="0" stopColor="#FFE7A8" stopOpacity={0.85} />
        <stop offset="1" stopColor="#FFE7A8" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="outside" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A9DDF0" />
        <stop offset="1" stopColor="#E6F5EC" />
      </linearGradient>
    </defs>
    <rect x={-600} y={-400} width={3600} height={FLOOR + 400} fill="#F2DDBA" />
    {/* empapelado a rayas */}
    {Array.from({ length: 64 }).map((_, i) => (
      <rect key={i} x={-600 + i * 60} y={-400} width={26} height={FLOOR + 400} fill="#EBD2AA" opacity={0.6} />
    ))}
    {/* zócalo de madera */}
    <rect x={-600} y={1240} width={3600} height={FLOOR - 1240} fill="#A8653E" />
    <rect x={-600} y={1232} width={3600} height={16} fill="#7E4528" />
    {Array.from({ length: 20 }).map((_, i) => (
      <rect key={i} x={-560 + i * 190} y={1290} width={150} height={300} rx={8} fill="none" stroke="#8C4F2E" strokeWidth={6} />
    ))}

    {/* puerta de entrada con luz exterior */}
    <rect x={60} y={760} width={360} height={FLOOR - 760} fill="#5B3A29" />
    <rect x={88} y={790} width={304} height={FLOOR - 790} fill="url(#outside)" />
    <rect x={88} y={1380} width={304} height={FLOOR - 1380} fill="#BFD9B4" />
    <rect x={88} y={790} width={304} height={FLOOR - 790} fill="none" stroke={L} strokeWidth={6} />
    {/* hoja de la puerta abierta */}
    <path d={`M 392 790 L 470 760 L 470 ${FLOOR + 30} L 392 ${FLOOR}`} fill="#7A4D33" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M 405 840 L 458 822 L 458 1200 L 405 1210 Z`} fill="#CDEBF5" opacity={0.7} />

    {/* ventana */}
    <rect x={540} y={820} width={300} height={330} rx={14} fill="url(#outside)" stroke={L} strokeWidth={7} />
    <line x1={690} x2={690} y1={820} y2={1150} stroke={L} strokeWidth={7} />
    <line x1={540} x2={840} y1={985} y2={985} stroke={L} strokeWidth={7} />
    <rect x={526} y={1146} width={328} height={20} rx={6} fill="#7E4528" stroke={L} strokeWidth={5} />

    {/* pizarra del menú */}
    <g transform="translate(1000,470)">
      <rect x={0} y={0} width={720} height={420} rx={18} fill="#7A4D33" stroke={L} strokeWidth={7} />
      <rect x={22} y={22} width={676} height={376} rx={8} fill="#2F3B36" />
      <text x={360} y={112} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={78} fill="#F4EFE3">
        CAFÉ
      </text>
      <path d="M 210 140 Q 360 160 510 140" stroke="#F4EFE3" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* garabatos de tiza: no es una interfaz, es una pizarra dibujada */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${130 + i * 230},250)`} opacity={0.85}>
          <path d="M -34 -30 L -26 34 L 26 34 L 34 -30 Z" fill="none" stroke="#F4EFE3" strokeWidth={5} strokeLinejoin="round" />
          <path d="M 34 -14 Q 56 -10 50 10 Q 46 24 30 20" fill="none" stroke="#F4EFE3" strokeWidth={5} />
          <path d={`M -12 -44 Q -2 -58 -12 -72 M 8 -44 Q 18 -58 8 -72`} fill="none" stroke="#F4EFE3" strokeWidth={4} strokeLinecap="round" />
          <path d="M -40 70 L 40 70" stroke="#E9B44C" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      <circle cx={60} cy={360} r={8} fill="#E9B44C" />
      <circle cx={660} cy={60} r={8} fill="#E24E5A" />
    </g>

    {/* estante con frascos */}
    <rect x={1820} y={980} width={520} height={20} rx={6} fill="#7E4528" stroke={L} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${1860 + i * 100},980)`}>
        <rect x={-30} y={-90 - (i % 2) * 20} width={60} height={90 + (i % 2) * 20} rx={12} fill={["#F7EAD0", "#E9B44C", "#F7EAD0", "#C98B5B", "#F7EAD0"][i]} stroke={L} strokeWidth={5} />
        <rect x={-34} y={-104 - (i % 2) * 20} width={68} height={18} rx={6} fill="#8C4F2E" stroke={L} strokeWidth={5} />
      </g>
    ))}

    {/* lámparas colgantes */}
    {[1120, 1600, 2100].map((x, i) => (
      <g key={i}>
        <circle cx={x} cy={520} r={260} fill="url(#lampGlow)" opacity={0.55} />
        <line x1={x} x2={x} y1={-400} y2={360} stroke={L} strokeWidth={5} />
        <path d={`M ${x - 70} 440 Q ${x - 64} 360 ${x} 356 Q ${x + 64} 360 ${x + 70} 440 Z`} fill="#2BB3A3" stroke={L} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={x} cy={444} rx={26} ry={14} fill="#FFF1C2" stroke={L} strokeWidth={5} />
      </g>
    ))}

    {/* planta junto a la puerta */}
    <g transform={`translate(560,${FLOOR})`}>
      {[-40, -15, 10, 35, -60, 55].map((a, i) => (
        <path key={i} d={`M 0 -110 Q ${a * 1.6} ${-220 - (i % 3) * 30} ${a * 2.6} ${-250 - (i % 2) * 40}`} stroke="#3E8E5A" strokeWidth={30} fill="none" strokeLinecap="round" />
      ))}
      <path d="M -70 -120 L 70 -120 L 54 0 L -54 0 Z" fill="#D9734E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-78} y={-136} width={156} height={26} rx={8} fill="#E88A62" stroke={L} strokeWidth={6} />
    </g>
  </g>
);

/** Piso de madera (misma profundidad que el personaje). */
export const Floor: React.FC = () => (
  <g>
    <rect x={-600} y={FLOOR} width={3600} height={900} fill="#7A4E35" />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={-600} x2={3000} y1={FLOOR + 40 + i * i * 14} y2={FLOOR + 40 + i * i * 14} stroke="#684230" strokeWidth={5} />
    ))}
    <rect x={-600} y={FLOOR} width={3600} height={10} fill="#5E3B29" />
  </g>
);

/** Mostrador: la tapa (donde apoyan los vasos) y el frente. */
export const Counter: React.FC = () => (
  <g>
    {/* máquina de espresso al fondo del mostrador */}
    <g transform={`translate(1880,${COUNTER_TOP})`}>
      <rect x={-150} y={-250} width={300} height={250} rx={24} fill="#C9CDD2" stroke={L} strokeWidth={7} />
      <rect x={-150} y={-250} width={300} height={60} rx={20} fill="#E24E5A" stroke={L} strokeWidth={7} />
      <circle cx={-70} cy={-140} r={26} fill="#F4F6F8" stroke={L} strokeWidth={6} />
      <circle cx={10} cy={-140} r={26} fill="#F4F6F8" stroke={L} strokeWidth={6} />
      <rect x={-100} y={-96} width={60} height={30} rx={6} fill="#555B63" stroke={L} strokeWidth={5} />
      <rect x={-20} y={-96} width={60} height={30} rx={6} fill="#555B63" stroke={L} strokeWidth={5} />
      <rect x={-120} y={-20} width={240} height={20} rx={4} fill="#8A9097" stroke={L} strokeWidth={5} />
    </g>
    <rect x={720} y={COUNTER_TOP - 6} width={2400} height={34} rx={8} fill="#F1E4CF" stroke={L} strokeWidth={7} />
    <rect x={740} y={COUNTER_TOP + 28} width={2400} height={FLOOR - COUNTER_TOP - 28} fill="#9C5B34" stroke={L} strokeWidth={7} />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={780 + i * 220} y={COUNTER_TOP + 70} width={180} height={FLOOR - COUNTER_TOP - 120} rx={10} fill="#8A4E2C" stroke="#6E3C21" strokeWidth={6} />
    ))}
  </g>
);

/** Viñeta y luz cálida encima de todo. */
export const Grade: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#2A1408" stopOpacity={0.38} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={w} height={h} fill="url(#vignette)" />
  </g>
);
