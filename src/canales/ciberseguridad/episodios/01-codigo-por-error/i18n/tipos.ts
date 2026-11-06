/** Todos los textos visibles y dichos del episodio 01 (uno por idioma: es.ts / en.ts). */
export type Textos = {
  recreacion: string;
  caso: string;
  siguiente: string;
  rebobinando: string;
  gancho: { pregunta: string; opciones: readonly [string, string] };
  telefono: { hora: string; contacto: string; estado: string; inicial: string; placeholder: string };
  notificacion: { app: string; cuando: string; texto: string; codigo: string; copiar: string; copiado: string; pie: string };
  mensajes: { b1: string; b2: string; enviado: string; horas: readonly [string, string, string] };
  perdida: { banner: string; sello: string };
  segundo: { titulo: string; numero: string; grupo: string; mensaje: string; autor: string; hora: string };
  grafo: { titulo: string; caro: string; tu: string; familia: string; voley: string };
  vidrio: string;
  defensa: { titulo: string; ruta: string; ajuste: string; detalle: string };
  ficha: { titulo: string; lineas: string[] };
  cierre: { cabecera: string; siguiente: string };
  sponsor: { plantilla: string; etiqueta: string };
  /** voz: `dicho` = lo que se manda a la API; `escrito` = lo que muestran los subtítulos (si difiere) */
  voz: Record<"v01" | "v02" | "v03" | "v04" | "v05" | "v06" | "v07" | "v08" | "v09" | "v10" | "v11" | "v12", { dicho: string; escrito?: string }>;
  enfasis: string[];
  remates: string[];
};
