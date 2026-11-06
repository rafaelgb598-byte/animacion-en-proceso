/**
 * Zona segura de los Shorts del canal: ÚNICA fuente de verdad.
 * La importan los subtítulos, los layouts, el QA (`scripts/qa-subtitulos.mjs`) y la citan CLAUDE.md y BIBLIOTECA.md.
 * Lienzo 1080 × 1920.
 */
export const LIENZO = { w: 1080, h: 1920 };
/** nada clave fuera de acá (abajo y a la derecha está la interfaz de YouTube Shorts) */
export const ZONA = { top: 240, bottom: 1536, left: 60, right: 900 };
/** TODO texto centrado usa este centro (nunca el medio de la zona asimétrica) */
export const CENTRO_X = 540;
/** 180–900: simétrico respecto de 540 y respeta right = 900 */
export const ANCHO_TEXTO_MAX = 720;
/** el bloque de subtítulos se apoya en y = 1500 y crece hacia arriba hasta 2 renglones; nunca sube */
export const CARRIL = { bottom: 1500, maxLineas: 2 };
