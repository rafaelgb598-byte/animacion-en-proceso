import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";

/**
 * Estilo de los subtítulos del canal (aprobado): MAYÚSCULAS, 70 px, peso 900, contorno 14 px #2A2024, blanco.
 * La fuente se carga de Google Fonts (igual en todas las máquinas); ver BIBLIOTECA.md § Subtítulos.
 */

export const TAM = 70;
export const INTERLINEA = 1.22;
export const CONTORNO = 14;
export const ESPACIO = 18 / 70; // separación entre palabras, en em
export const LETRA_ESPACIADO = -1; // px
export const ESCALA_ACTIVA = 1.04; // la palabra que suena (karaoke, sin color)
export const OPACIDAD_RESTO = 0.78;
/** pico de la animación de entrada (0,86 → 1 con rebote): max de snap(0, 0.01, 4.5, 1,6π) */
export const ESCALA_ENTRADA_MAX = 1.0123;
export const ESCALA_MIN = 0.8; // si un renglón no entra, la letra se achica hasta acá
export const COLOR = { texto: "#FFFFFF", contorno: "#2A2024", enfasis: "#FFD84A" };
export const SERIF = "Georgia, 'Times New Roman', serif";

export type Fuente = { familia: string; listo: () => Promise<unknown> };

const montserrat = loadMontserrat("normal", { weights: ["900"], subsets: ["latin", "latin-ext"] });
const interTight = loadInterTight("normal", { weights: ["900"], subsets: ["latin", "latin-ext"] });

export const FUENTES: Record<"montserrat" | "interTight" | "segoe", Fuente> = {
  montserrat: { familia: montserrat.fontFamily, listo: montserrat.waitUntilDone },
  interTight: { familia: interTight.fontFamily, listo: interTight.waitUntilDone },
  /** la de antes: depende de la máquina (solo para comparar) */
  segoe: { familia: "Segoe UI Black", listo: () => Promise.resolve() },
};

/**
 * La fuente elegida: Inter Tight 900. Es la más parecida a la Segoe UI Black aprobada (mismo ancho y proporción,
 * letras angostas y peso), así que los renglones entran igual. Montserrat 900 es más ancha y geométrica.
 * Comparación: videosPrueba/GiroDato/qa/subtitulos-fuentes/compara-fuentes-f100.png (composición ComparaFuentes).
 */
export const FUENTE_SUBTITULOS = FUENTES.interTight;
