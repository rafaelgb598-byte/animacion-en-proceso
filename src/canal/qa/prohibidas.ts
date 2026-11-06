/**
 * Palabras que nunca pueden verse en un video del canal (búsqueda sin distinguir mayúsculas).
 * La usa `scripts/qa-subtitulos.mjs` sobre los textos visibles del render y sobre src/, guiones/ y BIBLIOTECA.md.
 * La cita del estudio de 1982 es «Huber et al. · 1982» (nunca el tercer apellido).
 */
export const PROHIBIDAS: string[] = ["Puto"];
