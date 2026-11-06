import React from "react";
import { CHALK } from "../decoy/Cafe";

/**
 * Cafetería V2: el mismo set de la V1 con más profundidad.
 * Capas (de atrás hacia adelante): exterior → pared → lámparas → mostrador/personaje → primer término.
 */

export const FLOOR = 1650;
export const COUNTER_TOP = 1300;
const L = "#2A2024";

const DOOR = { x: 88, y: 790, w: 304, h: FLOOR - 790 };
const WIN = { x: 540, y: 820, w: 300, h: 330 };

/* ---------------------------- exterior ---------------------------- */

export const Outside: React.FC<{ f: number }> = ({ f }) => {
  // transeúnte que cruza la calle (solo se ve a través de puerta y ventana)
  const px = 1000 - f * 7.5;
  const step = Math.sin(f * 0.45);
  return (
    <g>
      <defs>
        <linearGradient id="v2sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD6EE" />
          <stop offset="1" stopColor="#E7F4EE" />
        </linearGradient>
      </defs>
      <rect x={-900} y={300} width={2600} height={1500} fill="url(#v2sky)" />
      {/* edificios de enfrente */}
      {[
        [-500, 700, 300, "#E9C9A8"],
        [-160, 640, 260, "#D9B3A0"],
        [140, 720, 320, "#EED6B8"],
        [500, 660, 280, "#D4BCA6"],
        [820, 700, 300, "#E6C4A4"],
      ].map(([x, y, w, c], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height={1500} fill={c as string} />
          {[0, 1, 2].map((r) =>
            [0, 1].map((cI) => (
              <rect
                key={`${r}-${cI}`}
                x={(x as number) + 40 + cI * ((w as number) / 2)}
                y={(y as number) + 60 + r * 150}
                width={(w as number) / 2 - 80}
                height={90}
                rx={6}
                fill="#BFD9E6"
                opacity={0.8}
              />
            )),
          )}
        </g>
      ))}
      {/* árbol */}
      <rect x={300} y={1080} width={30} height={420} fill="#7A5A44" />
      <circle cx={315} cy={1040} r={120} fill="#7DBE8A" />
      <circle cx={250} cy={1090} r={80} fill="#6DAE7B" />
      {/* vereda */}
      <rect x={-900} y={1500} width={2600} height={300} fill="#CFC6B8" />
      <rect x={-900} y={1490} width={2600} height={14} fill="#B8AE9F" />
      {/* transeúnte (silueta) */}
      <g transform={`translate(${px},1500)`} opacity={0.55}>
        <path d={`M -10 0 L ${-6 + step * 14} -120 M 10 0 L ${6 - step * 14} -120`} stroke="#5D6B7A" strokeWidth={22} strokeLinecap="round" />
        <rect x={-34} y={-260} width={68} height={150} rx={30} fill="#5D6B7A" />
        <circle cx={0} cy={-300} r={36} fill="#5D6B7A" />
      </g>
    </g>
  );
};

/* ------------------------------ pared ------------------------------ */

export const BackWallV2: React.FC<{ f: number }> = ({ f }) => {
  const sec = (f / 30) * 6; // segundero
  return (
    <g>
      <defs>
        <mask id="v2holes">
          <rect x={-800} y={-600} width={4000} height={3000} fill="#fff" />
          <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="#000" />
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={14} fill="#000" />
        </mask>
        <linearGradient id="v2wallShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A1E10" stopOpacity={0.28} />
          <stop offset="0.45" stopColor="#3A1E10" stopOpacity={0} />
        </linearGradient>
      </defs>

      <g mask="url(#v2holes)">
        <rect x={-800} y={-600} width={4000} height={FLOOR + 600} fill="#F2DDBA" />
        {Array.from({ length: 70 }).map((_, i) => (
          <rect key={i} x={-800 + i * 60} y={-600} width={26} height={FLOOR + 600} fill="#EBD2AA" opacity={0.6} />
        ))}
        {/* sombra del techo: la pared se oscurece hacia arriba */}
        <rect x={-800} y={-600} width={4000} height={1500} fill="url(#v2wallShade)" />
        <rect x={-800} y={1240} width={4000} height={FLOOR - 1240} fill="#A8653E" />
        <rect x={-800} y={1232} width={4000} height={16} fill="#7E4528" />
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={-760 + i * 190} y={1290} width={150} height={300} rx={8} fill="none" stroke="#8C4F2E" strokeWidth={6} />
        ))}
      </g>

      {/* marco de la puerta y hoja abierta */}
      <rect x={DOOR.x - 28} y={DOOR.y - 30} width={DOOR.w + 56} height={DOOR.h + 30} fill="none" stroke="#5B3A29" strokeWidth={56} />
      <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="none" stroke={L} strokeWidth={6} />
      <path d={`M 392 790 L 470 760 L 470 ${FLOOR + 30} L 392 ${FLOOR}`} fill="#7A4D33" stroke={L} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 405 840 L 458 822 L 458 1200 L 405 1210 Z" fill="#CDEBF5" opacity={0.6} />
      <text x={240} y={760} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={34} fill="#F4EFE3">
        ABIERTO
      </text>

      {/* ventana */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={14} fill="#CDEBF5" opacity={0.18} />
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={14} fill="none" stroke={L} strokeWidth={7} />
      <line x1={690} x2={690} y1={WIN.y} y2={WIN.y + WIN.h} stroke={L} strokeWidth={7} />
      <line x1={WIN.x} x2={WIN.x + WIN.w} y1={985} y2={985} stroke={L} strokeWidth={7} />
      <path d="M 560 840 L 610 840 L 570 900 Z" fill="#fff" opacity={0.5} />
      <rect x={526} y={1146} width={328} height={20} rx={6} fill="#7E4528" stroke={L} strokeWidth={5} />
      {/* toldito */}
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M ${520 + i * 57} 790 L ${577 + i * 57} 790 L ${570 + i * 57} 830 Q ${548 + i * 57} 846 ${527 + i * 57} 830 Z`} fill={i % 2 ? "#F7F3E8" : "#2BB3A3"} stroke={L} strokeWidth={4} />
      ))}

      {/* reloj */}
      <g transform="translate(905,640)">
        <circle r={54} fill="#F7F3E8" stroke={L} strokeWidth={7} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-42} x2={0} y2={-36} stroke={L} strokeWidth={4} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-26} stroke={L} strokeWidth={6} strokeLinecap="round" transform="rotate(300)" />
        <line x1={0} y1={0} x2={0} y2={-36} stroke={L} strokeWidth={5} strokeLinecap="round" transform="rotate(60)" />
        <line x1={0} y1={6} x2={0} y2={-40} stroke="#E24E5A" strokeWidth={2.5} transform={`rotate(${sec})`} />
        <circle r={5} fill={L} />
      </g>

      {/* pizarra del menú (igual que la V1) */}
      <g transform="translate(1000,470)">
        <rect x={0} y={0} width={720} height={420} rx={18} fill="#7A4D33" stroke={L} strokeWidth={7} />
        <rect x={22} y={22} width={676} height={376} rx={8} fill="#2F3B36" />
        <text x={360} y={112} textAnchor="middle" fontFamily={CHALK} fontWeight={700} fontSize={78} fill="#F4EFE3">
          CAFÉ
        </text>
        <path d="M 210 140 Q 360 160 510 140" stroke="#F4EFE3" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${130 + i * 230},250)`} opacity={0.85}>
            <path d="M -34 -30 L -26 34 L 26 34 L 34 -30 Z" fill="none" stroke="#F4EFE3" strokeWidth={5} strokeLinejoin="round" />
            <path d="M 34 -14 Q 56 -10 50 10 Q 46 24 30 20" fill="none" stroke="#F4EFE3" strokeWidth={5} />
            <path d="M -12 -44 Q -2 -58 -12 -72 M 8 -44 Q 18 -58 8 -72" fill="none" stroke="#F4EFE3" strokeWidth={4} strokeLinecap="round" />
            <path d="M -40 70 L 40 70" stroke="#E9B44C" strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={60} cy={360} r={8} fill="#E9B44C" />
        <circle cx={660} cy={60} r={8} fill="#E24E5A" />
      </g>

      {/* estante con frascos */}
      <rect x={1820} y={980} width={620} height={20} rx={6} fill="#7E4528" stroke={L} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(${1860 + i * 100},980)`}>
          <rect x={-30} y={-90 - (i % 2) * 20} width={60} height={90 + (i % 2) * 20} rx={12} fill={["#F7EAD0", "#E9B44C", "#F7EAD0", "#C98B5B", "#F7EAD0", "#9FC9A0"][i]} stroke={L} strokeWidth={5} />
          <rect x={-34} y={-104 - (i % 2) * 20} width={68} height={18} rx={6} fill="#8C4F2E" stroke={L} strokeWidth={5} />
        </g>
      ))}

      {/* planta junto a la puerta */}
      <g transform={`translate(560,${FLOOR})`}>
        {[-40, -15, 10, 35, -60, 55].map((a, i) => (
          <path
            key={i}
            d={`M 0 -110 Q ${a * 1.6} ${-220 - (i % 3) * 30} ${a * 2.6 + Math.sin(f * 0.04 + i) * 3} ${-250 - (i % 2) * 40}`}
            stroke="#3E8E5A"
            strokeWidth={30}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <path d="M -70 -120 L 70 -120 L 54 0 L -54 0 Z" fill="#D9734E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-78} y={-136} width={156} height={26} rx={8} fill="#E88A62" stroke={L} strokeWidth={6} />
      </g>
    </g>
  );
};

/* --------------------------- lámparas ------------------------------ */

export const Lamps: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="v2lampGlow">
        <stop offset="0" stopColor="#FFE7A8" stopOpacity={0.9} />
        <stop offset="1" stopColor="#FFE7A8" stopOpacity={0} />
      </radialGradient>
    </defs>
    {[1120, 1600, 2100].map((x, i) => {
      const sway = Math.sin(f * 0.055 + i * 1.9) * 1.1;
      return (
        <g key={i} transform={`rotate(${sway} ${x} -400)`}>
          <circle cx={x} cy={520} r={280} fill="url(#v2lampGlow)" opacity={0.5} />
          <line x1={x} x2={x} y1={-400} y2={360} stroke={L} strokeWidth={5} />
          <path d={`M ${x - 70} 440 Q ${x - 64} 360 ${x} 356 Q ${x + 64} 360 ${x + 70} 440 Z`} fill="#2BB3A3" stroke={L} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={x} cy={444} rx={26} ry={14} fill="#FFF1C2" stroke={L} strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

/* --------------------------- piso y luz ---------------------------- */

export const FloorV2: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="v2floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6A4330" />
        <stop offset="0.25" stopColor="#7E5137" />
        <stop offset="1" stopColor="#6A4330" />
      </linearGradient>
    </defs>
    <rect x={-800} y={FLOOR} width={4000} height={900} fill="url(#v2floor)" />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={-800} x2={3200} y1={FLOOR + 30 + i * i * 13} y2={FLOOR + 30 + i * i * 13} stroke="#5E3B29" strokeWidth={4} opacity={0.8} />
    ))}
    {Array.from({ length: 24 }).map((_, i) => (
      <line key={i} x1={-700 + i * 170 + (i % 3) * 40} x2={-700 + i * 170 + (i % 3) * 40} y1={FLOOR + 30 + (i % 4) * 26} y2={FLOOR + 82 + (i % 4) * 40} stroke="#5E3B29" strokeWidth={4} opacity={0.6} />
    ))}
    <rect x={-800} y={FLOOR} width={4000} height={10} fill="#4E3021" />
  </g>
);

/** Haz de sol desde la puerta y la ventana, con partículas de polvo. */
export const Sunbeams: React.FC<{ f: number }> = ({ f }) => (
  <g pointerEvents="none">
    <defs>
      <linearGradient id="v2beam" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF6DA" stopOpacity={0.4} />
        <stop offset="1" stopColor="#FFF6DA" stopOpacity={0} />
      </linearGradient>
    </defs>
    <path d={`M 88 800 L 392 800 L 980 ${FLOOR + 120} L 330 ${FLOOR + 120} Z`} fill="url(#v2beam)" opacity={0.55} />
    <path d={`M 540 830 L 840 830 L 1260 1500 L 860 1520 Z`} fill="url(#v2beam)" opacity={0.35} />
    {Array.from({ length: 18 }).map((_, i) => {
      const t = (f * (0.6 + (i % 5) * 0.12) + i * 47) % 600;
      const x = 380 + ((i * 97) % 520) + t * 0.35;
      const y = 900 + ((i * 131) % 700) - t * 0.25 + Math.sin(f * 0.05 + i) * 10;
      return <circle key={i} cx={x} cy={y} r={2.5 + (i % 3)} fill="#FFF6DA" opacity={0.35 + 0.25 * Math.sin(f * 0.07 + i)} />;
    })}
  </g>
);

/* ---------------------------- mostrador ---------------------------- */

const SteamPuff: React.FC<{ f: number; x: number; y: number; period: number; seed: number }> = ({ f, x, y, period, seed }) => {
  const t = ((f + seed * 13) % period) / period;
  return (
    <g opacity={(1 - t) * 0.55}>
      <circle cx={x + Math.sin(t * 6 + seed) * 10} cy={y - t * 140} r={14 + t * 30} fill="#FFFFFF" />
      <circle cx={x + 18 + Math.sin(t * 5 + seed) * 8} cy={y - 20 - t * 120} r={10 + t * 22} fill="#FFFFFF" />
    </g>
  );
};

export const CounterV2: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* máquina de espresso con vapor */}
    <g transform={`translate(1900,${COUNTER_TOP})`}>
      <rect x={-150} y={-250} width={300} height={250} rx={24} fill="#C9CDD2" stroke={L} strokeWidth={7} />
      <rect x={-150} y={-250} width={300} height={60} rx={20} fill="#E24E5A" stroke={L} strokeWidth={7} />
      <rect x={-128} y={-176} width={50} height={150} rx={10} fill="#fff" opacity={0.35} />
      <circle cx={-70} cy={-140} r={26} fill="#F4F6F8" stroke={L} strokeWidth={6} />
      <circle cx={10} cy={-140} r={26} fill="#F4F6F8" stroke={L} strokeWidth={6} />
      <rect x={-100} y={-96} width={60} height={30} rx={6} fill="#555B63" stroke={L} strokeWidth={5} />
      <rect x={-20} y={-96} width={60} height={30} rx={6} fill="#555B63" stroke={L} strokeWidth={5} />
      <rect x={-120} y={-20} width={240} height={20} rx={4} fill="#8A9097" stroke={L} strokeWidth={5} />
      <SteamPuff f={f} x={-110} y={-260} period={70} seed={1} />
      <SteamPuff f={f} x={-90} y={-260} period={70} seed={4} />
    </g>
    {/* tapa y frente del mostrador */}
    <rect x={720} y={COUNTER_TOP - 6} width={2600} height={34} rx={8} fill="#F1E4CF" stroke={L} strokeWidth={7} />
    <rect x={720} y={COUNTER_TOP + 3} width={2600} height={8} fill="#fff" opacity={0.5} />
    <rect x={740} y={COUNTER_TOP + 28} width={2600} height={FLOOR - COUNTER_TOP - 28} fill="#9C5B34" stroke={L} strokeWidth={7} />
    <rect x={740} y={COUNTER_TOP + 28} width={2600} height={26} fill="#5E3420" opacity={0.35} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={780 + i * 220} y={COUNTER_TOP + 70} width={180} height={FLOOR - COUNTER_TOP - 120} rx={10} fill="#8A4E2C" stroke="#6E3C21" strokeWidth={6} />
    ))}
    {/* zócalo del mostrador */}
    <rect x={740} y={FLOOR - 26} width={2600} height={26} fill="#5E3420" />
    {/* objetos sobre el mostrador */}
    <g transform={`translate(1600,${COUNTER_TOP})`}>
      <rect x={-40} y={-70} width={80} height={70} rx={8} fill="#C9CDD2" stroke={L} strokeWidth={5} />
      {[-22, -8, 6, 20].map((x, i) => (
        <rect key={i} x={x - 6} y={-96 + (i % 2) * 6} width={12} height={34} rx={2} fill="#FFFFFF" stroke={L} strokeWidth={3} />
      ))}
    </g>
    <g transform={`translate(1700,${COUNTER_TOP})`}>
      <path d="M -30 0 L -34 -80 Q 0 -96 34 -80 L 30 0 Z" fill="#E8F3F6" opacity={0.85} stroke={L} strokeWidth={5} />
      <rect x={-22} y={-50} width={44} height={46} fill="#F7F3E8" />
      <rect x={-18} y={-104} width={36} height={22} rx={6} fill="#C9CDD2" stroke={L} strokeWidth={5} />
    </g>
    <g transform={`translate(2180,${COUNTER_TOP})`}>
      <ellipse cx={0} cy={-4} rx={110} ry={12} fill="#C9CDD2" stroke={L} strokeWidth={5} />
      <path d="M -70 -10 Q -64 -60 0 -62 Q 64 -60 70 -10 Z" fill="#E9B44C" stroke={L} strokeWidth={5} />
      <path d="M -96 -6 Q -100 -150 0 -154 Q 100 -150 96 -6" fill="#E8F3F6" opacity={0.45} stroke={L} strokeWidth={5} />
      <circle cx={0} cy={-164} r={12} fill="#C9CDD2" stroke={L} strokeWidth={5} />
    </g>
  </g>
);

/* ------------------------- primer término -------------------------- */

/** Mesa y silla en primer término (desenfocadas): el personaje pasa por detrás. */
export const Foreground: React.FC = () => (
  <g>
    {/* silla */}
    <g transform="translate(130,1720)">
      <rect x={-20} y={-300} width={26} height={520} rx={10} fill="#4A2C1E" />
      <rect x={110} y={-300} width={26} height={520} rx={10} fill="#4A2C1E" />
      <rect x={-30} y={-320} width={176} height={36} rx={14} fill="#5B3A29" />
      <rect x={-30} y={-200} width={176} height={28} rx={12} fill="#5B3A29" />
      <rect x={-50} y={0} width={240} height={36} rx={12} fill="#6E4630" />
    </g>
    {/* mesa redonda con una taza */}
    <g transform="translate(470,1760)">
      <rect x={-14} y={0} width={28} height={420} fill="#2E2A2C" />
      <ellipse cx={0} cy={0} rx={190} ry={30} fill="#3D3436" />
      <ellipse cx={0} cy={-6} rx={190} ry={26} fill="#5C5052" />
      <g transform="translate(-40,-14)">
        <path d="M -30 0 L -26 -50 L 26 -50 L 30 0 Z" fill="#F7F3E8" />
        <path d="M 28 -40 Q 50 -36 46 -16 Q 42 -4 28 -8" stroke="#F7F3E8" strokeWidth={9} fill="none" />
        <ellipse cx={0} cy={2} rx={46} ry={8} fill="#E6DCCB" />
      </g>
    </g>
  </g>
);

/* ------------------------------ grade ------------------------------ */

export const GradeV2: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="v2vignette" cx="0.5" cy="0.42" r="0.78">
        <stop offset="0.5" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#2A1408" stopOpacity={0.42} />
      </radialGradient>
      <linearGradient id="v2warm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD9A0" stopOpacity={0.12} />
        <stop offset="1" stopColor="#7A3E1C" stopOpacity={0.08} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={w} height={h} fill="url(#v2warm)" />
    <rect x={0} y={0} width={w} height={h} fill="url(#v2vignette)" />
  </g>
);
