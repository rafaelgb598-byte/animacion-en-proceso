// Fuente de verdad de las ÚNICAS tres cifras publicadas en el Short (sección 7).
// Son tiempos de descomposición de residuos a la intemperie. Todo lo demás es ilustrativo (ver decay.ts).

export const SOURCED_FIGURES = {
  aluminum: {
    label: "aluminio · 200 a 500 años",
    figure: "200–500 años (latas, intemperie)",
    sources: ["Milton Keynes Council, «Litter breakdown times»"],
  },
  pet: {
    label: "PET · ~450 años",
    figure: "450 años",
    sources: ["Milton Keynes Council, «Litter breakdown times»", "SurferToday"],
  },
  glass: {
    label: "~1.000.000 de años",
    figure: "1.000.000 de años",
    sources: ["South Carolina DNR, «How Long Does It Take»"],
  },
} as const;

export const SOURCE_URLS = [
  "https://dnr.sc.gov/up2u/decompose.html",
  "https://www.milton-keynes.gov.uk/sites/default/files/2022-02/Litter%20breakdown%20poster%20PAA.pdf",
  "https://www.surfertoday.com/environment/the-estimated-decomposition-rates-of-common-marine-debris-items",
] as const;

export const NOTA =
  "El vidrio de los celulares es aluminosilicato templado, no vidrio de botella; la carta usa la cifra general " +
  "del vidrio y la leyenda «estimaciones» cubre esa simplificación. Las curvas de deterioro del resto de los " +
  "objetos son de proceso e ilustrativas.";
