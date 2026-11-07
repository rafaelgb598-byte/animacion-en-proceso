// Motor del canal Despiece: todo lo que un episodio necesita y no depende de su objeto.
// Un episodio nuevo = su objeto SVG + data.json + timeline.ts + script.ts (+ la composición que los une).
export { CutLine, cutLineSchema } from "./CutLine";
export { SectionSplit, sectionSplitSchema } from "./SectionSplit";
export { Callout, calloutSchema } from "./Callout";
export { Dimension, dimensionSchema } from "./Dimension";
export { Spring, springSchema, Pin, pinSchema, Gear, gearSchema } from "./Mecanica";
export { Highlight, highlightSchema, Resaltable, useResalte } from "./Highlight";
export { TeaserChip, teaserChipSchema } from "./TeaserChip";
export { DespieceEpisode, episodioSchema, capaSchema, Cuadricula, GuiasZonaSegura, FUENTE_SUBS_DESPIECE } from "./DespieceEpisode";
export type { Capa, CueSfx, CueVoz, DespieceEpisodeProps } from "./DespieceEpisode";
export { HojaContactos, hojaTam, HOJA } from "./HojaContactos";
export { largo, puntoEn, polilinea, punto } from "./geom";
export type { Punto } from "./geom";
