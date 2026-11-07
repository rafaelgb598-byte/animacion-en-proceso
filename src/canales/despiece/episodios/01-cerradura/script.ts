// Episodio 01 · «¿Cómo sabe tu cerradura que es TU llave?» — guion (voz de Matías) y textos en pantalla.
// Borrador v4 del arranque, recortado para entrar en 34–38 s a ritmo natural (desvío anotado en ENTREGA.md).
// La copia de lectura humana está en guiones/Despiece/01-cerradura/guion.json.
import type { BloqueVoz } from "../../marca/voz";
import vozReal from "./vozReal.json";

export const VOZ_IDS = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"] as const;
export type VozId = (typeof VOZ_IDS)[number];

const TEXTO: Record<VozId, string> = {
  v1: "¿Cómo sabe tu cerradura que esta es TU llave?",
  v2: "Abrámosla.",
  v3: "Adentro, un cilindro tiene que girar. Lo traban estas columnas de pernos con resortes.",
  v4: "Cada columna está partida en dos, a una altura distinta.",
  v5: "El truco: tu llave no abre nada. Solo sube cada columna a la altura justa.",
  v6: "Cuando todos los cortes tocan esta línea, el cilindro queda libre.",
  v7: "Con otra llave, basta una sola columna corrida y no gira.",
  v8: "Tu llave no es una llave: es una contraseña de alturas.",
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
  pregunta: ["¿Cómo sabe que", "es TU llave?"],
  rotulos: { carcasa: "Carcasa", resortes: "Resortes", rotor: "Rotor", pernos: "Pernos", contra: "Contra-\nperno", perno: "Perno", linea: "Línea\nde corte" },
  final: "TU LLAVE",
} as const;

/** subtítulos: sin énfasis (el naranja es solo de la línea de corte y el QA solo detecta amarillo) */
export const SUBS = { enfasis: [] as string[], remates: ["Abrámosla."] };
