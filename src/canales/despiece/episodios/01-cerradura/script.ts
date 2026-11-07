// Episodio 01 · «Tu llave es una contraseña» — guion v2 (voz de Matías) y textos en pantalla.
// Guion del documento v5 con 2 ajustes de largo (frases 3 y 4; anotados en ENTREGA.md). Frases 1 y 10 = las del loop.
// La copia de lectura humana está en guiones/Despiece/01-cerradura/guion.json.
import type { BloqueVoz } from "../../marca/voz";
import vozReal from "./vozReal.json";

export const VOZ_IDS = ["v01", "v02", "v03", "v04", "v05", "v06", "v07", "v08", "v09", "v10"] as const;
export type VozId = (typeof VOZ_IDS)[number];

export const TEXTO: Record<VozId, string> = {
  v01: "Tu llave tiene una contraseña escondida.",
  v02: "Mirá.",
  v03: "Adentro, el cilindro lo traban columnas de pernos, empujadas por resortes.",
  v04: "Cada columna está partida en dos, y cada corte, a otra altura.",
  v05: "Los dientes de tu llave no abren nada: solo suben cada columna a la altura justa.",
  v06: "Cuando todos los cortes tocan esta línea…",
  v07: "…el cilindro gira.",
  v08: "¿Y cuál de estas abre?",
  v09: "Basta una sola columna corrida… y no gira.",
  v10: "Tu llave no es una llave: es una contraseña de alturas.",
};

type Real = Partial<Record<VozId, { duracion: number; palabras: { t: string; s: number; e: number }[]; audio: string }>>;
const REAL = vozReal as Real;

/** bloques de voz: con `vozReal.json` vacío, las palabras se planifican (borrador sin voz) */
export const bloques = (conVoz: boolean): BloqueVoz[] =>
  VOZ_IDS.map((id) => {
    const r = conVoz ? REAL[id] : undefined;
    return { id, dicho: TEXTO[id], escrito: TEXTO[id], palabras: r?.palabras ?? null, duracion: r?.duracion ?? null, audio: r?.audio ?? null };
  });

export const HAY_VOZ_REAL = VOZ_IDS.every((id) => Boolean(REAL[id]));

/** textos en pantalla (no repiten la voz palabra por palabra) */
export const PANTALLA = {
  gancho: ["Tu llave tiene", "una contraseña"],
  rotulos: { contra: "Contra-\nperno", perno: "Perno", linea: "Línea\nde corte" },
  cual: "¿Cuál abre?",
  final: "TU LLAVE",
} as const;

/** subtítulos: sin énfasis (el naranja es solo de la línea de corte y el QA solo detecta amarillo) */
export const SUBS = { enfasis: [] as string[], remates: ["Mirá."] };
