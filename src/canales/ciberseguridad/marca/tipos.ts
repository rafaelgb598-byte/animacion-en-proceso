// Modelo de datos de la serie «Anatomía de una estafa». La plantilla (AnatomiaEstafa) solo lee esto:
// un episodio nuevo es una carpeta con timeline.ts + escena.ts + i18n/{es,en}.ts (y, como mucho, un componente).
import type { Palabra } from "../../../canal/subtitulos/tipos";

export type Lang = "es" | "en";
export type Capa = "todo" | "subtitulos" | "escena" | "fondo";

/**
 * Texto enriquecido de la app de chat:
 * - `\n` = salto de renglón decidido a mano (los renglones no dependen de la máquina);
 * - `[frase]` = frase que un marcador puede señalar (se subraya en amarillo cuando su marcador está puesto);
 * - `{icono}` = ícono dibujado en SVG (nunca emojis del sistema).
 */
export type Rich = string;

export type MensajeChat = {
  id: string;
  de: "ellos" | "yo";
  texto: Rich;
  hora: string;
  /** frame de ESCENA en que aparece (ver `TimelineBase.escena`) */
  f: number;
  /** frame de escena desde el que se ve «escribiendo…» antes del mensaje */
  escribiendo?: number;
};

export type Notificacion = {
  app: string;
  cuando: string;
  texto: Rich;
  /** código con botón «Copiar» (CodeChip) */
  codigo?: { valor: string; copiar: string; copiado: string };
  /** renglón después del código */
  pie?: Rich;
  f: number;
};

export type Toque = { f: number; x: number; y: number; /** desde dónde llega el dedo */ desde?: { x: number; y: number } };

/** Marcador de evidencia: número, a qué apunta (id de mensaje, "notificacion" o "cabecera") y cuándo cae. */
export type Marcador = { n: number; objetivo: string; f: number; /** índice de la frase [ ] marcada dentro del mensaje */ frase?: number };

export type NodoGrafo = { id: string; etiqueta: string; x: number; y: number; f: number; icono?: "persona" | "grupo" };

export type BloqueVoz = {
  id: string;
  /** frame de inicio en el video */
  f: number;
  /** lo que se envía a la API (números en palabras) */
  dicho: string;
  /** lo que muestran los subtítulos */
  escrito: string;
  /** palabras con tiempos reales (alineación de ElevenLabs, segundos desde el inicio del bloque); null = planificadas */
  palabras: Palabra[] | null;
  /** archivo de audio (relativo a public/) o null si todavía no hay voz */
  audio: string | null;
  duracion: number | null;
};

export type CueSfx = { id: string; f: number; archivo: string; volumen: number; dur?: number };

/** Todo lo que la plantilla necesita de un episodio (ya resuelto para un idioma). */
export type Episodio = {
  lang: Lang;
  duracion: number;
  caso: { numero: string; siguiente: string; siguienteTitulo: string };
  etiquetas: { recreacion: string; rebobinando: string };
  /** tiempo de escena: el rebobinado hace retroceder la pantalla */
  escena: (f: number) => number;
  camara: { escala: readonly { f: number; v: number }[]; inclinacion: readonly { f: number; v: number }[]; x: readonly { f: number; v: number }[]; y: readonly { f: number; v: number }[] };
  deriva: { ax: number; px: number; ay: number; py: number };
  /** posición del teléfono principal sobre la mesa (x del centro) */
  telefonoX: readonly { f: number; v: number }[];
  gancho: { pregunta: string; opciones: readonly [string, string]; visible: (f: number) => number; elegida: { f: number; indice: number } };
  telefono: {
    hora: string;
    contacto: string;
    estado: string;
    inicial: string;
    notificacion: Notificacion;
    mensajes: MensajeChat[];
    entrada: { placeholder: string; pegado: string; fPegado: number; fEnviado: number };
    toques: Toque[];
    dedo: { desde: number; hasta: number; ruta: readonly { f: number; x: number; y: number }[] };
  };
  perdida: { f: number; hasta: number; banner: string; sello: string };
  rebobinado: { f: number; hasta: number; desde: string; a: string };
  marcadores: Marcador[];
  marcadoresSalen: number;
  segundoTelefono: {
    entra: number;
    sale: number;
    titulo: string;
    numero: string;
    codigo: string;
    fCodigo: number;
    grupo: { f: number; nombre: string; mensaje: Rich; autor: string; hora: string };
    candado: number;
    posicion: readonly { f: number; x: number; y: number; s: number }[];
  };
  enlace: { f: number; hasta: number; etiqueta: string };
  grafo: { f: number; hasta: number; nodos: NodoGrafo[]; aristas: readonly [string, string][]; titulo: string };
  vidrio: { f: number; hasta: number; etiqueta: string };
  defensa: { f: number; hasta: number; titulo: string; ruta: string; ajuste: string; detalle: string; fToggle: number };
  ficha: { f: number; hasta: number; titulo: string; lineas: string[] };
  cierre: { f: number; hasta: number; cabecera: string; siguiente: string };
  voz: BloqueVoz[];
  subtitulos: { enfasis: string[]; remates: string[]; visible: (f: number) => boolean };
  sfx: CueSfx[];
  ambiente: { archivo: string; volumen: number };
  /** ganancia de la voz en la mezcla (objetivo ≈ −14 LUFS integrados, medido en el MP4) */
  vozVolumen: number;
  sponsor: { nombre: string; claim: string; activo: boolean; f: number; hasta: number; etiqueta: string; plantilla: string };
};
