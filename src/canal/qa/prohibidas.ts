/**
 * Palabras que nunca pueden verse en un video del canal (búsqueda sin distinguir mayúsculas).
 * La usa `scripts/qa-subtitulos.mjs` sobre los textos visibles del render y sobre src/, guiones/ y BIBLIOTECA.md.
 * La cita del estudio de 1982 es «Huber et al. · 1982» (nunca el tercer apellido).
 */
export const PROHIBIDAS: string[] = ["Puto"];

/**
 * Listas «solo pantalla» por canal: se buscan en todo el texto visible MENOS los subtítulos (la voz sí puede
 * nombrarlas) y como palabra entera. Las usa `scripts/qa-subtitulos.mjs` cuando la composición declara su canal.
 * Ciberseguridad: ninguna app, banco ni billetera real en la imagen (la palabra «WhatsApp» va solo en la voz).
 * Formato JSON estricto (lo lee el QA con JSON.parse).
 */
export const PROHIBIDAS_PANTALLA: Record<string, string[]> = {
  "ciberseguridad": ["WhatsApp", "Telegram", "Signal", "Messenger", "Mercado Pago", "MercadoPago", "Ualá", "Brubank", "Naranja X", "Santander", "BBVA", "Galicia", "Banco Nación", "Macro", "Bizum", "CaixaBank", "Revolut", "Nequi", "Daviplata", "Yape", "Plin", "Zelle", "Venmo", "PayPal", "Cash App", "Western Union"]
};
